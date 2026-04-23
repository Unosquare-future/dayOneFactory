// Supabase client — used by the running app for reads against public
// storage objects. The anon key is safe to expose to the browser.
//
// For writes (uploading inventory images) we use the service-role key
// from the local seed script, never from the client bundle.

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const BUCKET =
  import.meta.env.VITE_SUPABASE_BUCKET || 'inventory-images';

/**
 * The Supabase client. Returns null if env vars aren't configured — the
 * app falls back to gradient placeholders in that case.
 */
export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

/**
 * Build a public URL for an object in our inventory images bucket.
 * Returns `null` if the client isn't configured.
 */
export function publicUrl(path) {
  if (!supabase || !path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

export const isSupabaseConfigured = () => Boolean(supabase);
