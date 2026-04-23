// Simulation — dry-run the router against a synthetic cohort before
// flipping rules on to live traffic. Streams visitors through the
// routing logic in real-time, shows per-variant tallies and projected
// 90-day outcomes.

import React from 'react';
import {
  Badge,
  Button,
  Card,
  Eyebrow,
  Icon,
  MiniBar,
  Progress,
  SectionHead,
  Segmented,
  cx,
  useEffect,
  useRef,
  useState,
} from '../ui.jsx';
import { useFactory } from '../state.jsx';

// -----------------------------------------------------------------------
// Cohort presets — quick-start synthetic populations
// -----------------------------------------------------------------------
const COHORT_PRESETS = {
  tuesday: {
    label: 'Tuesday morning',
    sub: 'The normal mix — organic browsers dominate.',
    mix: { paid: 25, organic: 45, email: 15, referral: 10, tiktok: 5 },
    device: { mobile: 55 },
    session: { first: 70, lapsed: 10 },
  },
  friday: {
    label: 'Friday drop campaign',
    sub: 'Heavy paid social + referrals after a creator post.',
    mix: { paid: 45, organic: 20, email: 10, referral: 20, tiktok: 5 },
    device: { mobile: 82 },
    session: { first: 78, lapsed: 6 },
  },
  winback: {
    label: 'Winback blast',
    sub: 'Email cohort, lapsed clients with prior style graphs.',
    mix: { paid: 5, organic: 10, email: 75, referral: 5, tiktok: 5 },
    device: { mobile: 58 },
    session: { first: 10, lapsed: 80 },
  },
  viral: {
    label: 'TikTok moment',
    sub: 'Organic TikTok surge after a "can’t describe my style" video.',
    mix: { paid: 10, organic: 15, email: 5, referral: 15, tiktok: 55 },
    device: { mobile: 92 },
    session: { first: 92, lapsed: 2 },
  },
};

// -----------------------------------------------------------------------
// Synthetic visitor generator
// -----------------------------------------------------------------------
const FIRST_NAMES = [
  'Maya', 'Robert', 'Priya', 'Jordan', 'Lena', 'Theo', 'Amelia', 'Sasha',
  'Hiro', 'Noor', 'Luca', 'Chiamaka', 'Ines', 'Oskar', 'Rumi', 'Dani',
  'Paz', 'Kai', 'Marisol', 'Arun',
];

function weightedPick(weights) {
  const total = Object.values(weights).reduce((s, v) => s + v, 0);
  let r = Math.random() * total;
  for (const [k, w] of Object.entries(weights)) {
    if ((r -= w) <= 0) return k;
  }
  return Object.keys(weights)[0];
}

function makeVisitor(cohort, i) {
  const channelKey = weightedPick(cohort.mix);
  const channelMap = {
    paid: 'Paid social',
    organic: 'Organic search',
    email: 'Email',
    referral: 'Referral',
    tiktok: 'TikTok',
  };
  const device = Math.random() * 100 < (cohort.device.mobile || 60) ? 'Mobile' : 'Desktop';
  const isLapsed = Math.random() * 100 < (cohort.session.lapsed || 10);
  const isFirst = !isLapsed && Math.random() * 100 < (cohort.session.first || 70);
  const session = isLapsed ? 'Lapsed' : isFirst ? 'First-time' : 'Returning';
  const age = 20 + Math.round(Math.random() * 40);
  return {
    id: `v${Date.now()}-${i}`,
    name: FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)],
    age,
    channel: channelMap[channelKey],
    channelKey,
    device,
    session,
  };
}

