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
  SWIPE_CARDS,
  TOT_PAIRS,
} from '../data.js';
import {
  CLOSET_CATALOG,
  FIT_TWINS,
  SHARPEN_PAIRS,
} from '../fit-twin-data.js';
import { AgentOrchestrator, TOOL_FAMILY } from '../agent/orchestrator.js';
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

const SOFT_CAP = 8;
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
        Six questions, give or take. We'll skip the boring parts.
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
      card_label: card.label,
      tags: card.tags,
    });
  }

  const rot = drag * 0.06;
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
            card.ph,
            'ph-tex',
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
          <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
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
            <div className="text-[20px] font-semibold leading-tight tracking-tight">
              {card.label}
            </div>
            <div className="mt-2 type-eyebrow text-white/80">
              {card.tags.join(' · ')}
            </div>
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
          chose_label: pair[side].label,
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
        {['a', 'b'].map((side) => (
          <button
            key={side}
            onClick={() => pick(side)}
            className={cx(
              'relative rounded-md overflow-hidden ph-tex border transition-all text-left',
              pair[side].ph,
              flash === side
                ? 'ring-4 ring-teal scale-[0.985] border-teal'
                : 'border-outline-variant hover:scale-[1.01]',
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-navy/55 to-transparent" />
            <div className="absolute top-3 left-3 type-eyebrow text-white/80">
              {side.toUpperCase()}
            </div>
            <div className="absolute bottom-3 left-3 right-3 text-[20px] font-semibold text-white leading-tight">
              {pair[side].label}
            </div>
          </button>
        ))}
      </div>
      <div className="text-center pb-4 type-eyebrow text-ink-soft">
        no wrong answer
      </div>
    </div>
  );
}

// --- mood board (Taste Transfer) -----------------------------------------

