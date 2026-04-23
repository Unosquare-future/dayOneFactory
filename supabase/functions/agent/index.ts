// -----------------------------------------------------------------------
// DayOne Flow Factory — Agent Edge Function
// -----------------------------------------------------------------------
// A thin streaming proxy between the browser and the Anthropic API.
//
// The client posts an Anthropic-shaped request body (model, messages,
// tools, system prompt). We append the ANTHROPIC_API_KEY header — held
// as a Supabase secret — and stream the response back line-by-line
// using Server-Sent Events.
//
// Why a proxy rather than direct browser → Anthropic?
//   - The API key never touches the client bundle or localStorage.
//   - Rate-limiting and per-session budgeting can live here later.
//   - Vision payloads stay off the browser extension / tab debuggers.
//
// Deploy:
//   supabase functions deploy agent --no-verify-jwt
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Invoke (client):
//   POST https://<project>.supabase.co/functions/v1/agent
//   Authorization: Bearer <anon key>
//   Body: { model, messages, tools, system, max_tokens, stream: true }
// -----------------------------------------------------------------------

import { corsHeaders } from '../_shared/cors.ts';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          'ANTHROPIC_API_KEY not configured. Run `supabase secrets set ANTHROPIC_API_KEY=…`',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Default safety rails. Client can override.
  const payload = {
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    stream: true,
    ...body,
  };

  // Forward to Anthropic
  const upstream = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  // Non-2xx from Anthropic — return the error body so the client can
  // show a useful message.
  if (!upstream.ok) {
    const errText = await upstream.text();
    return new Response(
      JSON.stringify({
        error: 'Anthropic upstream error',
        status: upstream.status,
        body: errText.slice(0, 2000),
      }),
      {
        status: upstream.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  // Streaming? Pipe the SSE stream straight through.
  if (payload.stream) {
    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  }

  // Non-streaming — return the JSON response.
  const json = await upstream.json();
  return new Response(JSON.stringify(json), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