// -----------------------------------------------------------------------
// Routing heuristic — priors + rule weights
// -----------------------------------------------------------------------
function routeVisitor(visitor, variants, rules) {
  const liveVariants = variants.filter((v) => v.status !== 'Draft');
  const scores = Object.fromEntries(liveVariants.map((v) => [v.id, 0]));

  // Baseline priors
  if (visitor.device === 'Mobile' && visitor.channelKey === 'paid') {
    scores.swipe = (scores.swipe || 0) + 0.7;
  }
  if (visitor.device === 'Desktop' && visitor.session === 'First-time') {
    scores.classic = (scores.classic || 0) + 0.55;
  }
  if (visitor.session === 'Lapsed') {
    scores.inspiration = (scores.inspiration || 0) + 0.75;
  }
  if (visitor.channelKey === 'tiktok') {
    scores.chat = (scores.chat || 0) + 0.6;
  }
  if (visitor.channelKey === 'referral') {
    scores.builder = (scores.builder || 0) + 0.45;
    scores['this-or-that'] = (scores['this-or-that'] || 0) + 0.35;
  }
  if (visitor.channelKey === 'email') {
    scores.inspiration = (scores.inspiration || 0) + 0.35;
  }

  // Rule influences (only active rules)
  rules
    .filter((r) => r.status === 'on')
    .forEach((r) => {
      const t = r.then.toLowerCase();
      if (t.includes('style shuffle')) scores.swipe = (scores.swipe || 0) + r.weight * 0.5;
      if (t.includes('classic')) scores.classic = (scores.classic || 0) + r.weight * 0.5;
      if (t.includes('taste transfer')) scores.inspiration = (scores.inspiration || 0) + r.weight * 0.5;
      if (t.includes('stylist chat')) scores.chat = (scores.chat || 0) + r.weight * 0.5;
      if (t.includes('this or that')) scores['this-or-that'] = (scores['this-or-that'] || 0) + r.weight * 0.5;
      if (t.includes('outfit builder')) scores.builder = (scores.builder || 0) + r.weight * 0.5;
    });

  // Baseline nudge so every live variant has a fair shot
  liveVariants.forEach((v) => {
    scores[v.id] = (scores[v.id] || 0) + Math.random() * 0.1;
  });

  let best = liveVariants[0]?.id;
  let bestScore = -Infinity;
  liveVariants.forEach((v) => {
    if ((scores[v.id] || 0) > bestScore) {
      bestScore = scores[v.id] || 0;
      best = v.id;
    }
  });
  const total = Object.values(scores).reduce((s, v) => s + Math.max(0, v), 0);
  const confidence = total > 0 ? Math.min(98, Math.round((bestScore / total) * 100)) : 50;
  return { variantId: best, confidence };
}

