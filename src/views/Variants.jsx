// Gallery of all six variants, each playable as a real mini-flow
// (Swipe, Chat, This-or-That, Inspiration, Classic quiz, Outfit Builder).

import React from 'react';
import {
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
import {
  ARCHETYPES,
  CLASSIC_QS,
  MOOD_BOARDS,
  SWIPE_CARDS,
  TOT_PAIRS,
  archetypeFor,
} from '../data.js';
import { useFactory } from '../state.jsx';

// Builder maps inventory subcategories onto the canvas slots so the
// flow pulls from the real catalog. Outerwear stands in for "Layer".
const BUILDER_CAT_MAP = {
  Top: 'Tops',
  Bottom: 'Bottoms',
  Shoes: 'Shoes',
  Layer: 'Outerwear',
};

// -----------------------------------------------------------------------
// Shared: archetype reveal at the end of each flow
// -----------------------------------------------------------------------
function ArchetypeReveal({ archetypeId, onRestart, variantName }) {
  const a = ARCHETYPES.find((x) => x.id === archetypeId) || ARCHETYPES[0];
  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className={cx('relative h-[44%] ph-tex', a.palette)}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface" />
        <div className="absolute top-4 left-4 type-eyebrow text-white bloom">
          Your StyleFile
        </div>
      </div>
      <div className="px-6 pt-2 pb-6 flex-1 flex flex-col bloom">
        <div className="type-eyebrow text-lime-700">Archetype 03 of 08</div>
        <h2 className="type-headline-lg text-navy mt-2 leading-[0.95]">{a.name}</h2>
        <p className="italic text-[1.0625rem] leading-snug text-ink-soft mt-3">
          {a.tagline}
        </p>
        <div className="mt-5 space-y-2.5">
          {a.pairs.map((p, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="w-1 h-1 rounded-full bg-teal-500" />
              <span className="text-[13px] text-navy">{p}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto space-y-2 pt-4">
          <Button variant="primary" className="w-full justify-center">
            <Icon name="sparkle" /> Schedule your first Fix
          </Button>
          <button
            onClick={onRestart}
            className="w-full text-center text-[12px] text-ink-soft py-2 hover:text-navy transition-colors"
          >
            Try a different {variantName} run
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// 1. SWIPE
// -----------------------------------------------------------------------
function CardFace({ card, style, drag = 0, ...p }) {
  return (
    <div
      {...p}
      className={cx(
        'absolute left-5 right-5 top-4 bottom-4 rounded-xl overflow-hidden border border-outline-variant cursor-grab active:cursor-grabbing',
        card.ph,
        'ph-tex',
      )}
      style={style}
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
        <div className="text-[22px] font-semibold leading-tight tracking-tight">
          {card.label}
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-[0.14em] font-bold opacity-80">
          {card.tags.join(' • ')}
        </div>
      </div>
    </div>
  );
}

function SwipeVariant() {
  const [i, setI] = useState(0);
  const [liked, setLiked] = useState([]);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
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
    if (Math.abs(drag) > 90) decide(drag > 0);
    else setDrag(0);
  }
  function decide(like) {
    const card = SWIPE_CARDS[i];
    const newLiked = like ? [...liked, card] : liked;
    setLiked(newLiked);
    setDrag(0);
    if (i + 1 >= 10) setDone(true);
    else setI(i + 1);
  }

  if (done)
    return (
      <ArchetypeReveal
        archetypeId={archetypeFor('swipe', { liked })}
        onRestart={() => {
          setI(0);
          setLiked([]);
          setDone(false);
        }}
        variantName="Swipe"
      />
    );

  const card = SWIPE_CARDS[i];
  const next = SWIPE_CARDS[i + 1];
  const next2 = SWIPE_CARDS[i + 2];
  const rot = drag * 0.06;

  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <Eyebrow>Style Shuffle</Eyebrow>
          <div className="type-body-lg text-navy leading-tight font-semibold mt-1">
            Left is "not me." Right is yes.
          </div>
        </div>
        <div className="text-[11px] font-bold text-ink-soft tabular-nums">
          {i + 1}/10
        </div>
      </div>
      <div className="px-5">
        <Progress value={(i / 10) * 100} tone="teal" />
      </div>

      <div
        className="flex-1 relative px-5 pt-4 card-stack select-none"
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
      >
        {next2 && (
          <CardFace
            card={next2}
            style={{ transform: 'translateY(16px) scale(0.94)', opacity: 0.4 }}
          />
        )}
        {next && (
          <CardFace
            card={next}
            style={{ transform: 'translateY(8px) scale(0.97)', opacity: 0.7 }}
          />
        )}
        <CardFace
          card={card}
          style={{
            transform: `translateX(${drag}px) rotate(${rot}deg)`,
            transition: dragging ? 'none' : 'transform 300ms cubic-bezier(.2,.8,.2,1)',
          }}
          onMouseDown={onDown}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
          drag={drag}
        />
      </div>

      <div className="px-5 pt-3 pb-6 flex items-center justify-center gap-6">
        <button
          onClick={() => decide(false)}
          className="w-14 h-14 rounded bg-surface-lowest border border-navy flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-colors"
        >
          <Icon name="x" size={20} />
        </button>
        <div className="type-eyebrow text-ink-soft">swipe or tap</div>
        <button
          onClick={() => decide(true)}
          className="w-14 h-14 rounded bg-teal text-navy border border-teal hover:bg-teal-300 transition-colors flex items-center justify-center"
        >
          <Icon name="heart" size={20} />
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// 2. CHAT
// -----------------------------------------------------------------------
function ChatVariant() {
  const [msgs, setMsgs] = useState([
    {
      from: 'bot',
      t: 'Hey — I’m Ava, one of our stylists. No quiz today. Just tell me what’s going on with your wardrobe right now.',
    },
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [typing, setTyping] = useState(false);
  const ref = useRef(null);

  const script = [
    {
      q: 'That makes sense. What feels missing most — tops, bottoms, something to layer, or something dressier?',
      opts: ['A great jacket', 'Pants that actually fit', 'One perfect knit', 'Something that feels like me'],
    },
    {
      q: 'Got it. And when you picture yourself feeling really you in an outfit, is it closer to soft and at ease, or sharp and pulled-together?',
      opts: ['Soft and at ease', 'Sharp and pulled-together', 'A little of both, honestly'],
    },
    {
      q: 'Last thing — what’s a color you keep reaching for?',
      opts: ['Cream / oat', 'Soft navy', 'Camel', 'Charcoal'],
    },
    {
      q: 'Okay. I have a pretty strong read already. Want to see what I’m thinking?',
      opts: ['Yes, show me'],
    },
  ];

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [msgs, typing]);

  function send(text) {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: 'you', t: text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      if (step >= script.length) {
        setTyping(false);
        setDone(true);
        return;
      }
      setMsgs((m) => [...m, { from: 'bot', t: script[step].q, opts: script[step].opts }]);
      setStep((s) => s + 1);
      setTyping(false);
    }, 900);
  }

  if (done)
    return (
      <ArchetypeReveal
        archetypeId={archetypeFor('chat')}
        onRestart={() => {
          setMsgs([
            {
              from: 'bot',
              t: 'Hey — I’m Ava, one of our stylists. Tell me what’s going on with your wardrobe right now.',
            },
          ]);
          setStep(0);
          setDone(false);
        }}
        variantName="Chat"
      />
    );

  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3 flex items-center gap-3 border-b border-outline-variant">
        <div className="w-9 h-9 rounded-full ph-8 ph-tex" />
        <div>
          <div className="text-[14px] text-navy font-semibold leading-tight">Ava</div>
          <div className="text-[10px] text-teal-500 uppercase tracking-[0.12em] font-bold flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 pulse-dot" />{' '}
            stylist, online
          </div>
        </div>
      </div>
      <div ref={ref} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={cx(
              'flex flex-col',
              m.from === 'you' ? 'items-end' : 'items-start',
            )}
          >
            <div
              className={cx(
                'max-w-[85%] px-3.5 py-2.5 rounded text-[13.5px] leading-snug',
                m.from === 'you'
                  ? 'bg-navy text-white'
                  : 'bg-surface-lowest text-navy border border-outline-variant',
              )}
            >
              {m.t}
            </div>
            {m.opts && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                {m.opts.map((o) => (
                  <button
                    key={o}
                    onClick={() => send(o)}
                    className="px-3 py-1.5 rounded border border-teal bg-teal/20 text-navy text-[12px] font-bold hover:bg-teal transition-colors"
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div className="flex items-center gap-1.5 px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-outline pulse-dot" />
            <span
              className="w-1.5 h-1.5 rounded-full bg-outline pulse-dot"
              style={{ animationDelay: '200ms' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-outline pulse-dot"
              style={{ animationDelay: '400ms' }}
            />
            <span className="text-[10px] text-ink-soft ml-1 uppercase tracking-[0.12em] font-bold">
              Ava’s taking notes
            </span>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-outline-variant">
        <div className="flex items-center gap-2 bg-surface-lowest border border-outline-variant rounded px-4 py-2.5 focus-within:border-teal focus-within:ring-2 focus-within:ring-teal">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder="Tell Ava what’s on your mind…"
            className="flex-1 bg-transparent text-[13.5px] placeholder:text-outline focus:shadow-none"
            style={{ boxShadow: 'none' }}
          />
          <button
            onClick={() => send(input)}
            className="text-teal-500 hover:text-navy transition-colors"
          >
            <Icon name="send" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// 3. THIS OR THAT
// -----------------------------------------------------------------------
function ToTCard({ ph, label, active, onPick, side }) {
  return (
    <button
      onClick={onPick}
      className={cx(
        'relative rounded-xl overflow-hidden ph-tex border border-outline-variant transition-all text-left',
        ph,
        active
          ? 'ring-4 ring-teal scale-[0.985]'
          : 'hover:scale-[1.01] hover:border-navy',
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-navy/55 to-transparent" />
      <div className="absolute top-3 left-3 type-eyebrow text-white/80">
        {side.toUpperCase()}
      </div>
      <div className="absolute bottom-3 left-3 right-3 text-[20px] leading-tight text-white font-semibold">
        {label}
      </div>
    </button>
  );
}

function TorVariant() {
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState([]);
  const [done, setDone] = useState(false);
  const [flash, setFlash] = useState(null);

  function pick(side) {
    setFlash(side);
    setTimeout(() => {
      setFlash(null);
      const np = [...picks, side];
      setPicks(np);
      if (i + 1 >= TOT_PAIRS.length) setDone(true);
      else setI(i + 1);
    }, 280);
  }

  if (done)
    return (
      <ArchetypeReveal
        archetypeId={archetypeFor('this-or-that')}
        onRestart={() => {
          setI(0);
          setPicks([]);
          setDone(false);
        }}
        variantName="This or That"
      />
    );

  const pair = TOT_PAIRS[i];
  const interstitials = [
    null,
    'Nice. You’re decisive.',
    null,
    'Oooh, we see you.',
    null,
    'Patterns incoming.',
    null,
    'One more.',
  ];
  const message = interstitials[i];

  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <Eyebrow>This or That</Eyebrow>
          <div className="text-[22px] font-semibold text-navy leading-tight mt-1 tracking-tight">
            {pair.q}
          </div>
        </div>
        <div className="text-[11px] font-bold text-ink-soft tabular-nums">
          {i + 1}/{TOT_PAIRS.length}
        </div>
      </div>
      <div className="px-5">
        <Progress value={((i + 1) / TOT_PAIRS.length) * 100} tone="lime" />
      </div>
      {message && (
        <div className="px-5 pt-3 type-eyebrow text-lime-700">{message}</div>
      )}
      <div className="flex-1 px-5 py-4 grid grid-rows-2 gap-3">
        <ToTCard side="a" ph={pair.a.ph} label={pair.a.label} active={flash === 'a'} onPick={() => pick('a')} />
        <ToTCard side="b" ph={pair.b.ph} label={pair.b.label} active={flash === 'b'} onPick={() => pick('b')} />
      </div>
      <div className="text-center pb-4 type-eyebrow text-ink-soft">
        tap either, no wrong answer
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// 4. INSPIRATION
// -----------------------------------------------------------------------
function InspirationVariant() {
  const [mode, setMode] = useState('board');
  const [sel, setSel] = useState(null);
  const [handle, setHandle] = useState('');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [archetypeId, setArchetypeId] = useState(null);

  function commit(id) {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
      const byBoard = {
        m1: 'coastal-sport',
        m2: 'rustic-rebel',
        m3: 'modern-muse',
        m4: 'modern-prep',
        m5: 'boho-dreamer',
        m6: 'adventure-sport',
        m7: 'studio-minimal',
        m8: 'rustic-rebel',
        m9: 'quiet-classic',
      };
      setArchetypeId(byBoard[id] || 'modern-muse');
    }, 1800);
  }

  if (done)
    return (
      <ArchetypeReveal
        archetypeId={archetypeId}
        onRestart={() => {
          setDone(false);
          setSel(null);
          setHandle('');
          setArchetypeId(null);
        }}
        variantName="Taste Transfer"
      />
    );

  if (processing)
    return (
      <div className="absolute inset-0 bg-surface flex flex-col items-center justify-center p-8 text-center">
        <div className="relative w-28 h-28 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-outline-variant" />
          <div
            className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin"
            style={{ animationDuration: '1.4s' }}
          />
          <div className="absolute inset-3 rounded-full ph-10 ph-tex" />
        </div>
        <div className="type-headline-md text-navy leading-tight">
          Reading between the lines.
        </div>
        <div className="type-eyebrow text-ink-soft mt-3">
          extracting aesthetic signature
        </div>
        <div className="mt-5 type-body-md text-ink-soft max-w-[280px]">
          Your stylist is pulling threads from color, silhouette, and texture signals.
        </div>
      </div>
    );

  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <Eyebrow>Taste Transfer</Eyebrow>
        <div className="text-[22px] font-semibold text-navy leading-tight mt-1 tracking-tight">
          Pick a mood. Drop a handle. Either works.
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
          <div className="grid grid-cols-3 gap-2.5">
            {MOOD_BOARDS.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSel(m.id);
                  commit(m.id);
                }}
                className={cx(
                  'relative aspect-[3/4] rounded overflow-hidden border border-outline-variant transition-all ph-tex',
                  m.ph,
                  sel === m.id
                    ? 'ring-2 ring-teal'
                    : 'hover:scale-[1.02] hover:border-navy',
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                <div className="absolute bottom-1.5 left-2 right-2 text-left">
                  <div className="text-[13px] text-white font-semibold leading-tight">
                    {m.title}
                  </div>
                  <div className="text-[8px] uppercase tracking-[0.14em] font-bold text-white/80 mt-1">
                    {m.sub}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        {mode === 'handle' && (
          <div className="pt-6 space-y-3">
            <Eyebrow>Instagram handle</Eyebrow>
            <div className="flex items-center gap-2 bg-surface-lowest border border-outline-variant rounded px-4 py-3">
              <span className="text-ink-soft">@</span>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="someone whose closet you’d raid"
                className="flex-1 bg-transparent text-[13.5px] placeholder:text-outline"
                style={{ boxShadow: 'none' }}
              />
            </div>
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={() => commit('m3')}
              disabled={!handle.trim()}
            >
              <Icon name="sparkle" /> Read the aesthetic
            </Button>
            <div className="text-[11px] text-ink-soft leading-relaxed pt-2">
              We only look at public posts. We don’t follow, save, or store handles after reading.
            </div>
          </div>
        )}
        {mode === 'celeb' && (
          <div className="pt-4 space-y-2">
            {[
              { name: 'Carolyn Bessette', desc: 'sharp minimalism, one perfect line', id: 'modern-muse' },
              { name: 'Steve McQueen', desc: 'work jacket, boot, quiet cool', id: 'rustic-rebel' },
              { name: 'Jane Birkin', desc: 'relaxed, soft, a little unbothered', id: 'coastal-sport' },
              { name: 'Brunello Cucinelli', desc: 'cashmere as a philosophy', id: 'modern-prep' },
              { name: 'Sade', desc: 'ink, silver, restraint', id: 'studio-minimal' },
              { name: 'Jenny Slate', desc: 'soft prints, stories, layers', id: 'boho-dreamer' },
            ].map((p) => (
              <button
                key={p.name}
                onClick={() => commit(p.id)}
                className="w-full flex items-center gap-3 p-3 rounded border border-outline-variant bg-surface-lowest hover:border-navy hover:bg-surface-low transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full ph-11 ph-tex" />
                <div className="flex-1">
                  <div className="text-[13.5px] text-navy font-semibold">{p.name}</div>
                  <div className="text-[11px] text-ink-soft italic mt-0.5">{p.desc}</div>
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

// -----------------------------------------------------------------------
// 5. CLASSIC (REFINED)
// -----------------------------------------------------------------------
function ClassicVariant() {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState({});
  const [celebrate, setCelebrate] = useState(false);
  const [done, setDone] = useState(false);
  const total = CLASSIC_QS.length;

  function advance() {
    if (step + 1 >= total) setDone(true);
    else setStep((s) => s + 1);
  }
  function answer(opt) {
    setPicks((p) => ({ ...p, [step]: opt }));
    if (step === 1 || step === 3) {
      setCelebrate(true);
      setTimeout(() => {
        setCelebrate(false);
        advance();
      }, 900);
    } else advance();
  }

  if (done)
    return (
      <ArchetypeReveal
        archetypeId={archetypeFor('classic')}
        onRestart={() => {
          setStep(0);
          setPicks({});
          setDone(false);
        }}
        variantName="Classic"
      />
    );

  const q = CLASSIC_QS[step];
  const pct = (step / total) * 100;

  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <Eyebrow>Classic, refined</Eyebrow>
          <div className="text-[11px] font-bold text-ink-soft tabular-nums">
            {step + 1} of {total}
          </div>
        </div>
        <Progress value={pct} tone="teal" />
      </div>
      <div className="flex-1 px-6 pb-6 flex flex-col">
        <h2 className="text-[26px] font-semibold leading-tight text-navy mb-5 tracking-tight">
          {q.q}
        </h2>
        <div className="space-y-2.5 flex-1">
          {q.opts.map((o) => {
            const sel = picks[step] === o;
            return (
              <button
                key={o}
                onClick={() => answer(o)}
                className={cx(
                  'w-full text-left p-4 rounded border transition-all',
                  sel
                    ? 'border-teal-500 bg-teal/10'
                    : 'border-outline-variant bg-surface-lowest hover:border-navy',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-navy">{o}</span>
                  {sel && <Icon name="check" className="text-teal-500" />}
                </div>
              </button>
            );
          })}
        </div>
        {celebrate && (
          <div className="mt-3 p-3 rounded bg-lime/20 border border-lime bloom flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-lime text-navy flex items-center justify-center">
              <Icon name="sparkle" size={14} />
            </div>
            <div className="text-[13px] text-navy font-semibold italic">
              Halfway home.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// 6. BUILDER
// -----------------------------------------------------------------------
function BuilderVariant() {
  const { inventory } = useFactory();
  const [placed, setPlaced] = useState([]);
  const [cat, setCat] = useState('Top');
  const [dragItem, setDragItem] = useState(null);
  const [done, setDone] = useState(false);
  const canvasRef = useRef(null);

  const cats = ['Top', 'Bottom', 'Shoes', 'Layer'];
  // Pull real Women's inventory for the builder canvas. Normalize to the
  // simpler shape BuilderVariant uses. Carry `imageUrl` so the canvas
  // tiles render real photos when the manifest is populated.
  const available = inventory
    .filter((i) => i.category === 'Women' && i.subcategory === BUILDER_CAT_MAP[cat])
    .slice(0, 12)
    .map((i) => ({ id: i.id, cat, label: i.name, ph: i.ph, imageUrl: i.imageUrl }));

  function onDrop(e) {
    e.preventDefault();
    if (!dragItem || !canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - r.left - 40;
    const y = e.clientY - r.top - 50;
    setPlaced((p) => [
      ...p.filter((q) => q.item.cat !== dragItem.cat),
      { id: Date.now(), x, y, item: dragItem },
    ]);
    setDragItem(null);
  }
  function removeAt(id) {
    setPlaced((p) => p.filter((q) => q.id !== id));
  }

  if (done)
    return (
      <ArchetypeReveal
        archetypeId={archetypeFor('builder')}
        onRestart={() => {
          setPlaced([]);
          setDone(false);
        }}
        variantName="Builder"
      />
    );

  return (
    <div className="absolute inset-0 bg-surface flex flex-col">
      <div className="px-5 pt-5 pb-2">
        <Eyebrow>Outfit Builder</Eyebrow>
        <div className="text-[20px] font-semibold text-navy leading-tight mt-1 tracking-tight">
          Build the outfit you wish was in your closet.
        </div>
      </div>
      <div
        ref={canvasRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="mx-5 mt-2 mb-3 rounded border border-outline-variant bg-surface-lowest grid-dots relative overflow-hidden"
        style={{ height: 300 }}
      >
        {placed.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-outline type-eyebrow">
            drag here
          </div>
        )}
        {placed.map((p) => (
          <div
            key={p.id}
            onDoubleClick={() => removeAt(p.id)}
            className={cx(
              'absolute w-20 h-24 rounded overflow-hidden border border-outline-variant',
              p.item.imageUrl ? 'bg-surface-high' : cx('ph-tex', p.item.ph),
            )}
            style={{ left: p.x, top: p.y }}
          >
            {p.item.imageUrl && (
              <img
                src={p.item.imageUrl}
                alt={p.item.label}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent rounded pointer-events-none" />
            <div className="absolute bottom-1 left-1 right-1 text-[9px] text-white leading-tight font-bold">
              {p.item.label.split(' — ')[0]}
            </div>
          </div>
        ))}
        {placed.length >= 2 && (
          <button
            onClick={() => setDone(true)}
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded bg-teal text-navy text-[11px] font-bold uppercase tracking-[0.08em] flex items-center gap-1.5 hover:bg-teal-300 transition-colors"
          >
            <Icon name="sparkle" size={12} /> Finish outfit
          </button>
        )}
      </div>
      <div className="px-5">
        <div className="flex gap-1.5 mb-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cx(
                'px-3 py-1.5 rounded text-[11px] uppercase tracking-[0.08em] font-bold border transition-colors',
                cat === c
                  ? 'bg-navy text-white border-navy'
                  : 'bg-surface-lowest text-ink-soft border-outline-variant hover:border-navy',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        <div className="grid grid-cols-4 gap-2">
          {available.map((i) => (
            <div
              key={i.id}
              draggable
              onDragStart={() => setDragItem(i)}
              className={cx(
                'aspect-[3/4] rounded overflow-hidden border border-outline-variant cursor-grab active:cursor-grabbing relative',
                i.imageUrl ? 'bg-surface-high' : cx('ph-tex', i.ph),
              )}
            >
              {i.imageUrl && (
                <img
                  src={i.imageUrl}
                  alt={i.label}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent rounded pointer-events-none" />
              <div className="absolute bottom-1 left-1 right-1 text-[9px] text-white leading-tight font-bold">
                {i.label.split(' — ')[0]}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center type-eyebrow text-ink-soft mt-3">
          drag onto canvas · double-click to remove
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Gallery shell
// -----------------------------------------------------------------------
const VARIANT_IMPLS = {
  swipe: SwipeVariant,
  chat: ChatVariant,
  'this-or-that': TorVariant,
  inspiration: InspirationVariant,
  classic: ClassicVariant,
  builder: BuilderVariant,
};

// Fallback lookup by modality — used for draft/new variants that don't
// have a dedicated implementation yet. Previews the nearest canonical flow.
const KIND_IMPLS = {
  Swipe: SwipeVariant,
  Chat: ChatVariant,
  'Conversational AI': ChatVariant,
  Binary: TorVariant,
  'Binary Pairs': TorVariant,
  Inspiration: InspirationVariant,
  Quiz: ClassicVariant,
  'Structured Quiz': ClassicVariant,
  Canvas: BuilderVariant,
};

function LineStat({ label, value, suffix = '' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12.5px] text-ink-soft">{label}</span>
      <span className="text-[13px] text-navy font-bold tabular-nums">
        {value}
        {suffix}
      </span>
    </div>
  );
}

function DesktopFrame({ children }) {
  // A wider, non-mobile preview shell — still emphasizes the editorial
  // feel without pretending to be a full laptop chrome.
  return (
    <div className="mx-auto w-full max-w-[640px]">
      <div className="rounded border border-outline-variant bg-navy p-2">
        <div className="flex items-center gap-1.5 pb-2 px-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white/25" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/25" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/25" />
          <span className="ml-3 text-[10px] uppercase tracking-[0.14em] font-bold text-white/60">
            dayone.preview
          </span>
        </div>
        <div className="relative bg-surface rounded overflow-hidden" style={{ height: 560 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function VariantGallery({ initialId, onNewVariant }) {
  const { variants } = useFactory();
  const [active, setActive] = useState(initialId || 'swipe');
  const [viewport, setViewport] = useState('mobile');
  const [key, setKey] = useState(0);
  const v = variants.find((x) => x.id === active) || variants[0];
  const Impl = VARIANT_IMPLS[active];

  // Draft variants created via the New Variant modal don't have a
  // hand-built flow yet — preview them using the nearest canonical
  // implementation for their modality so the modality still feels right.
  const SafeImpl = Impl || KIND_IMPLS[v?.kind] || VARIANT_IMPLS.swipe;

  // Keep the run key stable when viewport changes, reset on variant switch
  React.useEffect(() => {
    setKey((k) => k + 1);
  }, [active]);

  return (
    <div className="px-6 md:px-10 py-12 max-w-[1400px] mx-auto">
      <SectionHead
        eyebrow="Gallery / playable variants"
        title="Every door. Same house."
        sub="Click any variant. Run it as a new visitor would — then compare."
        right={
          <div className="flex items-center gap-3">
            <Segmented
              options={[
                { label: 'Mobile', value: 'mobile' },
                { label: 'Desktop preview', value: 'desktop' },
              ]}
              value={viewport}
              onChange={setViewport}
            />
            {onNewVariant && (
              <Button onClick={onNewVariant}>
                <Icon name="plus" /> New variant
              </Button>
            )}
          </div>
        }
      />

      <div className="grid md:grid-cols-[280px_1fr_300px] gap-6">
        <Card className="p-2">
          {variants.map((x) => (
            <button
              key={x.id}
              onClick={() => {
                setActive(x.id);
                setKey((k) => k + 1);
              }}
              className={cx(
                'w-full flex items-center gap-3 p-3 rounded text-left transition-colors',
                active === x.id
                  ? 'bg-teal/20 border border-teal'
                  : 'border border-transparent hover:bg-surface-base',
              )}
            >
              <div
                className={cx(
                  'w-10 h-12 rounded-sm ph-tex border border-outline-variant',
                  x.thumb,
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] text-navy font-semibold leading-tight truncate">
                  {x.name}
                </div>
                <div className="type-eyebrow text-ink-soft mt-1">{x.kind}</div>
              </div>
              {active === x.id && <Icon name="chev" className="text-navy" />}
            </button>
          ))}
        </Card>

        <div className="flex flex-col items-center pt-4">
          {v?.status === 'Draft' && !VARIANT_IMPLS[active] && (
            <div className="mb-4 px-4 py-2 rounded border border-lime bg-lime/30 text-navy text-[11px] font-bold uppercase tracking-[0.08em] flex items-center gap-2">
              <Icon name="sparkle" size={14} />
              Draft preview · using {v.kind} template
            </div>
          )}
          {viewport === 'mobile' ? (
            <PhoneFrame key={'phone-' + active + '-' + key}>
              <SafeImpl />
            </PhoneFrame>
          ) : (
            <DesktopFrame key={'desk-' + active + '-' + key}>
              <SafeImpl />
            </DesktopFrame>
          )}
        </div>

        <div className="space-y-5">
          <Card className="p-6">
            <Eyebrow>{v.kind}</Eyebrow>
            <h3 className="type-headline-md text-navy leading-tight mt-2">
              {v.name}
            </h3>
            <p className="text-[13px] text-ink-soft leading-relaxed mt-3 italic">
              "{v.tagline}"
            </p>
            <div className="mt-5 pt-5 border-t border-outline-variant">
              <Eyebrow className="mb-3">Why this variant</Eyebrow>
              <p className="type-body-md text-navy leading-relaxed">{v.why}</p>
            </div>
          </Card>
          <Card className="p-6">
            <Eyebrow className="mb-4">Live signal</Eyebrow>
            <div className="space-y-3">
              <LineStat label="Completion rate" value={v.metrics.completion} suffix="%" />
              <LineStat label="Avg. time to complete" value={v.metrics.avgTime} />
              <LineStat label="Style-signal density" value={v.metrics.signalDensity} suffix="/100" />
              <LineStat label="First-Fix keep rate" value={v.metrics.firstFix} suffix="%" />
            </div>
          </Card>
          <Button
            variant="secondary"
            className="w-full justify-center"
            onClick={() => setKey((k) => k + 1)}
          >
            <Icon name="play" /> Restart run
          </Button>
        </div>
      </div>
    </div>
  );
}
