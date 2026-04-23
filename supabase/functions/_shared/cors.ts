// Shared CORS headers for DayOne Flow Factory Edge Functions.
// We set a permissive origin for the demo; tighten later if desired.

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
