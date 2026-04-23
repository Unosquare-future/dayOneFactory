// Onboarding Simulator — the agentic live demo.
//
// Split screen:
//   Left:  device frame (mobile / desktop) playing the current screen
//   Right: live agent-action log streaming from Claude
// Bottom-right: captured signal + persona card (when complete).
//
// The orchestrator drives the conversation. Each `tool_use` event maps
// to one of the inline <Screen*> components; user interactions submit
// results back via `onSubmit`, which triggers the next Claude turn.

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
  cx,
  useEffect,
  useRef,
  useState,
} from '../ui.jsx';
import { useFactory } from '../state.jsx';
import {
  ARCHETYPES,
  CLASSIC_QS,
  MOOD_BOARDS,
} from '../data.js';
import {
  CLOSET_CATALOG,
  ESSENTIALS_CONFIG,
  FIT_TWINS,
  SHARPEN_PAIRS,
  TAILOR_METHOD,
  formatHeight,
} from '../fit-twin-data.js';
import { AgentOrchestrator, TOOL_FAMILY } from '../agent/orchestrator.js';
import { pickSessionLead } from '../agent/prompts.js';
import { buildSwipeDeck, buildTotDeck } from '../agent/decks.js';
import {
  getClientId,
  loadPersona,
  savePersona,
  saveSession,
  forgetPersona,
} from '../agent/memory.js';
import {
  captureFrame,
  requestCameraStream,
  stopStream,
} from '../agent/camera.js';
import { deriveMeasurements, detectPose, ensurePoseLandmarker } from '../agent/pose.js';

const SOFT_CAP = 12;
const MODEL = 'claude-sonnet-4-5';

// ======================================================================
// Desktop / mobile frames
// ======================================================================

