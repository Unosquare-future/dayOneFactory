// Tool schemas Claude can call during the onboarding simulation.
//
// Each tool maps to a "screen" the orchestrator renders inside the
// device frame, and to a "result" shape the user's interaction
// returns back to Claude on the next turn.
//
// The schemas are Anthropic tool_use format:
//   { name, description, input_schema (JSON Schema subset) }

export const AGENT_TOOLS = [
  {
    name: 'show_swipe_card',
    description:
      'Show one card from the Style Shuffle (swipe) variant. The user will swipe yes/no. Use to probe gut taste signals.',
    input_schema: {
      type: 'object',
      properties: {
        card_index: {
          type: 'integer',
          description: 'Index into SWIPE_CARDS (0..11).',
          minimum: 0,
          maximum: 11,
        },
        reason: {
          type: 'string',
          description:
            'One-sentence rationale: what signal are you probing with this card?',
        },
      },
      required: ['card_index', 'reason'],
    },
  },
  {
    name: 'show_this_or_that',
    description:
      'Show a This-or-That binary pair. Low effort, high signal. Good after 1–2 other interactions.',
    input_schema: {
      type: 'object',
      properties: {
        pair_index: {
          type: 'integer',
          description: 'Index into TOT_PAIRS (0..7).',
          minimum: 0,
          maximum: 7,
        },
        reason: { type: 'string' },
      },
      required: ['pair_index', 'reason'],
    },
  },
  {
    name: 'show_mood_board',
    description:
      "Show the Taste Transfer screen. Three modes the user can switch between: (a) Mood board — pick one of 9 curated moods; (b) Instagram — paste a handle; (c) Taste icon — pick a style reference. Tool result's `mode` field tells you which path the user took. For Instagram, trust your training knowledge to read the aesthetic; if unknown, say so honestly.",
    input_schema: {
      type: 'object',
      properties: {
        reason: { type: 'string' },
      },
      required: ['reason'],
    },
  },
  {
    name: 'show_chat_message',
    description:
      'Send a warm conversational message as the stylist "Ava", with up to 4 tappable quick-reply options. Use for motivation / wardrobe-missing-piece probes.',
    input_schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The stylist message. Warm, short (1–2 sentences).',
        },
        options: {
          type: 'array',
          items: { type: 'string' },
          description:
            '2–4 tappable quick-replies. Must cover a meaningful range.',
          minItems: 2,
          maxItems: 4,
        },
        reason: { type: 'string' },
      },
      required: ['message', 'options', 'reason'],
    },
  },
  {
    name: 'show_classic_question',
    description:
      'Show a question from the Classic (structured) quiz. Use sparingly — only when the visitor clearly wants structure.',
    input_schema: {
      type: 'object',
      properties: {
        question_index: {
          type: 'integer',
          minimum: 0,
          maximum: 4,
        },
        reason: { type: 'string' },
      },
      required: ['question_index', 'reason'],
    },
  },
  {
    name: 'show_fit_twin_layer',
    description:
      'Switch to a Fit Twin layer. Layers in accuracy order: ' +
      'essentials = gender/segment + height + shoe size (unlocks segment-aware content — MUST be the first tool you ever call). ' +
      'closet_anchor = collect ONE top + ONE bottom that fit well (85% head-to-toe size signal). ' +
      'fit_twins = pick the client profile closest to you (90%) — cards are shortlisted to match their captured height + closet sizes. ' +
      'sharpen = 2 agent-generated disambiguators (95%). ' +
      'budget = Style Allowance slider + Fix size. ' +
      "The tailor-precision (AR camera) step is handled by show_tailor_precision_offer — don't call an 'ar' layer here.",
    input_schema: {
      type: 'object',
      properties: {
        layer: {
          type: 'string',
          enum: [
            'essentials',
            'closet_anchor',
            'fit_twins',
            'sharpen',
            'budget',
          ],
        },
        reason: { type: 'string' },
      },
      required: ['layer', 'reason'],
    },
  },
  {
    name: 'show_tailor_precision_offer',
    description:
      'The final pre-conclude step. ONE screen that hosts the offer AND (if the user accepts) the camera prompt + MediaPipe Pose capture. Tool result is either {accepted:false} OR {accepted:true, measurements:{shoulder_width_in, torso_length_in, inseam_in, arm_length_in, height_reference_in, confidence}}. After this returns, move directly to conclude_with_persona — do NOT call another AR layer.',
    input_schema: {
      type: 'object',
      properties: {
        reason: { type: 'string' },
      },
      required: ['reason'],
    },
  },
  {
    name: 'conclude_with_persona',
    description:
      'Finish onboarding. Pick the best archetype and synthesize a 2–3 sentence persona summary in the second person. Confidence is 60–98 based on signal quality.',
    input_schema: {
      type: 'object',
      properties: {
        archetype_id: {
          type: 'string',
          enum: [
            'rustic-rebel',
            'modern-muse',
            'adventure-sport',
            'coastal-sport',
            'modern-prep',
            'boho-dreamer',
            'quiet-classic',
            'studio-minimal',
          ],
        },
        persona_summary: {
          type: 'string',
          description:
            'Editorial 2–3 sentences in second person. Must name fit, style, and budget implicitly or explicitly.',
        },
        confidence: {
          type: 'integer',
          minimum: 60,
          maximum: 98,
        },
        recommended_sku_ids: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Up to 4 inventory SKU ids (e.g. w001, m012) that would make a good first Fix. Pick from what you know was visible.',
          maxItems: 4,
        },
      },
      required: [
        'archetype_id',
        'persona_summary',
        'confidence',
      ],
    },
  },
];

/** Lookup: tool name → which family it belongs to (for intermix tracking). */
export const TOOL_FAMILY = {
  show_swipe_card: 'variant',
  show_this_or_that: 'variant',
  show_mood_board: 'variant',
  show_chat_message: 'variant',
  show_classic_question: 'variant',
  show_fit_twin_layer: 'fittwin',
  show_tailor_precision_offer: 'offer',
  conclude_with_persona: 'conclude',
};