// -----------------------------------------------------------------------
// Cohort builder UI
// -----------------------------------------------------------------------
function CohortBuilder({ cohort, setCohort, size, setSize, preset, setPreset }) {
  function applyPreset(key) {
    setPreset(key);
    setCohort(JSON.parse(JSON.stringify(COHORT_PRESETS[key])));
  }

  function updateMix(channel, value) {
    setPreset('custom');
    setCohort({ ...cohort, mix: { ...cohort.mix, [channel]: Number(value) } });
  }
  function updateDevice(value) {
    setPreset('custom');
    setCohort({ ...cohort, device: { mobile: Number(value) } });
  }
  function updateSession(key, value) {
    setPreset('custom');
    setCohort({ ...cohort, session: { ...cohort.session, [key]: Number(value) } });
  }

  const totalMix = Object.values(cohort.mix).reduce((s, v) => s + v, 0);

  return (
    <Card className="p-6">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <Eyebrow>Cohort builder</Eyebrow>
          <div className="type-headline-md text-navy mt-2">Who are we routing?</div>
        </div>
      </div>

      <Eyebrow className="mb-2">Preset</Eyebrow>
      <div className="flex flex-wrap gap-1.5 mb-6">
        {Object.entries(COHORT_PRESETS).map(([k, p]) => (
          <button
            key={k}
            onClick={() => applyPreset(k)}
            className={cx(
              'px-3 py-2 rounded text-[11px] uppercase tracking-[0.08em] font-bold border transition-colors',
              preset === k
                ? 'bg-navy text-white border-navy'
                : 'bg-surface-lowest text-ink-soft border-outline-variant hover:border-navy',
            )}
          >
            {p.label}
          </button>
        ))}
        {preset === 'custom' && (
          <span className="px-3 py-2 text-[11px] uppercase tracking-[0.08em] font-bold text-lime-700">
            · custom
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Eyebrow className="mb-3">Acquisition mix</Eyebrow>
          <div className="space-y-3">
            {[
              ['paid', 'Paid social'],
              ['organic', 'Organic search'],
              ['email', 'Email'],
              ['referral', 'Referral'],
              ['tiktok', 'TikTok'],
            ].map(([k, label]) => (
              <div key={k} className="flex items-center gap-3">
                <span className="text-[12px] text-ink-soft w-28 flex-shrink-0">{label}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cohort.mix[k] || 0}
                  onChange={(e) => updateMix(k, e.target.value)}
                  className="flex-1 accent-teal-500"
                  style={{ boxShadow: 'none' }}
                />
                <span className="text-[12px] text-navy font-bold tabular-nums w-10 text-right">
                  {cohort.mix[k] || 0}
                </span>
              </div>
            ))}
            <div className="pt-2 text-[11px] text-ink-soft font-bold uppercase tracking-[0.08em] flex items-center justify-between">
              <span>Total</span>
              <span className={cx(totalMix === 100 ? 'text-teal-500' : 'text-lime-700')}>
                {totalMix}%
              </span>
            </div>
          </div>
        </div>

        <div>
          <Eyebrow className="mb-3">Device & session</Eyebrow>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] text-ink-soft">Mobile share</span>
                <span className="text-[12px] text-navy font-bold tabular-nums">
                  {cohort.device.mobile}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={cohort.device.mobile}
                onChange={(e) => updateDevice(e.target.value)}
                className="w-full accent-teal-500"
                style={{ boxShadow: 'none' }}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] text-ink-soft">First-time visitors</span>
                <span className="text-[12px] text-navy font-bold tabular-nums">
                  {cohort.session.first}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={cohort.session.first}
                onChange={(e) => updateSession('first', e.target.value)}
                className="w-full accent-teal-500"
                style={{ boxShadow: 'none' }}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] text-ink-soft">Lapsed clients</span>
                <span className="text-[12px] text-navy font-bold tabular-nums">
                  {cohort.session.lapsed}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={cohort.session.lapsed}
                onChange={(e) => updateSession('lapsed', e.target.value)}
                className="w-full accent-teal-500"
                style={{ boxShadow: 'none' }}
              />
            </div>

            <div className="pt-4 border-t border-outline-variant">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] text-ink-soft">Cohort size</span>
                <span className="text-[12px] text-navy font-bold tabular-nums">
                  {size} visitors
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-teal-500"
                style={{ boxShadow: 'none' }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// -----------------------------------------------------------------------
// Stream ribbon — each visitor is a small avatar with routing decision
// -----------------------------------------------------------------------
function StreamRibbon({ stream }) {
  const AVATARS = ['ph-3', 'ph-4', 'ph-5', 'ph-6', 'ph-7', 'ph-8', 'ph-9', 'ph-10', 'ph-11'];
  return (
    <div className="flex flex-wrap gap-1.5">
      {stream.map((v, i) => (
        <div
          key={v.id}
          className="bloom"
          title={`${v.name} (${v.age}) · ${v.channel} · ${v.device} → ${v.variantName} · ${v.confidence}%`}
          style={{ animationDelay: `${Math.min(i * 8, 200)}ms` }}
        >
          <div
            className={cx(
              'w-6 h-6 rounded-sm ph-tex border',
              AVATARS[i % AVATARS.length],
              v.confidence >= 75 ? 'border-teal' : 'border-outline-variant',
            )}
          />
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------
// Tally card per variant
// -----------------------------------------------------------------------
function VariantTally({ variant, count, total, avgConf }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className={cx('w-8 h-10 rounded-sm ph-tex border border-outline-variant flex-shrink-0', variant.thumb)} />
        <div className="flex-1 min-w-0">
          <div className="type-eyebrow text-ink-soft">{variant.kind}</div>
          <div className="type-body-md text-navy font-semibold leading-tight mt-1 truncate">
            {variant.name}
          </div>
        </div>
      </div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[1.5rem] text-navy font-bold leading-none tabular-nums">
          {count}
        </span>
        <span className="text-[11px] text-ink-soft font-bold uppercase tracking-[0.08em] tabular-nums">
          {pct}% routed
        </span>
      </div>
      <Progress value={pct} tone="teal" />
      <div className="mt-3 flex items-center justify-between text-[11px] text-ink-soft">
        <span className="uppercase tracking-[0.08em] font-bold">avg conf.</span>
        <span className="text-navy font-bold tabular-nums">
          {avgConf ? `${avgConf}%` : '—'}
        </span>
      </div>
    </Card>
  );
}

// -----------------------------------------------------------------------
// Main view
// -----------------------------------------------------------------------
export default function SimulationView() {
  const { variants, rules } = useFactory();
  const [preset, setPreset] = useState('tuesday');
  const [cohort, setCohort] = useState(() => JSON.parse(JSON.stringify(COHORT_PRESETS.tuesday)));
  const [size, setSize] = useState(120);

  const [running, setRunning] = useState(false);
  const [stream, setStream] = useState([]); // [{ ..., variantId, variantName, confidence }]
  const [tally, setTally] = useState({});
  const timerRef = useRef(null);

  // Live derived projections from tally
  const total = stream.length;
  const tallies = variants
    .filter((v) => v.status !== 'Draft')
    .map((v) => {
      const assigned = stream.filter((s) => s.variantId === v.id);
      const avgConf =
        assigned.length === 0
          ? 0
          : Math.round(
              assigned.reduce((s, a) => s + a.confidence, 0) / assigned.length,
            );
      return { variant: v, count: assigned.length, avgConf };
    });

  const projectedCompletion =
    total === 0
      ? 0
      : Math.round(
          tallies.reduce(
            (s, t) => s + t.count * (t.variant.metrics.completion || 0),
            0,
          ) / total,
        );
  const projectedFirstFix =
    total === 0
      ? 0
      : Math.round(
          tallies.reduce(
            (s, t) => s + t.count * (t.variant.metrics.firstFix || 0),
            0,
          ) / total,
        );
  const projectedLtv =
    total === 0
      ? 0
      : Math.round(
          tallies.reduce(
            (s, t) =>
              s +
              t.count *
                (180 +
                  (t.variant.metrics.signalDensity || 0) * 2.4 +
                  (t.variant.metrics.firstFix || 0) * 1.1),
            0,
          ) / total,
        );

  function start() {
    clearInterval(timerRef.current);
    setStream([]);
    setTally({});
    setRunning(true);
    let i = 0;
    timerRef.current = setInterval(() => {
      if (i >= size) {
        clearInterval(timerRef.current);
        setRunning(false);
        return;
      }
      const batch = Math.min(Math.ceil(size / 60), size - i);
      const newStream = [];
      for (let k = 0; k < batch; k++) {
        const v = makeVisitor(cohort, i + k);
        const { variantId, confidence } = routeVisitor(v, variants, rules);
        const variant = variants.find((x) => x.id === variantId);
        newStream.push({
          ...v,
          variantId,
          variantName: variant?.name || variantId,
          confidence,
        });
      }
      i += batch;
      setStream((s) => [...s, ...newStream]);
    }, 50);
  }

  function reset() {
    clearInterval(timerRef.current);
    setRunning(false);
    setStream([]);
    setTally({});
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

  const topVariant = tallies.slice().sort((a, b) => b.count - a.count)[0];
  const progressPct = Math.min(100, Math.round((total / size) * 100));

  return (
    <div className="px-6 md:px-10 py-12 max-w-[1400px] mx-auto">
      <SectionHead
        eyebrow="Simulation / dry run"
        title="Watch the router route."
        sub="Build a synthetic cohort, stream it through the current rulebook, and see where each visitor would land — before you change a thing in production."
        right={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={reset} disabled={running}>
              <Icon name="back" /> Reset
            </Button>
            <Button variant="primary" onClick={start} disabled={running}>
              <Icon name={running ? 'pause' : 'play'} />{' '}
              {running ? 'Routing…' : 'Run simulation'}
            </Button>
          </div>
        }
      />

      <div className="grid md:grid-cols-[1fr_320px] gap-6 mb-6">
        <CohortBuilder
          cohort={cohort}
          setCohort={setCohort}
          size={size}
          setSize={setSize}
          preset={preset}
          setPreset={setPreset}
        />
        <Card className="p-6">
          <Eyebrow>{running ? 'Routing in progress' : total > 0 ? 'Run complete' : 'Ready'}</Eyebrow>
          <div className="mt-3 mb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[2.25rem] text-navy font-bold leading-none tabular-nums">
                {total}
              </span>
              <span className="text-[13px] text-ink-soft">of {size}</span>
            </div>
            <div className="mt-3">
              <Progress value={progressPct} tone={running ? 'lime' : 'teal'} />
            </div>
          </div>
          <div className="space-y-3 text-[13px] pt-4 border-t border-outline-variant">
            <div className="flex items-center justify-between">
              <span className="text-ink-soft">Projected completion</span>
              <span className="text-navy font-bold tabular-nums">
                {projectedCompletion}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-soft">Projected First-Fix</span>
              <span className="text-navy font-bold tabular-nums">
                {projectedFirstFix}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-soft">Avg 90-day LTV</span>
              <span className="text-navy font-bold tabular-nums">${projectedLtv}</span>
            </div>
            {topVariant && topVariant.count > 0 && (
              <div className="pt-3 mt-3 border-t border-outline-variant">
                <Eyebrow className="text-teal-500 mb-2">Leader</Eyebrow>
                <div className="flex items-center gap-2">
                  <span
                    className={cx(
                      'w-4 h-5 rounded-sm ph-tex border border-outline-variant',
                      topVariant.variant.thumb,
                    )}
                  />
                  <span className="text-[13px] text-navy font-semibold">
                    {topVariant.variant.name}
                  </span>
                  <Badge tone="teal" className="ml-auto">
                    {topVariant.count}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Visitor stream ribbon */}
      <Card className="p-6 mb-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <Eyebrow>Visitor stream</Eyebrow>
            <div className="type-body-md text-navy mt-1">
              Each square is one synthetic visitor. Teal border = routed with high confidence.
            </div>
          </div>
          <span className="text-[11px] text-ink-soft font-bold uppercase tracking-[0.08em] tabular-nums">
            {total} routed
          </span>
        </div>
        <div className="min-h-[80px] rounded border border-outline-variant bg-surface-low p-3">
          {stream.length === 0 ? (
            <div className="h-full flex items-center justify-center py-8 type-eyebrow text-ink-soft">
              press run simulation to begin
            </div>
          ) : (
            <StreamRibbon stream={stream} />
          )}
        </div>
      </Card>

      {/* Variant tallies grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {tallies.map((t) => (
          <VariantTally
            key={t.variant.id}
            variant={t.variant}
            count={t.count}
            total={total}
            avgConf={t.avgConf}
          />
        ))}
      </div>

      {/* Signal breakdown */}
      {total > 0 && (
        <Card className="p-6">
          <Eyebrow className="mb-4">Routing signal breakdown</Eyebrow>
          <div className="space-y-3">
            {tallies
              .slice()
              .sort((a, b) => b.count - a.count)
              .map((t) => (
                <div key={t.variant.id} className="flex items-center gap-3">
                  <span className={cx('w-5 h-6 rounded-sm ph-tex flex-shrink-0', t.variant.thumb)} />
                  <span className="text-[13px] text-navy font-semibold w-40 truncate">
                    {t.variant.name}
                  </span>
                  <div className="flex-1">
                    <MiniBar value={t.count} max={total} />
                  </div>
                  <span className="text-[12px] text-ink-soft w-24 text-right tabular-nums">
                    avg {t.avgConf}% conf
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}

      <div className="mt-16 pt-8 border-t border-outline-variant text-[11px] text-ink-soft font-bold uppercase tracking-[0.12em] flex items-center justify-between">
        <span>Dayone / Simulation / sandbox</span>
        <span>Synthetic cohort · no live traffic</span>
      </div>
    </div>
  );
}
