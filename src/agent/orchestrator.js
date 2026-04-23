// Agent orchestrator.
//
// Calls Claude via the Supabase Edge Function (`/functions/v1/agent`),
// streams tokens back, and turns `tool_use` events into "pending screen"
// objects the simulator UI renders. When the user interacts with a
// screen, the simulator submits the result here and we push another
// turn to Claude.
//
// The orchestrator is intentionally a plain JS class (not a React
// component) so it owns the full conversation state and exposes
// callbacks the UI subscribes to.

import { BUCKET as _BUCKET, supabase } from '../lib/supabase.js';
import { AGENT_TOOLS, TOOL_FAMILY } from './tools.js';
import { buildSystemPrompt } from './prompts.js';

const FUNCTION_NAME = 'agent';

/**
 * @typedef {Object} AgentEvent
 * @property {'thinking'|'reasoning'|'tool_use'|'final'|'error'|'complete'} type
 * @property {string} [text]
 * @property {{ id: string, name: string, input: any }} [tool]
 * @property {any} [final]
 * @property {string} [error]
 */

export class AgentOrchestrator {
  constructor({
    device = 'mobile',
    softCap = 12,
    model = 'claude-sonnet-4-5',
    sessionLead = null,
    onEvent = () => {},
  } = {}) {
    this.device = device;
    this.softCap = softCap;
    this.model = model;
    this.sessionLead = sessionLead;
    this.onEvent = onEvent;

    // Conversation state
    this.messages = [];       // Anthropic message history
    this.interactions = 0;    // user turns counted
    this.toolHistory = [];    // { name, input } per tool call
    this.signals = {};        // accumulated capture (free-form)
    this.aborted = false;

    this.system = buildSystemPrompt({ softCap, device, sessionLead });
  }

  /** Kick off the first turn. Claude opens with reasoning + a tool call. */
  async start() {
    this.messages = [
      {
        role: 'user',
        content:
          'Begin the onboarding. I just landed on the welcome screen. Pick the first screen to show me.',
      },
    ];
    return this._runTurn();
  }

  /**
   * The simulator calls this after the user interacts with the screen
   * Claude last showed. `result` is whatever the tool returned — e.g.
   * `{ swiped: 'yes', tags: ['tailored'] }` for a swipe card.
   *
   * Special case: AR layer results include an `image_base64` payload.
   * We strip that out of the text tool_result and attach it as a
   * separate image content block so Claude's vision model can analyze
   * it on the next turn.
   */
  async submitToolResult({ toolUseId, toolName, result }) {
    if (!toolUseId) {
      throw new Error('submitToolResult requires toolUseId');
    }
    this.interactions += 1;
    this.toolHistory.push({ name: toolName, input: result });

    // Merge captured signals for convenience (also visible in the UI)
    this.signals = mergeSignals(this.signals, toolName, result);

    // Detect AR image payload. Keep the structured summary in
    // tool_result text and hand Claude the frame as an image block.
    const imagePayload = extractImagePayload(result);
    const textResult = summarizeResultForAgent(toolName, result);

    const content = [
      {
        type: 'tool_result',
        tool_use_id: toolUseId,
        content: textResult,
      },
    ];

    if (imagePayload) {
      // Anthropic only accepts one of these four media types. Coerce
      // anything else (HEIC from iOS, AVIF, empty string, …) to the
      // nearest sane default. Belt-and-suspenders — the upload path
      // already re-encodes to JPEG.
      const ALLOWED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const mt = ALLOWED.includes(imagePayload.mediaType)
        ? imagePayload.mediaType
        : 'image/jpeg';
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mt,
          data: imagePayload.base64,
        },
      });
      content.push({
        type: 'text',
        text:
          'The attached image is the AR frame the user just captured. ' +
          'Use your vision to note silhouette, proportions, and any fit ' +
          'signals you can read — but return control by calling the next ' +
          'tool (e.g., continue to budget or conclude_with_persona).',
      });
    }

    this.messages.push({ role: 'user', content });
    return this._runTurn();
  }

  abort() {
    this.aborted = true;
  }

  // --- internals --------------------------------------------------------

  async _runTurn() {
    if (this.aborted) return;
    this.onEvent({ type: 'thinking' });

    const body = {
      model: this.model,
      max_tokens: 1024,
      stream: true,
      system: this.system,
      tools: AGENT_TOOLS,
      messages: this.messages,
    };

    let assistantContent = [];
    let currentText = '';
    let currentTool = null;
    let currentToolJson = '';
    let stopReason = null;

    try {
      const url = functionUrl(FUNCTION_NAME);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey()}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errText = await safeText(res);
        throw new Error(`Agent proxy ${res.status}: ${errText.slice(0, 300)}`);
      }

      // Consume the SSE stream. Each event is a JSON payload on a
      // `data: …` line. The Anthropic streaming protocol fires:
      //   message_start, content_block_start, content_block_delta,
      //   content_block_stop, message_delta, message_stop.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIdx;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          const rawLine = buffer.slice(0, newlineIdx).trim();
          buffer = buffer.slice(newlineIdx + 1);
          if (!rawLine.startsWith('data:')) continue;
          const payload = rawLine.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          let event;
          try {
            event = JSON.parse(payload);
          } catch {
            continue;
          }

          if (event.type === 'content_block_start') {
            const block = event.content_block;
            if (block.type === 'text') {
              currentText = '';
            } else if (block.type === 'tool_use') {
              currentTool = {
                id: block.id,
                name: block.name,
                input: {},
              };
              currentToolJson = '';
            }
          } else if (event.type === 'content_block_delta') {
            const d = event.delta;
            if (d.type === 'text_delta') {
              currentText += d.text;
              this.onEvent({ type: 'reasoning', text: d.text });
            } else if (d.type === 'input_json_delta') {
              currentToolJson += d.partial_json || '';
            }
          } else if (event.type === 'content_block_stop') {
            if (currentTool) {
              try {
                currentTool.input = JSON.parse(currentToolJson || '{}');
              } catch {
                currentTool.input = {};
              }
              assistantContent.push({
                type: 'tool_use',
                id: currentTool.id,
                name: currentTool.name,
                input: currentTool.input,
              });
              this.onEvent({ type: 'tool_use', tool: currentTool });
              currentTool = null;
              currentToolJson = '';
            } else if (currentText) {
              assistantContent.push({
                type: 'text',
                text: currentText,
              });
              currentText = '';
            }
          } else if (event.type === 'message_delta') {
            if (event.delta?.stop_reason) {
              stopReason = event.delta.stop_reason;
            }
          }
        }
      }
    } catch (err) {
      this.onEvent({
        type: 'error',
        error: err?.message || String(err),
      });
      return;
    }

    // Persist the assistant turn in history so the next tool_result
    // can reference tool_use_ids properly.
    if (assistantContent.length > 0) {
      this.messages.push({
        role: 'assistant',
        content: assistantContent,
      });
    }

    // Did the turn end with a conclude_with_persona call?
    const conclude = assistantContent.find(
      (c) => c.type === 'tool_use' && c.name === 'conclude_with_persona',
    );
    if (conclude) {
      this.onEvent({
        type: 'complete',
        final: {
          toolUseId: conclude.id,
          ...conclude.input,
        },
      });
      return;
    }

    // Stop reasons other than tool_use mean we need to finalize (e.g.
    // the agent surrendered with text only). Treat as complete.
    if (stopReason && stopReason !== 'tool_use') {
      this.onEvent({
        type: 'final',
        final: { stopReason, content: assistantContent },
      });
    }
  }
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

