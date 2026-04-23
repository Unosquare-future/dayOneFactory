// Fit Twin — playable showcase of progressive-precision measurement + budget
// capture. Five layers stacked in accuracy order: Closet Anchor → Fit Twins
// → Sharpen → AR → Style Allowance (budget). User picks how deep to go;
// accuracy climbs as they opt in. Mirrors the Variants tab pattern: left
// picker, center phone frame, right captured-signal panel.

import React from 'react';
import {
  Badge,
  Button,
  Card,
  Eyebrow,
  Icon,
  PhoneFrame,
  Progress,
  SectionHead,
  Segmented,
  Toggle,
  cx,
  useEffect,
  useRef,
  useState,
} from '../ui.jsx';
import { useFactory } from '../state.jsx';
import {
  ACCURACY_LADDER,
  CLOSET_CATALOG,
  FIT_TWINS,
  LAYER_META,
  SHARPEN_COUNT,
  SHARPEN_PAIRS,
} from '../fit-twin-data.js';

// =======================================================================
// Accuracy helpers
// =======================================================================

function computeAccuracy(state) {
  if (state.ar?.done) return ACCURACY_LADDER.arDone;
  if (state.sharpen?.done) return ACCURACY_LADDER.sharpenDone;
  if (state.twins?.pickedId) return ACCURACY_LADDER.fitTwinPicked;
  if ((state.closet?.items || []).length >= 2) return ACCURACY_LADDER.closetTwo;
  if ((state.closet?.items || []).length === 1) return ACCURACY_LADDER.closetOne;
  return ACCURACY_LADDER.none;
}

function AccuracyMeter({ percent, label = 'Fit Twin accuracy' }) {
  return (
    <div className="flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <Eyebrow className="mb-2">{label}</Eyebrow>
        <div className="w-full h-1.5 bg-surface-high rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-teal transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <div className="text-[2.25rem] font-bold text-navy leading-none tabular-nums">
        {percent}%
      </div>
    </div>
  );
}

// =======================================================================
// Layer 1 — Closet Anchor
// =======================================================================

