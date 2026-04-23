#!/usr/bin/env node
/**
 * Run Supabase SQL migrations against a project via the Management API.
 *
 * The CLI's `supabase db push` needs a linked project + DB password;
 * this script just POSTs each migration file to
 *   POST /v1/projects/{ref}/database/query
 * using a Personal Access Token (PAT). No DB password needed.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/run-migrations.mjs
 *
 * Reads SUPABASE_URL from .env.local to extract the project ref.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDotenv(path) {
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
      .map((l) => {
        const eq = l.indexOf('=');
        return [l.slice(0, eq), l.slice(eq + 1)];
      }),
  );
}

const env = loadDotenv('.env.local');
const PAT =
  process.env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_ACCESS_TOKEN;
if (!PAT) {
  console.error(
    '✗ SUPABASE_ACCESS_TOKEN missing. Get a PAT at https://supabase.com/dashboard/account/tokens and export it or add to .env.local.',
  );
  process.exit(1);
}

const url = env.VITE_SUPABASE_URL;
const ref = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
if (!ref) {
  console.error('✗ Could not parse project ref from VITE_SUPABASE_URL:', url);
  process.exit(1);
}

const dir = resolve('supabase/migrations');
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

console.log(`Project ref: ${ref}`);
console.log(`Migrations:  ${files.join(', ')}\n`);

for (const f of files) {
  const sql = readFileSync(resolve(dir, f), 'utf8');
  console.log(`→ ${f} (${sql.length} bytes)`);
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    },
  );
  if (!res.ok) {
    const err = await res.text();
    console.error(`  ✗ HTTP ${res.status}: ${err.slice(0, 400)}`);
    process.exit(1);
  }
  const data = await res.json();
  console.log(
    `  ✓ applied. rows: ${Array.isArray(data) ? data.length : 'n/a'}`,
  );
}

console.log('\n🎉 All migrations applied.');