function supabaseAnonKey() {
  return (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    (globalThis.__DAYONE_CONFIG__?.anonKey ?? '')
  );
}

function supabaseUrl() {
  return (
    import.meta.env.VITE_SUPABASE_URL ||
    (globalThis.__DAYONE_CONFIG__?.supabaseUrl ?? '')
  );
}

function functionUrl(name) {
  const base = supabaseUrl();
  if (!base) throw new Error('VITE_SUPABASE_URL not configured.');
  return `${base.replace(/\/$/, '')}/functions/v1/${name}`;
}

async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return '';
  }
}

/** Strip any base64 image payload out of a tool result, if present. */
function extractImagePayload(result) {
  if (!result || typeof result !== 'object') return null;
  if (result.image_base64 && result.image_media_type) {
    return {
      base64: result.image_base64,
      mediaType: result.image_media_type,
    };
  }
  return null;
}

/** Build a compact JSON summary Claude can read — without the image blob. */
function summarizeResultForAgent(toolName, result) {
  if (!result) return '{}';
  // Drop image fields from the text blob so we don't waste context on them
  const { image_base64, image_media_type, ...rest } = result;
  return JSON.stringify({ tool: toolName, result: rest });
}

/** Accumulate human-readable signals so the UI can show what we've captured. */
function mergeSignals(signals, toolName, result) {
  const next = { ...signals };
  if (toolName === 'show_swipe_card') {
    next.swipes = next.swipes || [];
    next.swipes.push(result);
  } else if (toolName === 'show_this_or_that') {
    next.binaries = next.binaries || [];
    next.binaries.push(result);
  } else if (toolName === 'show_mood_board') {
    next.mood = result;
  } else if (toolName === 'show_chat_message') {
    next.chat = next.chat || [];
    next.chat.push(result);
  } else if (toolName === 'show_classic_question') {
    next.classic = next.classic || [];
    next.classic.push(result);
  } else if (toolName === 'show_fit_twin_layer') {
    if (result.layer === 'essentials') {
      next.essentials = result;
    } else {
      next.fitTwin = {
        ...(next.fitTwin || {}),
        [result.layer || 'unknown']: result,
      };
    }
  } else if (toolName === 'show_tailor_precision_offer') {
    next.tailorOffer = result;
  }
  return next;
}

export { TOOL_FAMILY };