function ClosetAnchorLayer({ state, onUpdate, onDone }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [selectedGarment, setSelectedGarment] = useState(null);
  const [size, setSize] = useState('');

  const items = state.closet?.items || [];

  // Autocomplete against keyword match
  const suggestions = query.trim()
    ? CLOSET_CATALOG.filter((g) => {
        const q = query.toLowerCase();
        return (
          g.keywords.some((k) => k.includes(q)) ||
          g.brand.toLowerCase().includes(q) ||
          g.name.toLowerCase().includes(q)
        );
      }).slice(0, 5)
    : [];

  function addItem() {
    if (!selectedGarment || !size) return;
    const entry = {
      id: selectedGarment.id + '-' + size + '-' + Date.now(),
      brand: selectedGarment.brand,
      name: selectedGarment.name,
      size,
      sizeProfile: selectedGarment.sizeProfile,
    };
    onUpdate({ closet: { items: [...items, entry] } });
    setQuery('');
    setSelectedGarment(null);
    setSize('');
  }

  function removeItem(id) {
    onUpdate({ closet: { items: items.filter((i) => i.id !== id) } });
  }

  const nextAccuracy =
    items.length === 0
      ? ACCURACY_LADDER.closetOne
      : items.length === 1
        ? ACCURACY_LADDER.closetTwo
        : ACCURACY_LADDER.closetTwo;

  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <Eyebrow>Layer 01 · Closet anchor</Eyebrow>
          <Badge tone="teal">+{nextAccuracy}% next</Badge>
        </div>
        <div className="text-[20px] font-semibold text-navy leading-tight tracking-tight">
          Name one thing in your closet that fits you really well right now.
        </div>
        <p className="text-[12.5px] text-ink-soft mt-2 leading-relaxed">
          We already know the real measurements of most garments and which
          body types keep them. One answer gets you to 80%.
        </p>
      </div>

      <div className="px-5 pb-3 space-y-3">
        <div className="relative">
          <div className="flex items-center gap-2 bg-surface-lowest border border-outline-variant rounded px-3 py-2.5 focus-within:border-teal">
            <Icon name="search" size={16} className="text-ink-soft" />
            <input
              value={selectedGarment ? `${selectedGarment.brand} ${selectedGarment.name}` : query}
              onChange={(e) => {
                setSelectedGarment(null);
                setQuery(e.target.value);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              placeholder="e.g. Levi's 501 or Madewell Cali"
              className="flex-1 bg-transparent text-[13.5px] placeholder:text-outline"
              style={{ boxShadow: 'none' }}
            />
          </div>
          {focused && suggestions.length > 0 && !selectedGarment && (
            <div className="absolute left-0 right-0 mt-2 bg-surface-lowest border border-outline-variant rounded shadow-lift overflow-hidden z-10">
              {suggestions.map((g) => (
                <button
                  key={g.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSelectedGarment(g);
                    setQuery('');
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-surface-base transition-colors flex items-center gap-3"
                >
                  <div className={cx('w-7 h-9 rounded-sm ph-tex flex-shrink-0', 'ph-' + ((parseInt(g.id.slice(1)) % 12) + 1))} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-navy font-semibold leading-tight">
                      {g.brand}
                    </div>
                    <div className="text-[12px] text-ink-soft truncate">
                      {g.name}
                    </div>
                  </div>
                  <div className="type-eyebrow text-ink-soft">{g.category}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedGarment && (
          <div className="p-3 rounded border border-teal bg-teal/10 bloom">
            <Eyebrow className="mb-2">Size you wear</Eyebrow>
            <div className="flex flex-wrap gap-1.5">
              {selectedGarment.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cx(
                    'px-3 py-1.5 rounded text-[11px] font-bold tabular-nums border transition-colors',
                    size === s
                      ? 'bg-navy text-white border-navy'
                      : 'bg-surface-lowest text-navy border-outline-variant hover:border-navy',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button variant="primary" onClick={addItem} disabled={!size}>
                <Icon name="plus" /> Add to closet
              </Button>
              <button
                onClick={() => {
                  setSelectedGarment(null);
                  setSize('');
                }}
                className="text-[11px] text-ink-soft font-bold uppercase tracking-[0.08em] hover:text-navy"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-3">
        {items.length === 0 ? (
          <div className="text-center py-6 type-eyebrow text-ink-soft">
            start typing — we'll find the rest
          </div>
        ) : (
          <>
            <Eyebrow className="mb-2">Your anchors</Eyebrow>
            <div className="space-y-2">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center gap-3 p-2.5 rounded border border-outline-variant bg-surface-lowest bloom"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-navy font-semibold leading-tight">
                      {it.brand}{' '}
                      <span className="font-normal text-ink-soft">· {it.name}</span>
                    </div>
                    <div className="type-eyebrow text-ink-soft mt-1">
                      size {it.size}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(it.id)}
                    className="w-7 h-7 rounded border border-outline-variant text-ink-soft hover:border-navy hover:text-navy flex items-center justify-center"
                    aria-label="Remove"
                  >
                    <Icon name="x" size={12} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-5 pb-5 border-t border-outline-variant pt-3 space-y-2">
        <Button
          variant="primary"
          className="w-full justify-center"
          onClick={onDone}
          disabled={items.length === 0}
        >
          <Icon name="check" />{' '}
          {items.length === 0
            ? 'Add at least one item'
            : `Lock in ${items.length} anchor${items.length > 1 ? 's' : ''} · ${items.length === 1 ? '80%' : '85%'} accuracy`}
        </Button>
        <button
          onClick={onDone}
          disabled={items.length === 0}
          className="w-full text-center text-[12px] text-ink-soft py-1 hover:text-navy disabled:opacity-40"
        >
          Continue without adding more
        </button>
      </div>
    </div>
  );
}

// =======================================================================
// Layer 2 — Meet your Fit Twins
// =======================================================================

function FitTwinCard({ twin, selected, onPick }) {
  return (
    <button
      onClick={onPick}
      className={cx(
        'relative text-left rounded-md overflow-hidden border transition-all p-3.5 min-h-[152px]',
        'ph-tex flex flex-col justify-end',
        twin.ph,
        selected
          ? 'border-teal ring-2 ring-teal scale-[0.99]'
          : 'border-outline-variant hover:scale-[1.01]',
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/20 to-transparent pointer-events-none" />
      <div className="relative">
        <div className="type-eyebrow text-white/80">{twin.label}</div>
        <div className="text-[14px] font-semibold text-white leading-tight mt-1.5">
          {twin.summary}
        </div>
        <p className="text-[11px] text-white/85 leading-snug mt-1.5 italic">
          {twin.blurb}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1">
          {twin.signals.slice(0, 3).map((s) => (
            <span
              key={s}
              className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-[0.06em] bg-white/90 text-navy"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

function FitTwinsLayer({ state, onUpdate, onDone }) {
  const picked = state.twins?.pickedId;

  function pick(twin) {
    onUpdate({
      twins: {
        pickedId: twin.id,
        summary: twin.summary,
        signals: twin.signals,
      },
    });
    setTimeout(onDone, 450);
  }

  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <Eyebrow>Layer 02 · Meet your Fit Twins</Eyebrow>
          <Badge tone="teal">+90% accuracy</Badge>
        </div>
        <div className="text-[20px] font-semibold text-navy leading-tight tracking-tight">
          Which one feels closest to you?
        </div>
        <p className="text-[12.5px] text-ink-soft mt-2 leading-relaxed">
          Real clients whose size and preferences already overlap with yours.
          Pick the one that feels right — we'll learn what to do with the rest.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-3">
        <div className="grid grid-cols-2 gap-2.5">
          {FIT_TWINS.map((t) => (
            <FitTwinCard
              key={t.id}
              twin={t}
              selected={picked === t.id}
              onPick={() => pick(t)}
            />
          ))}
        </div>
      </div>

      <div className="px-5 pb-5 pt-2 text-center">
        <button
          onClick={onDone}
          className="text-[11px] text-ink-soft font-bold uppercase tracking-[0.08em] hover:text-navy"
        >
          None of these — skip this layer
        </button>
      </div>
    </div>
  );
}

// =======================================================================
// Layer 3 — Sharpen the signal
// =======================================================================

// Pick 2 pairs deterministically-ish so the showcase is stable per session.
function pickSharpenPairs() {
  return SHARPEN_PAIRS.slice(0, SHARPEN_COUNT);
}

function SharpenLayer({ state, onUpdate, onDone }) {
  const pairsRef = useRef(pickSharpenPairs());
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flash, setFlash] = useState(null);

  const pairs = pairsRef.current;
  const pair = pairs[i];

  function answer(side) {
    setFlash(side);
    setTimeout(() => {
      setFlash(null);
      const next = { ...answers, [pair.id]: side };
      setAnswers(next);
      if (i + 1 >= pairs.length) {
        onUpdate({ sharpen: { done: true, answers: next } });
        onDone();
      } else {
        setI(i + 1);
      }
    }, 300);
  }

  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <Eyebrow>Layer 03 · Sharpen</Eyebrow>
          <Badge tone="teal">+95% accuracy</Badge>
        </div>
        <div className="type-eyebrow text-lime-700 mb-1">
          {pair.eyebrow}
        </div>
        <div className="text-[20px] font-semibold text-navy leading-tight tracking-tight">
          {pair.q}
        </div>
      </div>

      <div className="px-5 pb-2">
        <Progress value={((i + 1) / pairs.length) * 100} tone="teal" />
        <div className="flex items-center justify-between mt-1.5">
          <span className="type-eyebrow text-ink-soft">
            {i + 1} of {pairs.length}
          </span>
          <span className="type-eyebrow text-ink-soft">
            generated from your signal
          </span>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 grid grid-rows-2 gap-3">
        {['a', 'b'].map((side) => {
          const opt = pair[side];
          return (
            <button
              key={side}
              onClick={() => answer(side)}
              className={cx(
                'relative rounded-md overflow-hidden ph-tex border transition-all text-left',
                opt.ph,
                flash === side
                  ? 'ring-4 ring-teal scale-[0.985] border-teal'
                  : 'border-outline-variant hover:scale-[1.01]',
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-4">
                <div className="type-eyebrow text-white/80">
                  {side.toUpperCase()}
                </div>
                <div className="text-[18px] font-semibold text-white leading-tight mt-1">
                  {opt.label}
                </div>
                <div className="text-[11px] text-white/80 italic mt-1">
                  {opt.hint}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-5 pb-5 pt-2 text-center">
        <button
          onClick={onDone}
          className="text-[11px] text-ink-soft font-bold uppercase tracking-[0.08em] hover:text-navy"
        >
          I'm good — skip to budget
        </button>
      </div>
    </div>
  );
}

// =======================================================================
// Layer 4 — Tailor-level precision (AR)
// =======================================================================

function ARLayer({ state, onUpdate, onDone }) {
  const [scanning, setScanning] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!scanning) return;
    const timers = [
      setTimeout(() => setPhase(1), 900),
      setTimeout(() => setPhase(2), 1900),
      setTimeout(() => {
        onUpdate({ ar: { done: true } });
        onDone();
      }, 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [scanning]);

  if (scanning) {
    return (
      <div className="absolute inset-0 bg-navy flex flex-col items-center justify-center text-center p-6 text-white">
        <div className="relative w-40 h-40 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-white/20" />
          <div
            className="absolute inset-0 rounded-full border-2 border-teal border-t-transparent animate-spin"
            style={{ animationDuration: '1.5s' }}
          />
          <div className="absolute inset-6 rounded-full ph-10 ph-tex border border-white/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="type-eyebrow text-white/80">
              {phase === 0
                ? 'aligning'
                : phase === 1
                  ? 'scanning'
                  : 'locking fit'}
            </div>
          </div>
        </div>
        <div className="text-[20px] font-semibold leading-tight">
          Two minutes you'll never repeat.
        </div>
        <div className="type-eyebrow text-white/70 mt-3">
          tailor-level precision · 98%
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <Eyebrow>Layer 04 · Optional</Eyebrow>
          <Badge tone="lime">Premium · +98% accuracy</Badge>
        </div>
        <div className="text-[22px] font-semibold text-navy leading-tight tracking-tight">
          Tailor-level precision.
        </div>
      </div>

      <div className="flex-1 px-5 pb-5 flex flex-col">
        <div className="relative flex-1 rounded-md border border-outline-variant overflow-hidden bg-navy text-white flex flex-col items-center justify-center p-6 ph-tex ph-10">
          <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-transparent to-navy/70 pointer-events-none" />
          <div className="relative text-center">
            <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-4 border border-white/30">
              <Icon name="sparkle" size={24} className="text-white" />
            </div>
            <div className="text-[22px] font-semibold leading-tight max-w-[220px] mx-auto">
              Most clients don't need this.
            </div>
            <p className="text-[12.5px] text-white/85 mt-3 max-w-[240px] mx-auto leading-relaxed">
              But if your fit is tricky — long torso, asymmetric shoulders,
              tailored pieces you care about — two minutes here gets us to 98%.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Button
            variant="primary"
            className="w-full justify-center"
            onClick={() => setScanning(true)}
          >
            <Icon name="sparkle" /> Start the scan · 2 minutes
          </Button>
          <button
            onClick={onDone}
            className="w-full text-center text-[12px] text-ink-soft py-1.5 hover:text-navy uppercase tracking-[0.08em] font-bold"
          >
            I'm good — my Fit Twin has me at 95%
          </button>
        </div>
      </div>
    </div>
  );
}

// =======================================================================
// Layer 5 — Style Allowance (Budget)
// =======================================================================

const BUDGET_BANDS = [
  {
    key: 'under75',
    label: '$50–75 / item',
    low: 40,
    high: 85,
    narrative: 'Core essentials and brand staples. Denim, tees, basics.',
  },
  {
    key: 'mid',
    label: '$75–125 / item',
    low: 85,
    high: 135,
    narrative: 'Premium fabrics unlock. Merino, silk blends, trusted mid-brands.',
  },
  {
    key: 'upper',
    label: '$125–200 / item',
    low: 135,
    high: 220,
    narrative: 'Designer edits, tailored wool, exclusive-to-Fix brands.',
  },
  {
    key: 'premium',
    label: '$200+ / item',
    low: 220,
    high: 9999,
    narrative: 'The full closet. Cashmere, outerwear, investment pieces.',
  },
];

function BudgetLayer({ state, onUpdate, onDone }) {
  const { inventory } = useFactory();
  const [bandIdx, setBandIdx] = useState(state.budget?.bandIdx ?? 1);
  const [fixSize, setFixSize] = useState(state.budget?.fixSize ?? 8);

  const band = BUDGET_BANDS[bandIdx];

  // Live Fix preview tiles — pull Women's Tops/Bottoms/Outerwear/Dresses
  // that fit the selected band, deterministic selection so tiles don't
  // reshuffle on every re-render.
  const previewItems = inventory
    .filter((i) => i.category === 'Women')
    .filter(
      (i) =>
        i.subcategory === 'Tops' ||
        i.subcategory === 'Bottoms' ||
        i.subcategory === 'Outerwear' ||
        i.subcategory === 'Dresses',
    )
    .filter((i) => i.price >= band.low && i.price <= band.high)
    .slice(0, 4);

  // Fallback: always show 4 tiles even if a band has fewer matches
  const previewFilled =
    previewItems.length >= 4
      ? previewItems
      : [
          ...previewItems,
          ...inventory
            .filter((i) => i.category === 'Women')
            .slice(0, 4 - previewItems.length),
        ];

  function commit() {
    onUpdate({
      budget: {
        bandIdx,
        band: band.key,
        label: band.label,
        fixSize,
      },
    });
    onDone();
  }

  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <Eyebrow>Layer 05 · Style allowance</Eyebrow>
        <div className="text-[20px] font-semibold text-navy leading-tight tracking-tight mt-1">
          What changes with your budget.
        </div>
        <p className="text-[12.5px] text-ink-soft mt-2 leading-relaxed">
          Drag the slider — watch the preview change. Budget becomes
          exploration, not an interrogation.
        </p>
      </div>

      <div className="px-5 pb-3">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-[16px] text-navy font-bold">{band.label}</div>
          <div className="type-eyebrow text-teal-500">live preview</div>
        </div>
        <input
          type="range"
          min="0"
          max={BUDGET_BANDS.length - 1}
          step="1"
          value={bandIdx}
          onChange={(e) => setBandIdx(Number(e.target.value))}
          className="w-full accent-teal-500"
          style={{ boxShadow: 'none' }}
        />
        <div className="flex justify-between mt-1.5 type-eyebrow text-ink-soft">
          {BUDGET_BANDS.map((b) => (
            <span
              key={b.key}
              className={cx(bandIdx === BUDGET_BANDS.indexOf(b) && 'text-navy')}
            >
              ·
            </span>
          ))}
        </div>
        <p className="text-[11.5px] text-ink-soft leading-relaxed mt-3 italic">
          {band.narrative}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-3">
        <Eyebrow className="mb-2">What's in a Fix at this allowance</Eyebrow>
        <div className="grid grid-cols-2 gap-2">
          {previewFilled.map((item) => (
            <div
              key={item.id}
              className={cx(
                'relative aspect-[3/4] rounded overflow-hidden border border-outline-variant',
                item.imageUrl ? 'bg-surface-high' : cx('ph-tex', item.ph),
              )}
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-1.5 left-1.5 right-1.5 text-white">
                <div className="text-[10px] font-bold uppercase tracking-[0.06em] opacity-80">
                  {item.brand}
                </div>
                <div className="text-[11px] font-semibold leading-tight mt-0.5 truncate">
                  {item.name}
                </div>
                <div className="text-[10px] font-bold tabular-nums mt-0.5">
                  ${item.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-outline-variant">
        <Eyebrow className="mb-3">Your Fix</Eyebrow>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[5, 8].map((n) => (
            <button
              key={n}
              onClick={() => setFixSize(n)}
              className={cx(
                'p-3 rounded border text-left transition-colors',
                fixSize === n
                  ? 'bg-teal/15 border-teal'
                  : 'bg-surface-lowest border-outline-variant hover:border-navy',
              )}
            >
              <div className="flex items-baseline justify-between">
                <div className="text-[18px] text-navy font-bold tabular-nums">
                  {n}
                </div>
                {fixSize === n && (
                  <Icon name="check" size={14} className="text-teal-500" />
                )}
              </div>
              <div className="type-eyebrow text-ink-soft mt-1">
                items per Fix
              </div>
              {n === 8 && (
                <div className="text-[10px] text-teal-500 font-bold uppercase tracking-[0.06em] mt-1.5">
                  · more to choose from
                </div>
              )}
            </button>
          ))}
        </div>
        <Button
          variant="primary"
          className="w-full justify-center"
          onClick={commit}
        >
          <Icon name="check" /> Save my allowance
        </Button>
      </div>
    </div>
  );
}

// =======================================================================
// Captured signal — accumulating profile on the right
// =======================================================================

function mergeSizeProfile(items) {
  if (!items || items.length === 0) return null;
  // Most common size per category across anchors.
  const buckets = { Tops: [], Bottoms: [], Outerwear: [], Shoes: [] };
  items.forEach((it) => {
    Object.entries(it.sizeProfile || {}).forEach(([k, v]) => {
      if (buckets[k]) buckets[k].push(v);
    });
  });
  const mode = (arr) => {
    if (arr.length === 0) return null;
    const c = {};
    arr.forEach((v) => (c[v] = (c[v] || 0) + 1));
    return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
  };
  return {
    Tops: mode(buckets.Tops),
    Bottoms: mode(buckets.Bottoms),
    Outerwear: mode(buckets.Outerwear),
    Shoes: mode(buckets.Shoes),
  };
}

function CapturedSignal({ state, accuracy }) {
  const sizeProfile = mergeSizeProfile(state.closet?.items);
  const twin = state.twins?.pickedId
    ? FIT_TWINS.find((t) => t.id === state.twins.pickedId)
    : null;
  const hasSignal =
    accuracy > 0 ||
    !!twin ||
    !!state.sharpen?.done ||
    !!state.ar?.done ||
    !!state.budget?.band;

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <AccuracyMeter percent={accuracy} />
        <div className="mt-5 pt-5 border-t border-outline-variant space-y-3 text-[11px] text-ink-soft">
          {LAYER_META.map((m) => {
            const done =
              (m.id === 'closet' && (state.closet?.items || []).length > 0) ||
              (m.id === 'twins' && !!state.twins?.pickedId) ||
              (m.id === 'sharpen' && !!state.sharpen?.done) ||
              (m.id === 'ar' && !!state.ar?.done) ||
              (m.id === 'budget' && !!state.budget?.band);
            return (
              <div key={m.id} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span
                    className={cx(
                      'w-1.5 h-1.5 rounded-full',
                      done ? 'bg-teal' : 'bg-outline-variant',
                    )}
                  />
                  <span className={cx(done ? 'text-navy font-semibold' : '')}>
                    {m.title}
                  </span>
                </span>
                <span className="font-bold tabular-nums">
                  {m.accuracy ? `${m.accuracy}%` : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <Eyebrow className="mb-3">Captured profile</Eyebrow>
        {!hasSignal ? (
          <p className="type-body-md text-ink-soft leading-relaxed">
            Nothing yet. Play any layer to see the profile accrue.
          </p>
        ) : (
          <div className="space-y-4 text-[13px]">
            {sizeProfile && (
              <div>
                <div className="type-eyebrow text-ink-soft mb-2">
                  Size profile
                </div>
                <div className="space-y-1.5">
                  {Object.entries(sizeProfile).map(([k, v]) =>
                    v ? (
                      <div key={k} className="flex items-center justify-between">
                        <span className="text-ink-soft">{k}</span>
                        <span className="text-navy font-bold tabular-nums">
                          {v}
                        </span>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            )}

            {twin && (
              <div className="pt-3 border-t border-outline-variant">
                <div className="type-eyebrow text-ink-soft mb-2">Fit twin</div>
                <div className="flex items-start gap-2.5">
                  <span className={cx('w-5 h-6 rounded-sm ph-tex flex-shrink-0', twin.ph)} />
                  <div>
                    <div className="text-navy font-semibold">
                      {twin.summary}
                    </div>
                    <div className="text-[11.5px] text-ink-soft italic mt-0.5 leading-snug">
                      {twin.blurb}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {state.sharpen?.done && (
              <div className="pt-3 border-t border-outline-variant">
                <div className="type-eyebrow text-ink-soft mb-2">
                  Refinements
                </div>
                <div className="text-navy">
                  {Object.keys(state.sharpen.answers || {}).length} disambiguator
                  {Object.keys(state.sharpen.answers || {}).length !== 1 && 's'}{' '}
                  locked in
                </div>
              </div>
            )}

            {state.ar?.done && (
              <div className="pt-3 border-t border-outline-variant">
                <div className="type-eyebrow text-ink-soft mb-2">
                  Tailor precision
                </div>
                <div className="text-navy">AR scan complete · 98%</div>
              </div>
            )}

            {state.budget?.band && (
              <div className="pt-3 border-t border-outline-variant">
                <div className="type-eyebrow text-ink-soft mb-2">
                  Style allowance
                </div>
                <div className="text-navy font-semibold">
                  {state.budget.label}
                </div>
                <div className="text-[11.5px] text-ink-soft mt-1">
                  {state.budget.fixSize}-item Fix
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

// =======================================================================
// Layer sidebar
// =======================================================================

function LayerSidebar({ active, onSelect, state }) {
  const done = {
    closet: (state.closet?.items || []).length > 0,
    twins: !!state.twins?.pickedId,
    sharpen: !!state.sharpen?.done,
    ar: !!state.ar?.done,
    budget: !!state.budget?.band,
  };
  return (
    <Card className="p-2">
      {LAYER_META.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className={cx(
            'w-full flex items-start gap-3 p-3 rounded text-left transition-colors',
            active === m.id
              ? 'bg-teal/20 border border-teal'
              : 'border border-transparent hover:bg-surface-base',
          )}
        >
          <div
            className={cx(
              'w-8 h-8 rounded flex items-center justify-center text-[11px] font-bold border tabular-nums flex-shrink-0',
              done[m.id]
                ? 'bg-teal text-navy border-teal'
                : active === m.id
                  ? 'bg-navy text-white border-navy'
                  : 'bg-surface-lowest text-ink-soft border-outline-variant',
            )}
          >
            {done[m.id] ? <Icon name="check" size={12} /> : m.n}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[13px] text-navy font-semibold leading-tight">
                {m.title}
              </div>
              {m.accuracy ? (
                <span className="text-[10px] font-bold text-teal-500 tabular-nums flex-shrink-0">
                  +{m.accuracy}%
                </span>
              ) : null}
            </div>
            <div className="text-[11px] text-ink-soft mt-1 leading-snug">
              {m.sub}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] text-ink-soft font-bold uppercase tracking-[0.08em]">
                {m.time}
              </span>
              {!m.required && (
                <span className="text-[10px] text-ink-soft font-bold uppercase tracking-[0.08em]">
                  · optional
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </Card>
  );
}

// =======================================================================
// View
// =======================================================================

const LAYER_IMPLS = {
  closet: ClosetAnchorLayer,
  twins: FitTwinsLayer,
  sharpen: SharpenLayer,
  ar: ARLayer,
  budget: BudgetLayer,
};

function LAYER_NEXT(id) {
  const order = ['closet', 'twins', 'sharpen', 'ar', 'budget'];
  const idx = order.indexOf(id);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
}

export default function FitTwinView() {
  const [state, setState] = useState({});
  const [active, setActive] = useState('closet');
  const [runKey, setRunKey] = useState(0);

  function updateState(patch) {
    setState((s) => ({ ...s, ...patch }));
  }

  function handleDone() {
    const next = LAYER_NEXT(active);
    if (next) setActive(next);
  }

  function reset() {
    setState({});
    setActive('closet');
    setRunKey((k) => k + 1);
  }

  const accuracy = computeAccuracy(state);
  const Impl = LAYER_IMPLS[active];

  return (
    <div className="px-6 md:px-10 py-12 max-w-[1400px] mx-auto">
      <SectionHead
        eyebrow="Fit Twin / measurement + budget"
        title="Accuracy as a progress bar."
        sub="Five layers, the user picks how far to fill. Name one thing that fits → meet your Fit Twins → sharpen → opt into AR → set a Style Allowance."
        right={
          <div className="flex items-center gap-3">
            <div className="hidden md:block w-[320px]">
              <AccuracyMeter percent={accuracy} label="Session accuracy" />
            </div>
            <Button variant="secondary" onClick={reset}>
              <Icon name="back" /> Restart
            </Button>
          </div>
        }
      />

      <div className="grid md:grid-cols-[320px_1fr_320px] gap-6">
        <LayerSidebar active={active} onSelect={setActive} state={state} />

        <div className="flex items-start justify-center pt-2">
          <PhoneFrame key={active + '-' + runKey}>
            <Impl state={state} onUpdate={updateState} onDone={handleDone} />
          </PhoneFrame>
        </div>

        <CapturedSignal state={state} accuracy={accuracy} />
      </div>

      <div className="mt-16 pt-8 border-t border-outline-variant text-[11px] text-ink-soft font-bold uppercase tracking-[0.12em] flex items-center justify-between">
        <span>Dayone / Fit Twin / showcase</span>
        <span>Crowd data moat · agent-routed depth</span>
      </div>
    </div>
  );
}
