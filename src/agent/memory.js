// Client-side persona memory.
//
// Two layers:
//   - localStorage (instant, works offline, per-browser)
//   - Supabase persona_memories table (cross-device upgrade path)
//
// A browser-generated UUID keys both. We don't try to identify the
// user; the memory is tied to this browser profile only.

import { supabase } from '../lib/supabase.js';

const CLIENT_ID_KEY = 'dayone-client-id';
const PERSONA_KEY = 'dayone-persona';

/** Get or create a stable per-browser UUID. */
export function getClientId() {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

/** Read the most recent persona for this browser. */
export function loadPersona() {
  try {
    const raw = localStorage.getItem(PERSONA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Persist persona locally and to Supabase (best-effort). */
export async function savePersona(persona) {
  // Local first — never blocks on network.
  const payload = {
    ...persona,
    client_id: getClientId(),
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(PERSONA_KEY, JSON.stringify(payload));

  if (!supabase) return payload;

  // Fire-and-forget upsert to the memory table. If RLS or migration
  // hasn't been applied yet, log and move on — the local memory still
  // works.
  try {
    await supabase.from('persona_memories').upsert(
      {
        client_id: payload.client_id,
        archetype_id: payload.archetype_id,
        persona_summary: payload.persona_summary,
        persona_json: payload.persona_json || null,
        confidence: payload.confidence || null,
        sessions_count: (payload.sessions_count || 0) + 1,
        updated_at: payload.updated_at,
      },
      { onConflict: 'client_id' },
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[memory] Supabase upsert failed:', err?.message || err);
  }
  return payload;
}

/** Save a completed session to Supabase (best-effort). */
export async function saveSession(session) {
  if (!supabase) return;
  try {
    await supabase.from('simulator_sessions').insert({
      client_id: getClientId(),
      started_at: session.startedAt,
      ended_at: session.endedAt,
      device: session.device,
      agent_model: session.model,
      total_interactions: session.interactions,
      variant_path: session.variantPath,
      fit_twin_depth: session.fitTwinDepth,
      archetype_id: session.archetypeId,
      persona_summary: session.personaSummary,
      confidence: session.confidence,
      log_json: session.log,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[memory] Supabase session insert failed:', err?.message || err);
  }
}

/** Wipe the browser-local persona. Does not delete from Supabase. */
export function forgetPersona() {
  localStorage.removeItem(PERSONA_KEY);
}