function DesktopSimFrame({ children }) {
  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div className="rounded border border-outline-variant bg-navy p-2">
        <div className="flex items-center gap-1.5 pb-2 px-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white/25" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/25" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/25" />
          <span className="ml-3 text-[10px] uppercase tracking-[0.14em] font-bold text-white/60">
            stitchfix.com
          </span>
        </div>
        <div className="relative bg-surface rounded overflow-hidden" style={{ height: 620 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function DeviceFrame({ device, children, runKey }) {
  return device === 'desktop' ? (
    <DesktopSimFrame key={'dsk-' + runKey}>{children}</DesktopSimFrame>
  ) : (
    <PhoneFrame key={'mob-' + runKey}>{children}</PhoneFrame>
  );
}

// ======================================================================
// Screens — one per tool the agent can call
// ======================================================================

function WelcomeScreen({ thinking }) {
  return (
    <div className="absolute inset-0 bg-surface flex flex-col items-center justify-center text-center p-8">
      <div className="relative w-14 h-14 mb-5">
        <div className="absolute inset-0 rounded bg-navy" />
        <div className="absolute inset-2 rounded-sm bg-teal" />
        <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-lime" />
      </div>
      <Eyebrow className="text-lime-700 mb-2">Stitch Fix · onboarding</Eyebrow>
      <h2 className="type-headline-md text-navy leading-tight">
        Let's figure out how you dress.
      </h2>
      <p className="type-body-md text-ink-soft mt-3 max-w-[280px] leading-relaxed">
        Ten questions, give or take. We'll skip the boring parts.
      </p>
      {thinking && (
        <div className="mt-8 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 pulse-dot" />
          <span
            className="w-1.5 h-1.5 rounded-full bg-teal-500 pulse-dot"
            style={{ animationDelay: '160ms' }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-teal-500 pulse-dot"
            style={{ animationDelay: '320ms' }}
          />
          <span className="type-eyebrow text-ink-soft ml-2">
            the agent is thinking
          </span>
        </div>
      )}
    </div>
  );
}

// --- swipe ----------------------------------------------------------------

function SwipeScreen({ card, onSubmit }) {
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  function onDown(e) {
    setDragging(true);
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
  }
  function onMove(e) {
    if (!dragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setDrag(x - startX.current);
  }
  function onUp() {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(drag) > 90) finish(drag > 0);
    else setDrag(0);
  }
  function finish(liked) {
    onSubmit({
      swiped: liked ? 'yes' : 'no',
      card_id: card.id,
      card_label: card.label,
      brand: card.brand,
      tags: card.tags,
      archetypes: card.archetypes,
    });
  }

  const rot = drag * 0.06;
  const hasImage = !!card.imageUrl;

  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <Eyebrow>Style Shuffle</Eyebrow>
        <div className="text-[18px] font-semibold text-navy leading-tight mt-1">
          Yes or no on this?
        </div>
      </div>
      <div
        className="flex-1 relative px-5 pt-2 card-stack select-none"
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
      >
        <div
          className={cx(
            'absolute left-5 right-5 top-4 bottom-4 rounded-xl overflow-hidden border border-outline-variant cursor-grab active:cursor-grabbing',
            hasImage ? 'bg-surface-high' : cx('ph-tex', card.ph),
          )}
          style={{
            transform: `translateX(${drag}px) rotate(${rot}deg)`,
            transition: dragging
              ? 'none'
              : 'transform 300ms cubic-bezier(.2,.8,.2,1)',
          }}
          onMouseDown={onDown}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
        >
          {hasImage && (
            <img
              src={card.imageUrl}
              alt={`${card.brand} ${card.label}`}
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/65 via-transparent to-transparent pointer-events-none" />
          {drag > 40 && (
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded border-2 border-teal-500 text-[10px] uppercase tracking-[0.14em] font-bold text-teal-500 bg-surface-lowest/90">
              Yes, please
            </div>
          )}
          {drag < -40 && (
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded border-2 border-navy text-[10px] uppercase tracking-[0.14em] font-bold text-navy bg-surface-lowest/90">
              Not me
            </div>
          )}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="type-eyebrow text-white/80">{card.brand}</div>
            <div className="text-[18px] font-semibold leading-tight tracking-tight mt-1">
              {card.label}
            </div>
            {card.subcategory && (
              <div className="mt-2 type-eyebrow text-white/70">
                {card.subcategory} · {card.tags.slice(0, 3).join(' · ')}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="px-5 pt-3 pb-6 flex items-center justify-center gap-6">
        <button
          onClick={() => finish(false)}
          className="w-14 h-14 rounded bg-surface-lowest border border-navy flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-colors"
        >
          <Icon name="x" size={20} />
        </button>
        <div className="type-eyebrow text-ink-soft">swipe or tap</div>
        <button
          onClick={() => finish(true)}
          className="w-14 h-14 rounded bg-teal text-navy border border-teal hover:bg-teal-300 transition-colors flex items-center justify-center"
        >
          <Icon name="heart" size={20} />
        </button>
      </div>
    </div>
  );
}

// --- This or That --------------------------------------------------------

function ThisOrThatScreen({ pair, onSubmit }) {
  const [flash, setFlash] = useState(null);
  function pick(side) {
    setFlash(side);
    setTimeout(
      () =>
        onSubmit({
          chose: side,
          chose_id: pair[side].id,
          chose_label: pair[side].label,
          chose_brand: pair[side].brand,
          chose_archetype: pair[side].archetype,
          q: pair.q,
        }),
      260,
    );
  }
  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-2">
        <Eyebrow>This or That</Eyebrow>
        <div className="text-[20px] font-semibold text-navy leading-tight tracking-tight mt-1">
          {pair.q}
        </div>
      </div>
      <div className="flex-1 px-5 py-3 grid grid-rows-2 gap-3">
        {['a', 'b'].map((side) => {
          const opt = pair[side];
          const hasImage = !!opt.imageUrl;
          return (
            <button
              key={side}
              onClick={() => pick(side)}
              className={cx(
                'relative rounded-md overflow-hidden border transition-all text-left',
                hasImage ? 'bg-surface-high' : cx('ph-tex', opt.ph),
                flash === side
                  ? 'ring-4 ring-teal scale-[0.985] border-teal'
                  : 'border-outline-variant hover:scale-[1.01]',
              )}
            >
              {hasImage && (
                <img
                  src={opt.imageUrl}
                  alt={`${opt.brand} ${opt.label}`}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-3 left-3 type-eyebrow text-white/80">
                {side.toUpperCase()}
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                {opt.brand && (
                  <div className="type-eyebrow text-white/80 mb-1">
                    {opt.brand}
                  </div>
                )}
                <div className="text-[17px] font-semibold leading-tight tracking-tight">
                  {opt.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="text-center pb-4 type-eyebrow text-ink-soft">
        no wrong answer
      </div>
    </div>
  );
}

// --- Taste Transfer — 3 tabs (mood / handle / celeb) ---------------------
// A fully real Taste Transfer moment: pick a curated mood, or paste an
// Instagram handle, or pick a taste icon. All three submit signal that
// the agent uses in its next turn. For Instagram and celeb modes we
// pass the handle/name to Claude who infers the aesthetic from its
// training knowledge — no spoofed results, no faked photos.

const CELEB_PICKS = [
  { name: 'Carolyn Bessette', desc: 'sharp minimalism, one perfect line', id: 'modern-muse' },
  { name: 'Steve McQueen', desc: 'work jacket, boot, quiet cool', id: 'rustic-rebel' },
  { name: 'Jane Birkin', desc: 'relaxed, soft, a little unbothered', id: 'coastal-sport' },
  { name: 'Brunello Cucinelli', desc: 'cashmere as a philosophy', id: 'modern-prep' },
  { name: 'Sade', desc: 'ink, silver, restraint', id: 'studio-minimal' },
  { name: 'Jenny Slate', desc: 'soft prints, stories, layers', id: 'boho-dreamer' },
];

/** Map each mood's gradient palette to the first inventory item with a
 *  real Unsplash image that shares it — so mood tiles render photos. */
function moodHeroFor(mood, inventory) {
  const match = inventory.find((i) => i.ph === mood.ph && i.imageUrl);
  return match || null;
}

function TasteTransferScreen({ onSubmit }) {
  const { inventory } = useFactory();
  const [mode, setMode] = useState('board');
  const [handle, setHandle] = useState('');
  const [processing, setProcessing] = useState(false);

  function submitMood(m) {
    onSubmit({
      mode: 'mood',
      mood_id: m.id,
      mood_title: m.title,
      mood_sub: m.sub,
    });
  }
  function submitHandle() {
    const h = handle.trim().replace(/^@/, '');
    if (!h) return;
    setProcessing(true);
    // Fire immediately — Claude infers aesthetic on the next turn
    setTimeout(() => {
      onSubmit({
        mode: 'instagram_handle',
        handle: h,
        note:
          'User submitted an Instagram handle. Read the aesthetic from your training knowledge of this creator/brand if known; if unknown, say so honestly and lean on other signals.',
      });
    }, 300);
  }
  function submitCeleb(c) {
    onSubmit({
      mode: 'celeb',
      name: c.name,
      descriptor: c.desc,
      archetype_hint: c.id,
    });
  }

  if (processing) {
    return (
      <div className="absolute inset-0 bg-surface flex flex-col items-center justify-center p-8 text-center">
        <div className="relative w-24 h-24 mb-5">
          <div className="absolute inset-0 rounded-full border-2 border-outline-variant" />
          <div
            className="absolute inset-0 rounded-full border-2 border-teal border-t-transparent animate-spin"
            style={{ animationDuration: '1.4s' }}
          />
        </div>
        <div className="type-headline-md text-navy leading-tight">
          Reading between the lines.
        </div>
        <div className="type-eyebrow text-ink-soft mt-2">
          @{handle.replace(/^@/, '')}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <Eyebrow>Taste Transfer</Eyebrow>
        <div className="text-[17px] font-semibold text-navy leading-tight tracking-tight mt-1">
          Pick a mood. Drop a handle. Pick a taste icon.
        </div>
      </div>
      <div className="px-5 pb-3">
        <Segmented
          className="w-full flex"
          options={[
            { value: 'board', label: 'Mood board' },
            { value: 'handle', label: 'Instagram' },
            { value: 'celeb', label: 'Taste icon' },
          ]}
          value={mode}
          onChange={setMode}
        />
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {mode === 'board' && (
          <div className="grid grid-cols-3 gap-2">
            {MOOD_BOARDS.map((m) => {
              const hero = moodHeroFor(m, inventory);
              return (
                <button
                  key={m.id}
                  onClick={() => submitMood(m)}
                  className={cx(
                    'relative aspect-[3/4] rounded overflow-hidden border transition-all border-outline-variant hover:scale-[1.02] hover:border-navy',
                    hero ? 'bg-surface-high' : cx('ph-tex', m.ph),
                  )}
                >
                  {hero && (
                    <img
                      src={hero.imageUrl}
                      alt={m.title}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent" />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 text-left">
                    <div className="text-[12px] text-white font-semibold leading-tight">
                      {m.title}
                    </div>
                    <div className="text-[8px] uppercase tracking-[0.14em] font-bold text-white/80 mt-0.5">
                      {m.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {mode === 'handle' && (
          <div className="pt-4 space-y-3">
            <Eyebrow>Instagram handle</Eyebrow>
            <div className="flex items-center gap-2 bg-surface-lowest border border-outline-variant rounded px-4 py-3 focus-within:border-teal">
              <span className="text-ink-soft">@</span>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value.replace(/^@/, ''))}
                onKeyDown={(e) => e.key === 'Enter' && submitHandle()}
                placeholder="someone whose closet you'd raid"
                className="flex-1 bg-transparent text-[13.5px] placeholder:text-outline"
                style={{ boxShadow: 'none' }}
                autoFocus
              />
            </div>
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={submitHandle}
              disabled={!handle.trim()}
            >
              <Icon name="sparkle" /> Read the aesthetic
            </Button>
            <div className="text-[11px] text-ink-soft leading-relaxed pt-1">
              Your handle goes to the agent, which reads the aesthetic
              from public training knowledge. If the account is unknown
              we'll say so honestly.
            </div>
          </div>
        )}

        {mode === 'celeb' && (
          <div className="pt-3 space-y-2">
            {CELEB_PICKS.map((c) => (
              <button
                key={c.name}
                onClick={() => submitCeleb(c)}
                className="w-full flex items-center gap-3 p-3 rounded border border-outline-variant bg-surface-lowest hover:border-navy hover:bg-surface-low transition-colors text-left"
              >
                <div
                  className={cx(
                    'w-10 h-10 rounded-full ph-tex flex-shrink-0',
                    (() => {
                      const map = {
                        'modern-muse': 'ph-10',
                        'rustic-rebel': 'ph-7',
                        'coastal-sport': 'ph-4',
                        'modern-prep': 'ph-11',
                        'studio-minimal': 'ph-2',
                        'boho-dreamer': 'ph-8',
                      };
                      return map[c.id] || 'ph-5';
                    })(),
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-navy font-semibold">{c.name}</div>
                  <div className="text-[11px] text-ink-soft italic mt-0.5">{c.desc}</div>
                </div>
                <Icon name="chev" className="text-outline" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- chat message --------------------------------------------------------

function ChatMessageScreen({ message, options, onSubmit }) {
  const [typed, setTyped] = useState('');
  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3 flex items-center gap-3 border-b border-outline-variant">
        <div className="w-9 h-9 rounded-full ph-8 ph-tex" />
        <div>
          <div className="text-[14px] text-navy font-semibold leading-tight">
            Ava
          </div>
          <div className="text-[10px] text-teal-500 uppercase tracking-[0.12em] font-bold flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 pulse-dot" />
            stylist, online
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="max-w-[85%] px-3.5 py-2.5 rounded text-[13.5px] leading-snug bg-surface-lowest text-navy border border-outline-variant bloom">
          {message}
        </div>
        {options?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 max-w-[85%]">
            {options.map((o) => (
              <button
                key={o}
                onClick={() =>
                  onSubmit({ reply: o, options, message })
                }
                className="px-3 py-1.5 rounded border border-teal bg-teal/20 text-navy text-[12px] font-bold hover:bg-teal transition-colors"
              >
                {o}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="p-3 border-t border-outline-variant">
        <div className="flex items-center gap-2 bg-surface-lowest border border-outline-variant rounded px-4 py-2.5 focus-within:border-teal">
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && typed.trim()) {
                onSubmit({ reply: typed, freeform: true, message });
                setTyped('');
              }
            }}
            placeholder="…or type your own"
            className="flex-1 bg-transparent text-[13.5px] placeholder:text-outline"
            style={{ boxShadow: 'none' }}
          />
          <button
            onClick={() => {
              if (typed.trim()) {
                onSubmit({ reply: typed, freeform: true, message });
                setTyped('');
              }
            }}
            className="text-teal-500 hover:text-navy"
          >
            <Icon name="send" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- classic question ---------------------------------------------------

function ClassicScreen({ question, onSubmit }) {
  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-6 pt-6 pb-3">
        <Eyebrow>Classic · refined</Eyebrow>
      </div>
      <div className="flex-1 px-6 pb-6 flex flex-col">
        <h2 className="text-[24px] font-semibold leading-tight text-navy mb-5 tracking-tight">
          {question.q}
        </h2>
        <div className="space-y-2.5 flex-1">
          {question.opts.map((o) => (
            <button
              key={o}
              onClick={() =>
                onSubmit({ answer: o, question: question.q })
              }
              className="w-full text-left p-4 rounded border border-outline-variant bg-surface-lowest hover:border-navy transition-colors"
            >
              <span className="text-[14px] text-navy">{o}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Fit Twin: essentials (Layer 00) ------------------------------------

function EssentialsScreen({ onSubmit }) {
  const [segment, setSegment] = useState(null);
  const [heightIn, setHeightIn] = useState(ESSENTIALS_CONFIG.heightInches.default);
  const [shoe, setShoe] = useState(null);

  const shoeOptions = segment
    ? ESSENTIALS_CONFIG.shoeSizes[segment] ||
      ESSENTIALS_CONFIG.shoeSizes.Women
    : ESSENTIALS_CONFIG.shoeSizes.Women;

  const canContinue = !!segment && !!shoe;

  function commit() {
    if (!canContinue) return;
    onSubmit({
      layer: 'essentials',
      segment,
      height_inches: heightIn,
      height_label: formatHeight(heightIn),
      shoe_size: shoe,
    });
  }

  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <Eyebrow>Fit Twin · layer 00</Eyebrow>
          <Badge tone="teal">Essentials</Badge>
        </div>
        <div className="text-[19px] font-semibold text-navy leading-tight tracking-tight">
          Three quick things to size you right.
        </div>
        <p className="text-[12px] text-ink-soft mt-2 leading-relaxed">
          Gender, height, shoe size — the whole rest of the flow depends
          on these.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-5">
        <section>
          <Eyebrow className="mb-2">I'm shopping for</Eyebrow>
          <div className="grid grid-cols-3 gap-1.5">
            {ESSENTIALS_CONFIG.segments.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSegment(s.id);
                  setShoe(null);
                }}
                className={cx(
                  'px-3 py-3 rounded text-center border transition-colors',
                  segment === s.id
                    ? 'bg-navy text-white border-navy'
                    : 'bg-surface-lowest text-navy border-outline-variant hover:border-navy',
                )}
              >
                <div className="text-[13px] font-bold uppercase tracking-[0.08em]">
                  {s.label}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-2">
            <Eyebrow>Height</Eyebrow>
            <span className="text-[15px] text-navy font-bold tabular-nums">
              {formatHeight(heightIn)}
            </span>
          </div>
          <input
            type="range"
            min={ESSENTIALS_CONFIG.heightInches.min}
            max={ESSENTIALS_CONFIG.heightInches.max}
            step="1"
            value={heightIn}
            onChange={(e) => setHeightIn(Number(e.target.value))}
            className="w-full accent-teal-500"
            style={{ boxShadow: 'none' }}
          />
          <div className="flex items-center justify-between mt-1.5 type-eyebrow text-ink-soft">
            <span>{formatHeight(ESSENTIALS_CONFIG.heightInches.min)}</span>
            <span>{formatHeight(ESSENTIALS_CONFIG.heightInches.max)}</span>
          </div>
        </section>

        <section>
          <Eyebrow className="mb-2">
            Shoe size{' '}
            {segment && (
              <span className="text-ink-soft/60 tracking-[0.08em] lowercase">
                · {segment}
              </span>
            )}
          </Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            {shoeOptions.map((s) => (
              <button
                key={s}
                onClick={() => setShoe(s)}
                className={cx(
                  'px-3 py-1.5 rounded text-[11px] font-bold tabular-nums border transition-colors',
                  shoe === s
                    ? 'bg-teal text-navy border-teal'
                    : 'bg-surface-lowest text-navy border-outline-variant hover:border-navy',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-outline-variant">
        <Button
          variant="primary"
          className="w-full justify-center"
          onClick={commit}
          disabled={!canContinue}
        >
          <Icon name="check" /> Continue
        </Button>
      </div>
    </div>
  );
}

// --- Final Tailor-Precision (unified offer + AR capture) -----------------
// ONE screen, one tool call. Phases:
//   prompt   — "open camera" / "skip"
//   preview  — live video + "capture" / "skip"
//   capturing — frame grabbed
//   analyzing — MediaPipe Pose landmarks → measurements
//   error    — retry / skip
// The submit payload includes either { accepted:false } OR
// { accepted:true, captured, image_base64, measurements }.

function FinalPrecisionScreen({ onSubmit, heightInches }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [phase, setPhase] = useState('prompt'); // prompt | preview | capturing | analyzing | error
  const [err, setErr] = useState(null);

  useEffect(() => {
    // Cleanup when the screen unmounts
    return () => stopStream(stream);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  async function openCamera() {
    try {
      // Preload the MediaPipe model in the background while the user
      // lines up the shot — by the time they hit Capture it's ready.
      ensurePoseLandmarker().catch(() => {});
      const s = await requestCameraStream();
      if (videoRef.current) videoRef.current.srcObject = s;
      setStream(s);
      setPhase('preview');
    } catch (e) {
      setErr(e.message || 'Camera unavailable');
      setPhase('error');
    }
  }

  async function capture() {
    try {
      setPhase('capturing');
      const frame = captureFrame(videoRef.current);
      setPhase('analyzing');
      stopStream(stream);
      setStream(null);

      let measurements = null;
      try {
        const img = new Image();
        img.src = frame.dataUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        const pose = await detectPose(img);
        if (pose && heightInches) {
          measurements = deriveMeasurements(pose, heightInches);
        }
      } catch (poseErr) {
        // Non-fatal — still submit the frame
        // eslint-disable-next-line no-console
        console.warn('[final-precision] pose detect failed:', poseErr?.message || poseErr);
      }

      onSubmit({
        accepted: true,
        captured: true,
        image_base64: frame.base64,
        image_media_type: frame.mediaType,
        measurements,
        tailor_method: TAILOR_METHOD.name,
      });
    } catch (e) {
      setErr(e.message || 'Capture failed');
      setPhase('error');
    }
  }

  function skip() {
    stopStream(stream);
    setStream(null);
    onSubmit({ accepted: false });
  }

  if (phase === 'capturing' || phase === 'analyzing') {
    return (
      <div className="absolute inset-0 bg-navy text-white flex flex-col items-center justify-center text-center p-6">
        <div className="relative w-36 h-36 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-white/20" />
          <div
            className="absolute inset-0 rounded-full border-2 border-teal border-t-transparent animate-spin"
            style={{ animationDuration: '1.4s' }}
          />
        </div>
        <div className="text-[20px] font-semibold">
          {phase === 'capturing' ? 'Capturing.' : 'Locking fit signal.'}
        </div>
        <div className="type-eyebrow text-white/70 mt-3">
          {TAILOR_METHOD.name} · 98%
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="absolute inset-0 bg-surface flex flex-col p-5">
        <div className="flex items-center justify-between mb-2">
          <Eyebrow>Optional · before we wrap</Eyebrow>
          <Badge tone="outline">Camera unavailable</Badge>
        </div>
        <div className="text-[17px] font-semibold text-navy leading-tight">
          Couldn't open the camera.
        </div>
        <p className="text-[12px] text-ink-soft mt-2 leading-relaxed">
          {err} — this is usually a browser permission prompt. You can
          retry or skip and we'll wrap with 95% fit accuracy.
        </p>
        <div className="mt-auto space-y-2">
          <Button
            variant="primary"
            className="w-full justify-center"
            onClick={openCamera}
          >
            <Icon name="sparkle" /> Try again
          </Button>
          <button
            onClick={skip}
            className="w-full text-center text-[12px] text-ink-soft py-1.5 hover:text-navy font-bold uppercase tracking-[0.08em]"
          >
            Skip — finish with 95%
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'preview') {
    return (
      <div className="absolute inset-0 bg-navy flex flex-col">
        <div className="px-5 pt-5 pb-2 text-white">
          <Eyebrow className="text-white/80">Tailor-level precision</Eyebrow>
          <div className="text-[17px] font-semibold leading-tight mt-1">
            Step back until you're fully in frame.
          </div>
        </div>
        <div className="flex-1 relative bg-black/40 mx-5 my-3 rounded-md overflow-hidden border border-white/20">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          />
          <div className="absolute inset-6 rounded-md border-2 border-teal/60 pointer-events-none" />
        </div>
        <div className="px-5 pb-5 pt-2 space-y-2">
          <Button
            variant="primary"
            className="w-full justify-center"
            onClick={capture}
          >
            <Icon name="sparkle" /> Capture
          </Button>
          <button
            onClick={skip}
            className="w-full text-center text-[12px] text-white/70 py-1.5 hover:text-white font-bold uppercase tracking-[0.08em]"
          >
            Skip — finish with 95%
          </button>
        </div>
      </div>
    );
  }

  // phase === 'prompt'
  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <Eyebrow>Optional · final step</Eyebrow>
          <Badge tone="lime">Premium · +98%</Badge>
        </div>
        <div className="text-[19px] font-semibold text-navy leading-tight tracking-tight">
          Want tailor-level precision?
        </div>
      </div>
      <div className="flex-1 px-5 pb-3 flex flex-col">
        <div className="relative flex-1 rounded-md border border-outline-variant overflow-hidden bg-navy text-white flex flex-col items-center justify-center p-6 ph-tex ph-10">
          <div className="absolute inset-0 bg-gradient-to-b from-navy/40 to-navy/80 pointer-events-none" />
          <div className="relative text-center max-w-[240px]">
            <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-4 border border-white/30">
              <Icon name="sparkle" size={22} className="text-white" />
            </div>
            <div className="text-[18px] font-semibold leading-tight">
              One selfie unlocks 98% fit.
            </div>
            <p className="text-[12px] text-white/85 mt-3 leading-relaxed">
              Powered by {TAILOR_METHOD.name} — runs locally in this tab.
              We combine 33 pose landmarks with the height you already
              entered to measure shoulder, torso, and inseam.
            </p>
            <p className="text-[10.5px] text-white/60 mt-2 italic">
              {TAILOR_METHOD.vendor} · {TAILOR_METHOD.runtime}
            </p>
          </div>
        </div>
      </div>
      <div className="px-5 pb-5 pt-3 border-t border-outline-variant space-y-2">
        <Button
          variant="primary"
          className="w-full justify-center"
          onClick={openCamera}
        >
          <Icon name="sparkle" /> Open camera
        </Button>
        <button
          onClick={skip}
          className="w-full text-center text-[12px] text-ink-soft py-1.5 hover:text-navy font-bold uppercase tracking-[0.08em]"
        >
          Skip — finish with 95%
        </button>
      </div>
    </div>
  );
}

// --- Fit Twin: closet anchor (Layer 01) -------------------------------
// The writeup's key insight: one garment that fits gives ~80% signal.
// Two (one top + one bottom) pushes us to ~85% and — importantly —
// covers the full body so we can infer measurements top-to-bottom.
// ----------------------------------------------------------------------

function AnchorInput({
  slotLabel,          // "Top" | "Bottom"
  filterCategories,   // e.g. ['Tops']  or  ['Bottoms']
  selected,
  onSelect,
  size,
  onSize,
}) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const pool = CLOSET_CATALOG.filter((g) => filterCategories.includes(g.category));
  const suggestions = query.trim()
    ? pool.filter((g) => {
        const q = query.toLowerCase();
        return (
          g.keywords.some((k) => k.includes(q)) ||
          g.brand.toLowerCase().includes(q) ||
          g.name.toLowerCase().includes(q)
        );
      }).slice(0, 5)
    : [];
  return (
    <div>
      <Eyebrow className="mb-1.5">{slotLabel}</Eyebrow>
      <div className="relative">
        <div className="flex items-center gap-2 bg-surface-lowest border border-outline-variant rounded px-3 py-2 focus-within:border-teal">
          <Icon name="search" size={14} className="text-ink-soft" />
          <input
            value={
              selected ? `${selected.brand} ${selected.name}` : query
            }
            onChange={(e) => {
              onSelect(null);
              setQuery(e.target.value);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder={
              slotLabel === 'Top'
                ? 'e.g. J.Crew cashmere, Uniqlo Airism'
                : "e.g. Levi's 501, Madewell Cali"
            }
            className="flex-1 bg-transparent text-[12.5px] placeholder:text-outline"
            style={{ boxShadow: 'none' }}
          />
        </div>
        {focused && suggestions.length > 0 && !selected && (
          <div className="absolute left-0 right-0 mt-1.5 bg-surface-lowest border border-outline-variant rounded shadow-lift overflow-hidden z-10">
            {suggestions.map((g) => (
              <button
                key={g.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(g);
                  setQuery('');
                }}
                className="w-full text-left px-3 py-2 hover:bg-surface-base transition-colors flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] text-navy font-semibold leading-tight">
                    {g.brand}
                  </div>
                  <div className="text-[11px] text-ink-soft truncate">
                    {g.name}
                  </div>
                </div>
                <div className="type-eyebrow text-ink-soft">{g.category}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      {selected && (
        <div className="mt-2 flex flex-wrap gap-1 bloom">
          {selected.sizes.map((s) => (
            <button
              key={s}
              onClick={() => onSize(s)}
              className={cx(
                'px-2.5 py-1 rounded text-[10.5px] font-bold tabular-nums border transition-colors',
                size === s
                  ? 'bg-navy text-white border-navy'
                  : 'bg-surface-lowest text-navy border-outline-variant hover:border-navy',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ClosetAnchorScreen({ onSubmit }) {
  const [topItem, setTopItem] = useState(null);
  const [topSize, setTopSize] = useState('');
  const [bottomItem, setBottomItem] = useState(null);
  const [bottomSize, setBottomSize] = useState('');

  const canContinue =
    topItem && topSize && bottomItem && bottomSize;

  function commit() {
    if (!canContinue) return;
    onSubmit({
      layer: 'closet_anchor',
      top: {
        brand: topItem.brand,
        name: topItem.name,
        size: topSize,
        size_profile: topItem.sizeProfile,
      },
      bottom: {
        brand: bottomItem.brand,
        name: bottomItem.name,
        size: bottomSize,
        size_profile: bottomItem.sizeProfile,
      },
    });
  }

  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <Eyebrow>Fit Twin · layer 01</Eyebrow>
          <Badge tone="teal">+85%</Badge>
        </div>
        <div className="text-[17px] font-semibold text-navy leading-tight tracking-tight">
          Name one top and one bottom that fit you well.
        </div>
        <p className="text-[11.5px] text-ink-soft mt-1.5 leading-relaxed">
          Two anchors cover your whole body — we use the brand's real
          measurements to size you head to toe.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-4">
        <AnchorInput
          slotLabel="Top"
          filterCategories={['Tops']}
          selected={topItem}
          onSelect={setTopItem}
          size={topSize}
          onSize={setTopSize}
        />
        <AnchorInput
          slotLabel="Bottom"
          filterCategories={['Bottoms']}
          selected={bottomItem}
          onSelect={setBottomItem}
          size={bottomSize}
          onSize={setBottomSize}
        />
      </div>
      <div className="px-5 pb-5 pt-3 border-t border-outline-variant">
        <Button
          variant="primary"
          className="w-full justify-center"
          onClick={commit}
          disabled={!canContinue}
        >
          <Icon name="check" /> Lock in both anchors
        </Button>
      </div>
    </div>
  );
}

// --- Fit Twin: fit twins (Layer 02) --------------------------------------
// The twin cards are now filtered + sorted by what we already know.
// Height drives the sort order (closest-to-user first). If we captured
// the two closet anchors, the numeric sizes nudge which twin archetypes
// dominate (e.g. petite denim < 26 → petite twin first).

/** Parse a height string like "5'6\"" out of a twin's summary. */
function twinHeightInches(t) {
  const m = t.summary && t.summary.match(/(\d+)'(\d+)/);
  if (!m) return null;
  return Number(m[1]) * 12 + Number(m[2]);
}

function pickRelevantTwins(userHeightIn, closetAnchor) {
  const scored = FIT_TWINS.map((t) => {
    const th = twinHeightInches(t);
    const heightDelta =
      th != null && userHeightIn ? Math.abs(th - userHeightIn) : 99;
    // Nudge petite twin up if bottom size is very small
    let bias = 0;
    const bottomSize = closetAnchor?.bottom?.size;
    const bottomNum = bottomSize ? Number(bottomSize) : null;
    if (bottomNum && bottomNum <= 25 && /petite/i.test(t.blurb)) bias -= 8;
    if (bottomNum && bottomNum >= 30 && /straight|long/i.test(t.blurb)) bias -= 4;
    return { twin: t, score: heightDelta + bias };
  });
  scored.sort((a, b) => a.score - b.score);
  // Return top 4 (grid fits 2x2 on phone frame)
  return scored.slice(0, 4).map((s) => s.twin);
}

function FitTwinsScreen({ onSubmit, essentials, closetAnchor }) {
  const heightIn = essentials?.height_inches;
  const heightLabel = essentials?.height_label;
  const twins = pickRelevantTwins(heightIn, closetAnchor);
  const noteBits = [];
  if (heightLabel) noteBits.push(heightLabel);
  if (closetAnchor?.top?.size) noteBits.push(`top ${closetAnchor.top.size}`);
  if (closetAnchor?.bottom?.size)
    noteBits.push(`bottom ${closetAnchor.bottom.size}`);

  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <Eyebrow>Fit Twin · layer 02</Eyebrow>
          <Badge tone="teal">+90%</Badge>
        </div>
        <div className="text-[18px] font-semibold text-navy leading-tight tracking-tight">
          Which one is closest to you?
        </div>
        {noteBits.length > 0 && (
          <p className="text-[11px] text-ink-soft mt-1.5 leading-relaxed">
            Shortlisted to match what we have on you · {noteBits.join(' · ')}.
          </p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="grid grid-cols-2 gap-2.5">
          {twins.map((t) => (
            <button
              key={t.id}
              onClick={() =>
                onSubmit({
                  layer: 'fit_twins',
                  twin_id: t.id,
                  summary: t.summary,
                  blurb: t.blurb,
                  signals: t.signals,
                })
              }
              className={cx(
                'relative text-left rounded-md overflow-hidden border p-3 min-h-[140px] ph-tex flex flex-col justify-end border-outline-variant hover:scale-[1.01]',
                t.ph,
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
              <div className="relative">
                <div className="type-eyebrow text-white/80">{t.label}</div>
                <div className="text-[13px] text-white font-semibold leading-tight mt-1">
                  {t.summary}
                </div>
                <p className="text-[10.5px] text-white/85 mt-1 leading-snug italic">
                  {t.blurb}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Fit Twin: sharpen ---------------------------------------------------

function SharpenScreen({ onSubmit }) {
  const pair = SHARPEN_PAIRS[0];
  const [flash, setFlash] = useState(null);
  function pick(side) {
    setFlash(side);
    setTimeout(
      () =>
        onSubmit({
          layer: 'sharpen',
          question: pair.q,
          chose: side,
          chose_label: pair[side].label,
        }),
      260,
    );
  }
  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <Eyebrow>Fit Twin · layer 03</Eyebrow>
          <Badge tone="teal">+95%</Badge>
        </div>
        <div className="type-eyebrow text-lime-700 mb-1">
          {pair.eyebrow}
        </div>
        <div className="text-[18px] font-semibold text-navy leading-tight tracking-tight">
          {pair.q}
        </div>
      </div>
      <div className="flex-1 px-5 py-3 grid grid-rows-2 gap-3">
        {['a', 'b'].map((side) => (
          <button
            key={side}
            onClick={() => pick(side)}
            className={cx(
              'relative rounded-md overflow-hidden ph-tex border text-left transition-all',
              pair[side].ph,
              flash === side
                ? 'ring-4 ring-teal scale-[0.985] border-teal'
                : 'border-outline-variant hover:scale-[1.01]',
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
            <div className="relative h-full p-4 flex flex-col justify-end">
              <div className="type-eyebrow text-white/80">
                {side.toUpperCase()}
              </div>
              <div className="text-[16px] font-semibold text-white leading-tight mt-1">
                {pair[side].label}
              </div>
              <div className="text-[11px] text-white/80 italic mt-1">
                {pair[side].hint}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}


// --- Fit Twin: budget ----------------------------------------------------

const BUDGET_BANDS = [
  { key: 'under75', label: '$50–75 / item', low: 40, high: 85 },
  { key: 'mid', label: '$75–125 / item', low: 85, high: 135 },
  { key: 'upper', label: '$125–200 / item', low: 135, high: 220 },
  { key: 'premium', label: '$200+ / item', low: 220, high: 9999 },
];

function BudgetScreen({ onSubmit }) {
  const { inventory } = useFactory();
  const [bandIdx, setBandIdx] = useState(1);
  const [fixSize, setFixSize] = useState(8);
  const band = BUDGET_BANDS[bandIdx];
  const previews = inventory
    .filter((i) => i.category === 'Women')
    .filter((i) =>
      ['Tops', 'Bottoms', 'Outerwear', 'Dresses'].includes(i.subcategory),
    )
    .filter((i) => i.price >= band.low && i.price <= band.high)
    .slice(0, 4);
  const filled =
    previews.length >= 4
      ? previews
      : [
          ...previews,
          ...inventory
            .filter((i) => i.category === 'Women')
            .slice(0, 4 - previews.length),
        ];
  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <Eyebrow>Fit Twin · layer 05</Eyebrow>
        <div className="text-[18px] font-semibold text-navy leading-tight tracking-tight mt-1">
          What changes with your budget.
        </div>
      </div>
      <div className="px-5 pb-3">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-[15px] text-navy font-bold">{band.label}</div>
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
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-3">
        <div className="grid grid-cols-2 gap-2">
          {filled.map((item) => (
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
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
              <div className="absolute bottom-1.5 left-1.5 right-1.5 text-white">
                <div className="text-[9px] font-bold uppercase tracking-[0.06em] opacity-80">
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
      <div className="px-5 pb-5 pt-3 border-t border-outline-variant space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[5, 8].map((n) => (
            <button
              key={n}
              onClick={() => setFixSize(n)}
              className={cx(
                'p-2 rounded border text-left transition-colors',
                fixSize === n
                  ? 'bg-teal/15 border-teal'
                  : 'bg-surface-lowest border-outline-variant hover:border-navy',
              )}
            >
              <div className="text-[16px] text-navy font-bold tabular-nums">
                {n}
              </div>
              <div className="type-eyebrow text-ink-soft">items per Fix</div>
            </button>
          ))}
        </div>
        <Button
          variant="primary"
          className="w-full justify-center"
          onClick={() =>
            onSubmit({
              layer: 'budget',
              band: band.key,
              band_label: band.label,
              fix_size: fixSize,
            })
          }
        >
          <Icon name="check" /> Save my allowance
        </Button>
      </div>
    </div>
  );
}

// ======================================================================
// Completion — celebratory reveal
// ======================================================================

function CompletionScreen({ persona, onRestart, fitAccuracy }) {
  const archetype =
    ARCHETYPES.find((a) => a.id === persona?.archetype_id) || ARCHETYPES[0];
  const conf = persona?.confidence || 85;
  const accuracy = fitAccuracy || 0;
  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className={cx('relative h-[36%] ph-tex', archetype.palette)}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface" />
        <div className="absolute top-4 left-4 type-eyebrow text-white/90 bloom">
          Welcome to the family
        </div>
        {/* Tailored Fit Accuracy — top-right corner */}
        <div className="absolute top-4 right-4 bloom">
          <div className="px-3 py-2 rounded bg-surface-lowest border border-outline-variant text-right">
            <div className="type-eyebrow text-ink-soft">Tailored fit accuracy</div>
            <div className="text-[22px] text-navy font-bold leading-none tabular-nums mt-1">
              {accuracy}%
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 pt-3 pb-6 flex-1 flex flex-col bloom">
        <Eyebrow className="text-lime-700">Your StyleFile is live</Eyebrow>
        <h2 className="type-headline-lg text-navy leading-[0.95] mt-2">
          {archetype.name}
        </h2>
        <div className="mt-2">
          <Badge tone="teal">{conf}% confidence</Badge>
        </div>
        <p className="italic text-[15px] leading-snug text-ink-soft mt-3">
          {persona?.persona_summary || archetype.tagline}
        </p>
        <div className="mt-auto pt-4 space-y-2">
          <Button variant="primary" className="w-full justify-center">
            <Icon name="sparkle" /> Schedule your first Fix
          </Button>
          <button
            onClick={onRestart}
            className="w-full text-center text-[12px] text-ink-soft py-1 hover:text-navy"
          >
            Run it again with a different visitor
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================================================================
// Agent log panel
// ======================================================================

function AgentLog({ entries, thinking }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [entries.length, thinking]);
  return (
    <Card className="p-0 overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between">
        <div>
          <Eyebrow>Agent · live trace</Eyebrow>
          <div className="text-[13px] text-navy font-semibold mt-1">
            Claude Sonnet 4.5 · tool-use
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cx(
              'w-2 h-2 rounded-full',
              thinking ? 'bg-lime-700 pulse-dot' : 'bg-teal-500',
            )}
          />
          <span className="type-eyebrow text-ink-soft">
            {thinking ? 'thinking' : 'idle'}
          </span>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[360px]"
      >
        {entries.length === 0 && !thinking ? (
          <div className="type-eyebrow text-ink-soft text-center py-8">
            press start to kick off the simulation
          </div>
        ) : (
          entries.map((e, i) => <LogLine key={i} entry={e} />)
        )}
        {thinking && (
          <div className="flex items-center gap-1.5 pt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-outline pulse-dot" />
            <span
              className="w-1.5 h-1.5 rounded-full bg-outline pulse-dot"
              style={{ animationDelay: '160ms' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-outline pulse-dot"
              style={{ animationDelay: '320ms' }}
            />
            <span className="type-eyebrow text-ink-soft ml-1">
              streaming from Claude
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

function LogLine({ entry }) {
  const ts = entry.ts
    ? new Date(entry.ts).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '';
  if (entry.kind === 'reasoning') {
    return (
      <div className="flex gap-3 items-start bloom">
        <div className="text-[10px] text-ink-soft w-16 flex-shrink-0 pt-0.5 tabular-nums font-bold uppercase tracking-[0.08em]">
          {ts}
        </div>
        <div className="flex-1">
          <div className="type-eyebrow text-teal-500 mb-1">Reasoning</div>
          <div className="text-[12.5px] text-navy leading-relaxed whitespace-pre-wrap">
            {entry.text}
          </div>
        </div>
      </div>
    );
  }
  if (entry.kind === 'tool') {
    return (
      <div className="flex gap-3 items-start bloom">
        <div className="text-[10px] text-ink-soft w-16 flex-shrink-0 pt-0.5 tabular-nums font-bold uppercase tracking-[0.08em]">
          {ts}
        </div>
        <div className="flex-1">
          <div className="type-eyebrow text-navy mb-1">
            Tool · {entry.name}
          </div>
          {entry.reason && (
            <div className="text-[12.5px] text-navy leading-relaxed italic">
              {entry.reason}
            </div>
          )}
          {entry.summary && (
            <div className="text-[11.5px] text-ink-soft leading-relaxed mt-1">
              {entry.summary}
            </div>
          )}
        </div>
      </div>
    );
  }
  if (entry.kind === 'user') {
    return (
      <div className="flex gap-3 items-start">
        <div className="text-[10px] text-ink-soft w-16 flex-shrink-0 pt-0.5 tabular-nums font-bold uppercase tracking-[0.08em]">
          {ts}
        </div>
        <div className="flex-1">
          <div className="type-eyebrow text-lime-700 mb-1">You</div>
          <div className="text-[12.5px] text-navy leading-relaxed">
            {entry.text}
          </div>
        </div>
      </div>
    );
  }
  if (entry.kind === 'error') {
    return (
      <div className="flex gap-3 items-start">
        <div className="text-[10px] text-ink-soft w-16 flex-shrink-0 pt-0.5 tabular-nums font-bold uppercase tracking-[0.08em]">
          {ts}
        </div>
        <div className="flex-1">
          <div className="type-eyebrow text-danger mb-1">Error</div>
          <div className="text-[12.5px] text-navy leading-relaxed whitespace-pre-wrap">
            {entry.text}
          </div>
        </div>
      </div>
    );
  }
  if (entry.kind === 'system') {
    return (
      <div className="flex gap-3 items-start">
        <div className="text-[10px] text-ink-soft w-16 flex-shrink-0 pt-0.5 tabular-nums font-bold uppercase tracking-[0.08em]">
          {ts}
        </div>
        <div className="flex-1">
          <div className="type-eyebrow text-ink-soft mb-1">System</div>
          <div className="text-[12px] text-ink-soft leading-relaxed italic">
            {entry.text}
          </div>
        </div>
      </div>
    );
  }
  return null;
}

// ======================================================================
// Captured + persona side panel
// ======================================================================

function MemorySidebar({ signals, persona, interactions }) {
  const hasSignals = Object.keys(signals || {}).length > 0;
  const savedPersona = loadPersona();
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-baseline justify-between">
          <Eyebrow>Session</Eyebrow>
          <div className="text-[11px] text-ink-soft font-bold tabular-nums">
            {interactions}/{SOFT_CAP} turns
          </div>
        </div>
        <div className="mt-3">
          <Progress
            value={Math.min(100, (interactions / SOFT_CAP) * 100)}
            tone={interactions >= SOFT_CAP ? 'lime' : 'teal'}
          />
        </div>
      </Card>

      <Card className="p-5">
        <Eyebrow className="mb-3">Captured this session</Eyebrow>
        {!hasSignals ? (
          <div className="text-[12px] text-ink-soft italic">
            Nothing yet. Start the simulation to see signals accrue.
          </div>
        ) : (
          <div className="space-y-3 text-[12.5px]">
            {signals.essentials && (
              <div>
                <div className="type-eyebrow text-ink-soft mb-1">Essentials</div>
                <div className="text-navy">
                  {signals.essentials.segment} ·{' '}
                  {signals.essentials.height_label} · shoe{' '}
                  {signals.essentials.shoe_size}
                </div>
              </div>
            )}
            {signals.swipes && (
              <div>
                <div className="type-eyebrow text-ink-soft mb-1">Swipes</div>
                <div className="text-navy">
                  {signals.swipes.filter((s) => s.swiped === 'yes').length}{' '}
                  yes · {signals.swipes.filter((s) => s.swiped === 'no').length}{' '}
                  no
                </div>
              </div>
            )}
            {signals.binaries && (
              <div>
                <div className="type-eyebrow text-ink-soft mb-1">
                  This-or-that
                </div>
                <div className="text-navy">
                  {signals.binaries.length} picked
                </div>
              </div>
            )}
            {signals.mood && (
              <div>
                <div className="type-eyebrow text-ink-soft mb-1">Mood</div>
                <div className="text-navy">
                  {signals.mood.mood_title}
                </div>
              </div>
            )}
            {signals.chat && (
              <div>
                <div className="type-eyebrow text-ink-soft mb-1">Chat</div>
                <div className="text-navy">
                  {signals.chat[signals.chat.length - 1].reply}
                </div>
              </div>
            )}
            {signals.fitTwin?.closet_anchor && (
              <div>
                <div className="type-eyebrow text-ink-soft mb-1">
                  Closet anchors
                </div>
                {signals.fitTwin.closet_anchor.top && (
                  <div className="text-navy">
                    Top · {signals.fitTwin.closet_anchor.top.brand}{' '}
                    {signals.fitTwin.closet_anchor.top.name} (
                    {signals.fitTwin.closet_anchor.top.size})
                  </div>
                )}
                {signals.fitTwin.closet_anchor.bottom && (
                  <div className="text-navy mt-0.5">
                    Bottom · {signals.fitTwin.closet_anchor.bottom.brand}{' '}
                    {signals.fitTwin.closet_anchor.bottom.name} (
                    {signals.fitTwin.closet_anchor.bottom.size})
                  </div>
                )}
              </div>
            )}
            {signals.fitTwin?.fit_twins && (
              <div>
                <div className="type-eyebrow text-ink-soft mb-1">Fit twin</div>
                <div className="text-navy">
                  {signals.fitTwin.fit_twins.summary}
                </div>
              </div>
            )}
            {signals.fitTwin?.sharpen && (
              <div>
                <div className="type-eyebrow text-ink-soft mb-1">Sharpen</div>
                <div className="text-navy">
                  {signals.fitTwin.sharpen.chose_label}
                </div>
              </div>
            )}
            {signals.fitTwin?.ar && (
              <div>
                <div className="type-eyebrow text-ink-soft mb-1">AR scan</div>
                <div className="text-navy">Captured · 98%</div>
              </div>
            )}
            {signals.fitTwin?.budget && (
              <div>
                <div className="type-eyebrow text-ink-soft mb-1">Allowance</div>
                <div className="text-navy">
                  {signals.fitTwin.budget.band_label} ·{' '}
                  {signals.fitTwin.budget.fix_size}-item Fix
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {persona ? (
        <Card className="p-5 bg-teal/10 border-teal">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="sparkle" size={16} className="text-teal-500" />
            <Eyebrow className="text-teal-500">Fresh persona</Eyebrow>
          </div>
          <div className="text-[15px] text-navy font-bold leading-tight mb-2">
            {ARCHETYPES.find((a) => a.id === persona.archetype_id)?.name ||
              persona.archetype_id}
          </div>
          <p className="text-[12px] text-navy leading-relaxed italic">
            {persona.persona_summary}
          </p>
          <div className="mt-3">
            <Badge tone="teal">{persona.confidence}% confidence</Badge>
          </div>
        </Card>
      ) : savedPersona ? (
        <Card className="p-5">
          <Eyebrow className="mb-2">Memory · previous session</Eyebrow>
          <div className="text-[13px] text-navy font-semibold">
            {ARCHETYPES.find((a) => a.id === savedPersona.archetype_id)
              ?.name || savedPersona.archetype_id}
          </div>
          <p className="text-[12px] text-ink-soft leading-relaxed italic mt-1">
            {savedPersona.persona_summary}
          </p>
          <div className="mt-3 flex gap-2 items-center">
            <span className="type-eyebrow text-ink-soft">
              loaded from localStorage
            </span>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

// ======================================================================
// Main view
// ======================================================================

export default function OnboardingSimulator() {
  const { inventory } = useFactory();
  const [device, setDevice] = useState('mobile');
  const [phase, setPhase] = useState('idle'); // idle | running | complete | error
  const [runKey, setRunKey] = useState(0);
  const [log, setLog] = useState([]);
  const [signals, setSignals] = useState({});
  const [persona, setPersona] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [pendingTool, setPendingTool] = useState(null); // { id, name, input }
  const [reasoningBuffer, setReasoningBuffer] = useState('');
  // Deck is null until the Essentials layer resolves the segment.
  const [deck, setDeck] = useState({ swipe: [], tot: [], segment: null });
  const [sessionLead, setSessionLead] = useState(null);

  const orchRef = useRef(null);
  const startedAtRef = useRef(null);
  const toolPathRef = useRef([]);

  function pushLog(entry) {
    setLog((l) => [...l, { ...entry, ts: Date.now() }]);
  }

  function handleEvent(event) {
    switch (event.type) {
      case 'thinking':
        setThinking(true);
        setReasoningBuffer('');
        break;
      case 'reasoning':
        // stream text deltas into a buffer; on next tool_use we flush it
        setReasoningBuffer((prev) => prev + (event.text || ''));
        break;
      case 'tool_use': {
        setThinking(false);
        if (reasoningBuffer.trim()) {
          pushLog({ kind: 'reasoning', text: reasoningBuffer.trim() });
          setReasoningBuffer('');
        }
        const t = event.tool;
        toolPathRef.current.push(t.name);
        pushLog({
          kind: 'tool',
          name: t.name,
          reason: t.input?.reason,
          summary: summarizeToolCall(t),
        });
        if (t.name === 'conclude_with_persona') {
          // complete event handles the rest
        } else {
          setPendingTool({ id: t.id, name: t.name, input: t.input });
        }
        break;
      }
      case 'complete': {
        setThinking(false);
        if (reasoningBuffer.trim()) {
          pushLog({ kind: 'reasoning', text: reasoningBuffer.trim() });
          setReasoningBuffer('');
        }
        const p = event.final;
        setPersona(p);
        setPhase('complete');
        pushLog({
          kind: 'system',
          text: `Onboarding complete. Archetype: ${p.archetype_id}, confidence ${p.confidence}%.`,
        });
        savePersona({
          archetype_id: p.archetype_id,
          persona_summary: p.persona_summary,
          confidence: p.confidence,
          persona_json: {
            recommended_sku_ids: p.recommended_sku_ids || [],
            signals,
          },
        });
        saveSession({
          startedAt: startedAtRef.current,
          endedAt: new Date().toISOString(),
          device,
          model: MODEL,
          interactions: toolPathRef.current.length,
          variantPath: toolPathRef.current,
          fitTwinDepth: countFitTwinDepth(signals),
          archetypeId: p.archetype_id,
          personaSummary: p.persona_summary,
          confidence: p.confidence,
          log: log.concat([
            { kind: 'system', text: 'Onboarding complete.', ts: Date.now() },
          ]),
        });
        break;
      }
      case 'error':
        setThinking(false);
        setPhase('error');
        pushLog({ kind: 'error', text: event.error });
        break;
      case 'final':
        setThinking(false);
        pushLog({
          kind: 'system',
          text: `Stopped without persona (${event.final?.stopReason || 'unknown'}). Hit Restart to try again.`,
        });
        setPhase('error');
        break;
    }
  }

  async function start() {
    setPhase('running');
    setLog([]);
    setSignals({});
    setPersona(null);
    setPendingTool(null);
    setDeck({ swipe: [], tot: [], segment: null });
    toolPathRef.current = [];
    startedAtRef.current = new Date().toISOString();
    const lead = pickSessionLead();
    setSessionLead(lead);
    pushLog({
      kind: 'system',
      text: `Device: ${device} · model: ${MODEL} · soft cap: ${SOFT_CAP}`,
    });
    pushLog({
      kind: 'system',
      text: `Session lead variant: ${lead.tool}`,
    });
    const orch = new AgentOrchestrator({
      device,
      softCap: SOFT_CAP,
      model: MODEL,
      sessionLead: lead,
      onEvent: handleEvent,
    });
    orchRef.current = orch;
    await orch.start();
  }

  async function submitResult(result) {
    if (!pendingTool) return;
    const userSummary = humanizeResult(pendingTool.name, result);
    pushLog({ kind: 'user', text: userSummary });
    setSignals((s) => mergeSignalsClient(s, pendingTool.name, result));

    // When Essentials resolves, build the inventory-backed decks so
    // subsequent Swipe / This-or-That screens render gender-appropriate
    // items with real Unsplash imagery.
    if (
      pendingTool.name === 'show_fit_twin_layer' &&
      result?.layer === 'essentials' &&
      result?.segment
    ) {
      const segment = result.segment;
      setDeck({
        segment,
        swipe: buildSwipeDeck(inventory, segment, 12),
        tot: buildTotDeck(inventory, segment, 8),
      });
      pushLog({
        kind: 'system',
        text: `Deck built for ${segment} · swipe=${
          buildSwipeDeck(inventory, segment, 12).length
        } · tot=${buildTotDeck(inventory, segment, 8).length}`,
      });
    }

    const toolId = pendingTool.id;
    const toolName = pendingTool.name;
    setPendingTool(null);
    await orchRef.current.submitToolResult({
      toolUseId: toolId,
      toolName,
      result,
    });
  }

  function restart() {
    orchRef.current?.abort();
    setPhase('idle');
    setLog([]);
    setSignals({});
    setPersona(null);
    setPendingTool(null);
    setThinking(false);
    setDeck({ swipe: [], tot: [], segment: null });
    setSessionLead(null);
    toolPathRef.current = [];
    setRunKey((k) => k + 1);
  }

  function wipeMemory() {
    forgetPersona();
    setPersona(null);
  }

  // Render the screen currently pending inside the device frame
  function renderDeviceContent() {
    if (phase === 'idle') {
      return <WelcomeScreen thinking={false} />;
    }
    if (phase === 'complete' && persona) {
      return (
        <CompletionScreen
          persona={persona}
          onRestart={restart}
          fitAccuracy={computeFitAccuracy(signals)}
        />
      );
    }
    if (phase === 'error') {
      return (
        <div className="absolute inset-0 bg-surface flex flex-col items-center justify-center text-center p-6">
          <Eyebrow className="text-danger mb-2">Agent stopped</Eyebrow>
          <p className="type-body-md text-ink-soft max-w-[260px]">
            Check the log for details. Hit Restart to try again.
          </p>
        </div>
      );
    }
    if (thinking && !pendingTool) {
      return <WelcomeScreen thinking />;
    }
    if (!pendingTool) return <WelcomeScreen thinking />;
    const input = pendingTool.input || {};
    switch (pendingTool.name) {
      case 'show_swipe_card': {
        const idx = input.card_index ?? 0;
        const card = deck.swipe[idx] || deck.swipe[0];
        if (!card) return <WelcomeScreen thinking />;
        return <SwipeScreen card={card} onSubmit={submitResult} />;
      }
      case 'show_this_or_that': {
        const idx = input.pair_index ?? 0;
        const pair = deck.tot[idx] || deck.tot[0];
        if (!pair) return <WelcomeScreen thinking />;
        return <ThisOrThatScreen pair={pair} onSubmit={submitResult} />;
      }
      case 'show_mood_board':
        return <TasteTransferScreen onSubmit={submitResult} />;
      case 'show_chat_message':
        return (
          <ChatMessageScreen
            message={input.message}
            options={input.options || []}
            onSubmit={submitResult}
          />
        );
      case 'show_classic_question': {
        const q =
          CLASSIC_QS[input.question_index ?? 0] || CLASSIC_QS[0];
        return <ClassicScreen question={q} onSubmit={submitResult} />;
      }
      case 'show_fit_twin_layer': {
        switch (input.layer) {
          case 'essentials':
            return <EssentialsScreen onSubmit={submitResult} />;
          case 'closet_anchor':
            return <ClosetAnchorScreen onSubmit={submitResult} />;
          case 'fit_twins':
            return (
              <FitTwinsScreen
                onSubmit={submitResult}
                essentials={signals.essentials}
                closetAnchor={signals.fitTwin?.closet_anchor}
              />
            );
          case 'sharpen':
            return <SharpenScreen onSubmit={submitResult} />;
          case 'ar':
            // Legacy: if Claude still calls this directly, route to the
            // unified Final Precision screen so the camera button is the
            // same one we show for the tailor-offer flow.
            return (
              <FinalPrecisionScreen
                heightInches={signals.essentials?.height_inches}
                onSubmit={submitResult}
              />
            );
          case 'budget':
            return <BudgetScreen onSubmit={submitResult} />;
          default:
            return <WelcomeScreen thinking />;
        }
      }
      case 'show_tailor_precision_offer':
        return (
          <FinalPrecisionScreen
            heightInches={signals.essentials?.height_inches}
            onSubmit={submitResult}
          />
        );
      default:
        return <WelcomeScreen thinking />;
    }
  }

  const interactions = toolPathRef.current.filter(
    (n) => n !== 'conclude_with_persona',
  ).length;

  return (
    <div className="px-6 md:px-10 py-12 max-w-[1400px] mx-auto">
      <SectionHead
        eyebrow="Simulator / agentic onboarding"
        title="Watch the agent onboard a real visitor."
        sub="Claude Sonnet 4.5 picks the next screen. Variants intermix with Fit Twin layers. When it's done, it writes a persona and saves it as memory."
        right={
          <div className="flex items-center gap-3">
            <Segmented
              options={[
                { label: 'Mobile', value: 'mobile' },
                { label: 'Desktop', value: 'desktop' },
              ]}
              value={device}
              onChange={(v) => {
                if (phase === 'idle') setDevice(v);
              }}
            />
            {phase === 'idle' ? (
              <Button variant="primary" onClick={start}>
                <Icon name="play" /> Start simulation
              </Button>
            ) : (
              <Button variant="secondary" onClick={restart}>
                <Icon name="back" /> Restart
              </Button>
            )}
          </div>
        }
      />

      <div className="grid md:grid-cols-[1fr_380px_320px] gap-5">
        {/* Device frame */}
        <div className="flex items-start justify-center pt-2">
          <DeviceFrame device={device} runKey={runKey}>
            {renderDeviceContent()}
          </DeviceFrame>
        </div>

        {/* Agent log */}
        <AgentLog entries={log} thinking={thinking} />

        {/* Signals + persona */}
        <MemorySidebar
          signals={signals}
          persona={persona}
          interactions={interactions}
        />
      </div>

      <div className="mt-12 pt-8 border-t border-outline-variant flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="text-[11px] text-ink-soft font-bold uppercase tracking-[0.12em]">
          Dayone / Simulator / live · {interactions} interaction
          {interactions === 1 ? '' : 's'} this session
        </div>
        <button
          onClick={wipeMemory}
          className="text-[11px] text-ink-soft font-bold uppercase tracking-[0.08em] hover:text-danger"
        >
          Forget persona memory
        </button>
      </div>
    </div>
  );
}

// ======================================================================
// Helpers
// ======================================================================

function humanizeResult(toolName, result) {
  if (!result) return 'Interacted.';
  if (toolName === 'show_swipe_card') {
    return `Swiped ${result.swiped} on "${result.card_label}"`;
  }
  if (toolName === 'show_this_or_that') {
    return `Chose ${result.chose?.toUpperCase()} — ${result.chose_label}`;
  }
  if (toolName === 'show_mood_board') {
    if (result.mode === 'instagram_handle') return `Instagram handle: @${result.handle}`;
    if (result.mode === 'celeb') return `Taste icon: ${result.name}`;
    return `Picked mood: ${result.mood_title}`;
  }
  if (toolName === 'show_chat_message') {
    return `Replied: "${result.reply}"`;
  }
  if (toolName === 'show_classic_question') {
    return `Answered: "${result.answer}"`;
  }
  if (toolName === 'show_fit_twin_layer') {
    if (result.layer === 'essentials')
      return `Essentials: ${result.segment} · ${result.height_label} · shoe ${result.shoe_size}`;
    if (result.layer === 'closet_anchor') {
      const t = result.top;
      const b = result.bottom;
      return `Anchors: ${t?.brand} ${t?.name} (${t?.size}) + ${b?.brand} ${b?.name} (${b?.size})`;
    }
    if (result.layer === 'fit_twins') return `Fit twin: ${result.summary}`;
    if (result.layer === 'sharpen')
      return `Sharpen: ${result.chose_label}`;
    if (result.layer === 'ar') {
      if (result.skipped) return 'Skipped AR layer';
      if (result.measurements) {
        const m = result.measurements;
        return `Pose captured · shoulders ${m.shoulder_width_in}" · torso ${m.torso_length_in}" · inseam ${m.inseam_in}"`;
      }
      return 'Captured AR frame';
    }
    if (result.layer === 'budget')
      return `Allowance: ${result.band_label}, ${result.fix_size}-item Fix`;
  }
  if (toolName === 'show_tailor_precision_offer') {
    if (!result.accepted) return 'Skipped tailor precision — finishing with 95%';
    if (result.measurements) {
      const m = result.measurements;
      return `Captured · shoulders ${m.shoulder_width_in}" · torso ${m.torso_length_in}" · inseam ${m.inseam_in}"`;
    }
    return 'Accepted and captured tailor frame';
  }
  return JSON.stringify(result).slice(0, 80);
}

function summarizeToolCall(tool) {
  const i = tool.input || {};
  if (tool.name === 'show_swipe_card')
    return `card_index=${i.card_index}`;
  if (tool.name === 'show_this_or_that')
    return `pair_index=${i.pair_index}`;
  if (tool.name === 'show_mood_board') return 'open mood board';
  if (tool.name === 'show_chat_message')
    return `"${(i.message || '').slice(0, 60)}${
      (i.message || '').length > 60 ? '…' : ''
    }"`;
  if (tool.name === 'show_classic_question')
    return `question_index=${i.question_index}`;
  if (tool.name === 'show_fit_twin_layer')
    return `layer=${i.layer}`;
  if (tool.name === 'show_tailor_precision_offer')
    return 'offer tailor-precision (MediaPipe)';
  if (tool.name === 'conclude_with_persona')
    return `archetype=${i.archetype_id} confidence=${i.confidence}`;
  return '';
}

function mergeSignalsClient(signals, toolName, result) {
  const next = { ...signals };
  if (toolName === 'show_swipe_card') {
    next.swipes = [...(next.swipes || []), result];
  } else if (toolName === 'show_this_or_that') {
    next.binaries = [...(next.binaries || []), result];
  } else if (toolName === 'show_mood_board') {
    next.mood = result;
  } else if (toolName === 'show_chat_message') {
    next.chat = [...(next.chat || []), result];
  } else if (toolName === 'show_classic_question') {
    next.classic = [...(next.classic || []), result];
  } else if (toolName === 'show_fit_twin_layer') {
    if (result.layer === 'essentials') {
      // Lift essentials onto its own top-level slot for easy UI access.
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

function countFitTwinDepth(signals) {
  const ft = signals?.fitTwin || {};
  const order = ['closet_anchor', 'fit_twins', 'sharpen', 'ar', 'budget'];
  let n = 0;
  order.forEach((k) => {
    if (ft[k]) n += 1;
  });
  return n;
}

/** Derive the tailored-fit accuracy % from which Fit Twin layers completed.
 *  Mirrors ACCURACY_LADDER in fit-twin-data.js. */
function computeFitAccuracy(signals) {
  if (!signals) return 0;
  const ft = signals.fitTwin || {};
  const tailor = signals.tailorOffer;
  if (tailor?.accepted && tailor?.measurements) return 98;
  if (ft.sharpen) return 95;
  if (ft.fit_twins) return 90;
  if (ft.closet_anchor) return 85;
  if (signals.essentials) return 40;
  return 0;
}
