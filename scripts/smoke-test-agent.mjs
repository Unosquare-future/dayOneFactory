#!/usr/bin/env node
/**
 * Smoke test for the /functions/v1/agent Edge Function.
 *
 * Sends a minimal Anthropic-shaped request, streams the response, and
 * reports whether we got both a reasoning text block and a tool_use
 * block back. This is the "is everything wired" check.
 *
 * Usage:
 *   node scripts/smoke-test-agent.mjs
 */

import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('./.env.local', 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const eq = l.indexOf('=');
      return [l.slice(0, eq), l.slice(eq + 1)];
    }),
);

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const url = `${SUPABASE_URL}/functions/v1/agent`;
const body = {
  model: 'claude-sonnet-4-5',
  max_tokens: 512,
  stream: true,
  system:
    'You are a terse testing agent. When greeted, reply with a short text note AND call the `noop` tool. Do not ask questions.',
  tools: [
    {
      name: 'noop',
      description: 'A no-op tool used only for smoke-testing tool_use.',
      input_schema: {
        type: 'object',
        properties: {
          confirm: {
            type: 'string',
            description: 'Echo back a one-word confirmation.',
          },
        },
        required: ['confirm'],
      },
    },
  ],
  messages: [
    {
      role: 'user',
      content: 'Hi — smoke test. Reply + call the tool.',
    },
  ],
};

console.log(`→ POST ${url}`);
const t0 = Date.now();
const res = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ANON}`,
  },
  body: JSON.stringify(body),
});

if (!res.ok) {
  const text = await res.text();
  console.error(`✗ HTTP ${res.status}:`, text.slice(0, 400));
  process.exit(1);
}

let gotText = false;
let gotTool = false;
let toolName = null;
let toolInput = '';
const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = '';
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  let idx;
  while ((idx = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, idx).trim();
    buffer = buffer.slice(idx + 1);
    if (!line.startsWith('data:')) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === '[DONE]') continue;
    let ev;
    try {
      ev = JSON.parse(payload);
    } catch {
      continue;
    }
    if (ev.type === 'content_block_start') {
      if (ev.content_block.type === 'text') gotText = true;
      if (ev.content_block.type === 'tool_use') {
        gotTool = true;
        toolName = ev.content_block.name;
      }
    } else if (ev.type === 'content_block_delta') {
      if (ev.delta.type === 'input_json_delta')
        toolInput += ev.delta.partial_json || '';
    }
  }
}

const ms = Date.now() - t0;
console.log(`\n✓ Stream complete in ${ms}ms`);
console.log(`  reasoning text block: ${gotText ? 'yes' : 'NO'}`);
console.log(`  tool_use block:       ${gotTool ? `yes (${toolName})` : 'NO'}`);
if (gotTool && toolInput) {
  try {
    const parsed = JSON.parse(toolInput);
    console.log(`  tool input:           ${JSON.stringify(parsed)}`);
  } catch {
    console.log(`  tool input:           (partial) ${toolInput.slice(0, 80)}`);
  }
}

if (!gotTool) {
  console.error('\n✗ No tool_use block received — check system prompt + deploy');
  process.exit(1);
}
console.log('\n🎉 Agent function is live and tool-use works end-to-end.');