function MoodBoardScreen({ onSubmit }) {
  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <Eyebrow>Taste Transfer</Eyebrow>
        <div className="text-[18px] font-semibold text-navy leading-tight tracking-tight mt-1">
          Which of these moods is closest to yours?
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        <div className="grid grid-cols-3 gap-2">
          {MOOD_BOARDS.map((m) => (
            <button
              key={m.id}
              onClick={() =>
                onSubmit({
                  mood_id: m.id,
                  mood_title: m.title,
                  mood_sub: m.sub,
                })
              }
              className={cx(
                'relative aspect-[3/4] rounded overflow-hidden border border-outline-variant transition-all ph-tex hover:scale-[1.02] hover:border-navy',
                m.ph,
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
              <div className="absolute bottom-1.5 left-1.5 right-1.5 text-left">
                <div className="text-[12px] text-white font-semibold leading-tight">
                  {m.title}
                </div>
                <div className="text-[8px] uppercase tracking-[0.14em] font-bold text-white/80 mt-0.5">
                  {m.sub}
                </div>
              </div>
            </button>
          ))}
        </div>
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

// --- Fit Twin: closet anchor --------------------------------------------

function ClosetAnchorScreen({ onSubmit }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState(null);
  const [size, setSize] = useState('');
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
  function commit() {
    if (!selected || !size) return;
    onSubmit({
      layer: 'closet_anchor',
      brand: selected.brand,
      name: selected.name,
      size,
      size_profile: selected.sizeProfile,
    });
  }
  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <Eyebrow>Fit Twin · layer 01</Eyebrow>
          <Badge tone="teal">+80%</Badge>
        </div>
        <div className="text-[18px] font-semibold text-navy leading-tight tracking-tight">
          Name one thing you own that fits you really well.
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-3">
        <div className="relative">
          <div className="flex items-center gap-2 bg-surface-lowest border border-outline-variant rounded px-3 py-2.5 focus-within:border-teal">
            <Icon name="search" size={16} className="text-ink-soft" />
            <input
              value={
                selected
                  ? `${selected.brand} ${selected.name}`
                  : query
              }
              onChange={(e) => {
                setSelected(null);
                setQuery(e.target.value);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              placeholder="e.g. Levi's 501 or Madewell Cali"
              className="flex-1 bg-transparent text-[13.5px] placeholder:text-outline"
              style={{ boxShadow: 'none' }}
            />
          </div>
          {focused && suggestions.length > 0 && !selected && (
            <div className="absolute left-0 right-0 mt-2 bg-surface-lowest border border-outline-variant rounded shadow-lift overflow-hidden z-10">
              {suggestions.map((g) => (
                <button
                  key={g.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSelected(g);
                    setQuery('');
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-surface-base transition-colors flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-navy font-semibold leading-tight">
                      {g.brand}
                    </div>
                    <div className="text-[12px] text-ink-soft truncate">
                      {g.name}
                    </div>
                  </div>
                  <div className="type-eyebrow text-ink-soft">
                    {g.category}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {selected && (
          <div className="mt-4 p-3 rounded border border-teal bg-teal/10 bloom">
            <Eyebrow className="mb-2">Size you wear</Eyebrow>
            <div className="flex flex-wrap gap-1.5">
              {selected.sizes.map((s) => (
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
          </div>
        )}
      </div>
      <div className="px-5 pb-5 pt-3 border-t border-outline-variant">
        <Button
          variant="primary"
          className="w-full justify-center"
          onClick={commit}
          disabled={!selected || !size}
        >
          <Icon name="check" /> Lock in my anchor
        </Button>
      </div>
    </div>
  );
}

// --- Fit Twin: fit twins -------------------------------------------------

function FitTwinsScreen({ onSubmit }) {
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
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="grid grid-cols-2 gap-2.5">
          {FIT_TWINS.map((t) => (
            <button
              key={t.id}
              onClick={() =>
                onSubmit({
                  layer: 'fit_twins',
                  twin_id: t.id,
                  summary: t.summary,
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

// --- Fit Twin: AR (webcam) ----------------------------------------------

function ARScreen({ onSubmit, onSkip }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [phase, setPhase] = useState('prompt'); // prompt | preview | capturing | analyzing | error
  const [err, setErr] = useState(null);

  useEffect(() => {
    return () => stopStream(stream);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  async function begin() {
    try {
      const s = await requestCameraStream();
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
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
      // Submit the captured frame back to the agent for Vision analysis.
      // The orchestrator uses this on the NEXT turn via a tool_result
      // that includes the image; here we hand it off.
      stopStream(stream);
      setStream(null);
      onSubmit({
        layer: 'ar',
        captured: true,
        image_base64: frame.base64,
        image_media_type: frame.mediaType,
      });
    } catch (e) {
      setErr(e.message || 'Capture failed');
      setPhase('error');
    }
  }

  if (phase === 'analyzing' || phase === 'capturing') {
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
          tailor precision · 98%
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="absolute inset-0 bg-surface flex flex-col p-5">
        <Eyebrow>Fit Twin · layer 04</Eyebrow>
        <div className="text-[18px] font-semibold text-navy leading-tight mt-1">
          Couldn't open the camera.
        </div>
        <p className="text-[12.5px] text-ink-soft mt-2 leading-relaxed">
          {err} — you can skip this layer and we'll still be at 95%.
        </p>
        <div className="mt-auto space-y-2">
          <Button
            variant="primary"
            className="w-full justify-center"
            onClick={begin}
          >
            <Icon name="sparkle" /> Try again
          </Button>
          <button
            onClick={onSkip}
            className="w-full text-center text-[12px] text-ink-soft py-1.5 hover:text-navy font-bold uppercase tracking-[0.08em]"
          >
            Skip this layer
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'preview') {
    return (
      <div className="absolute inset-0 bg-navy flex flex-col">
        <div className="px-5 pt-5 pb-2 text-white">
          <Eyebrow className="text-white/80">Fit Twin · layer 04</Eyebrow>
          <div className="text-[18px] font-semibold leading-tight mt-1">
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
            onClick={onSkip}
            className="w-full text-center text-[12px] text-white/70 py-1.5 hover:text-white font-bold uppercase tracking-[0.08em]"
          >
            Skip — my Fit Twin has me at 95%
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
          <Eyebrow>Fit Twin · layer 04</Eyebrow>
          <Badge tone="lime">Premium · +98%</Badge>
        </div>
        <div className="text-[20px] font-semibold text-navy leading-tight tracking-tight">
          Tailor-level precision.
        </div>
      </div>
      <div className="flex-1 px-5 pb-5 flex flex-col">
        <div className="relative flex-1 rounded-md border border-outline-variant overflow-hidden bg-navy text-white flex flex-col items-center justify-center p-6 ph-tex ph-10">
          <div className="absolute inset-0 bg-gradient-to-b from-navy/40 to-navy/70 pointer-events-none" />
          <div className="relative text-center max-w-[240px]">
            <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-4 border border-white/30">
              <Icon name="sparkle" size={24} className="text-white" />
            </div>
            <div className="text-[20px] font-semibold leading-tight">
              Most clients don't need this.
            </div>
            <p className="text-[12.5px] text-white/85 mt-3 leading-relaxed">
              But if your fit is tricky, one photo gets us to 98%. Your
              camera stays in this tab — only the single frame goes to
              the agent.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Button
            variant="primary"
            className="w-full justify-center"
            onClick={begin}
          >
            <Icon name="sparkle" /> Open camera
          </Button>
          <button
            onClick={onSkip}
            className="w-full text-center text-[12px] text-ink-soft py-1.5 hover:text-navy font-bold uppercase tracking-[0.08em]"
          >
            I'm good — Fit Twin has me at 95%
          </button>
        </div>
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

function CompletionScreen({ persona, onRestart }) {
  const archetype =
    ARCHETYPES.find((a) => a.id === persona?.archetype_id) || ARCHETYPES[0];
  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className={cx('relative h-[40%] ph-tex', archetype.palette)}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface" />
        <div className="absolute top-4 left-4 type-eyebrow text-white/90 bloom">
          Welcome to the family
        </div>
      </div>
      <div className="px-6 pt-2 pb-6 flex-1 flex flex-col bloom">
        <Eyebrow className="text-lime-700">Your StyleFile is live</Eyebrow>
        <h2 className="type-headline-lg text-navy leading-[0.95] mt-2">
          {archetype.name}
        </h2>
        <p className="italic text-[15px] leading-snug text-ink-soft mt-3">
          {persona?.persona_summary || archetype.tagline}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Badge tone="teal">
            {persona?.confidence || 85}% confidence
          </Badge>
          <Badge tone="outline">
            Saved to your StyleFile
          </Badge>
        </div>
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
                  Closet anchor
                </div>
                <div className="text-navy">
                  {signals.fitTwin.closet_anchor.brand} ·{' '}
                  {signals.fitTwin.closet_anchor.name} · size{' '}
                  {signals.fitTwin.closet_anchor.size}
                </div>
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
    toolPathRef.current = [];
    startedAtRef.current = new Date().toISOString();
    pushLog({
      kind: 'system',
      text: `Device: ${device} · model: ${MODEL} · soft cap: ${SOFT_CAP}`,
    });
    const orch = new AgentOrchestrator({
      device,
      softCap: SOFT_CAP,
      model: MODEL,
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
    const toolId = pendingTool.id;
    const toolName = pendingTool.name;
    setPendingTool(null);
    await orchRef.current.submitToolResult({
      toolUseId: toolId,
      toolName,
      result,
    });
  }

  function skipAR() {
    // Treat skip as a tool_result that says layer=ar, skipped=true.
    // That gives the agent the signal that the user opted out.
    submitResult({ layer: 'ar', skipped: true });
  }

  function restart() {
    orchRef.current?.abort();
    setPhase('idle');
    setLog([]);
    setSignals({});
    setPersona(null);
    setPendingTool(null);
    setThinking(false);
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
      return <CompletionScreen persona={persona} onRestart={restart} />;
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
        const card = SWIPE_CARDS[input.card_index ?? 0] || SWIPE_CARDS[0];
        return <SwipeScreen card={card} onSubmit={submitResult} />;
      }
      case 'show_this_or_that': {
        const pair = TOT_PAIRS[input.pair_index ?? 0] || TOT_PAIRS[0];
        return <ThisOrThatScreen pair={pair} onSubmit={submitResult} />;
      }
      case 'show_mood_board':
        return <MoodBoardScreen onSubmit={submitResult} />;
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
          case 'closet_anchor':
            return <ClosetAnchorScreen onSubmit={submitResult} />;
          case 'fit_twins':
            return <FitTwinsScreen onSubmit={submitResult} />;
          case 'sharpen':
            return <SharpenScreen onSubmit={submitResult} />;
          case 'ar':
            return <ARScreen onSubmit={submitResult} onSkip={skipAR} />;
          case 'budget':
            return <BudgetScreen onSubmit={submitResult} />;
          default:
            return <WelcomeScreen thinking />;
        }
      }
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
    return `Picked mood: ${result.mood_title}`;
  }
  if (toolName === 'show_chat_message') {
    return `Replied: "${result.reply}"`;
  }
  if (toolName === 'show_classic_question') {
    return `Answered: "${result.answer}"`;
  }
  if (toolName === 'show_fit_twin_layer') {
    if (result.layer === 'closet_anchor')
      return `Anchor: ${result.brand} ${result.name} (size ${result.size})`;
    if (result.layer === 'fit_twins') return `Fit twin: ${result.summary}`;
    if (result.layer === 'sharpen')
      return `Sharpen: ${result.chose_label}`;
    if (result.layer === 'ar')
      return result.skipped ? 'Skipped AR layer' : 'Captured AR frame';
    if (result.layer === 'budget')
      return `Allowance: ${result.band_label}, ${result.fix_size}-item Fix`;
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
    next.fitTwin = {
      ...(next.fitTwin || {}),
      [result.layer || 'unknown']: result,
    };
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
