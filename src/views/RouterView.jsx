// Agent reasoning trace + mid-flow adaptation modal.

import React from 'react';
import {
  Badge,
  Button,
  Card,
  Eyebrow,
  Icon,
  MiniBar,
  Modal,
  SectionHead,
  cx,
  useCountUp,
  useEffect,
  useState,
} from '../ui.jsx';
import { VISITORS } from '../data.js';
import { useFactory } from '../state.jsx';

const AVATARS = {
  maya: 'ph-8',
  robert: 'ph-5',
  priya: 'ph-10',
  jordan: 'ph-9',
  lena: 'ph-4',
};

function Row({ k, v }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="type-eyebrow text-ink-soft w-20 flex-shrink-0">{k}</span>
      <span className="text-[13px] text-navy">{v}</span>
    </div>
  );
}

function TraceStep({ n, t, active, done, last, children }) {
  return (
    <div className={cx('flex gap-4 transition-opacity', active ? 'opacity-100' : 'opacity-40')}>
      <div className="flex flex-col items-center">
        <div
          className={cx(
            'w-8 h-8 rounded flex items-center justify-center text-[11px] font-bold border tabular-nums',
            done
              ? 'bg-teal text-navy border-teal'
              : active
                ? 'bg-lime/30 text-navy border-lime'
                : 'bg-surface-lowest text-ink-soft border-outline-variant',
          )}
        >
          {done ? <Icon name="check" size={14} /> : n}
        </div>
        {!last && <div className="w-px flex-1 bg-outline-variant mt-1 min-h-[20px]" />}
      </div>
      <div className="flex-1 pb-3">
        <Eyebrow>{t}</Eyebrow>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

function PhaseBlock({ active, label, who, tone = 'navy', msg }) {
  const c = tone === 'teal' ? 'text-teal-500' : tone === 'lime' ? 'text-lime-700' : 'text-navy';
  return (
    <div className={cx('flex gap-3 items-start transition-all', active ? 'opacity-100' : 'opacity-30')}>
      <div className="text-[10px] text-ink-soft w-12 flex-shrink-0 pt-0.5 font-bold tabular-nums uppercase tracking-[0.08em]">
        {label}
      </div>
      <div className="flex-1">
        <div className={cx('text-[10px] uppercase tracking-[0.12em] mb-1 font-bold', c)}>
          {who}
        </div>
        <div className="text-[13px] text-navy leading-snug">{msg}</div>
      </div>
    </div>
  );
}

function AdaptationModal({ open, onClose }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!open) {
      setPhase(0);
      return;
    }
    const timers = [
      setTimeout(() => setPhase(1), 1400),
      setTimeout(() => setPhase(2), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} className="w-full max-w-[920px]">
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <Eyebrow className="text-lime-700">The lean-forward moment</Eyebrow>
            <h2 className="type-headline-lg text-navy leading-tight mt-2">
              Mid-flow adaptation.
            </h2>
            <p className="type-body-md text-ink-soft max-w-[60ch] mt-2">
              Jordan starts in Swipe. Engagement drops at card 4. The agent notices, and offers a gentler door.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded hover:bg-surface-base flex items-center justify-center text-navy"
          >
            <Icon name="x" />
          </button>
        </div>

        <div className="grid md:grid-cols-[1fr_280px] gap-6">
          <Card className="p-6">
            <Eyebrow className="mb-3">Session timeline</Eyebrow>
            <div className="relative h-32 bg-surface rounded border border-outline-variant p-3">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                <path
                  d="M 20,30 L 80,28 L 140,32 L 200,55 L 260,78 L 320,82 L 380,30"
                  fill="none"
                  stroke="#001E60"
                  strokeOpacity="0.35"
                  strokeWidth="1.5"
                  strokeDasharray={phase < 1 ? '4,4' : '0'}
                  className="transition-all"
                />
                <path
                  d="M 20,30 L 80,28 L 140,32 L 200,55 L 260,78"
                  fill="none"
                  stroke="#001E60"
                  strokeWidth="2.5"
                />
                {phase >= 2 && (
                  <path
                    d="M 260,78 L 320,40 L 380,22"
                    fill="none"
                    stroke="#24695F"
                    strokeWidth="2.5"
                    className="bloom"
                  />
                )}
                <line x1="260" y1="0" x2="260" y2="100" stroke="#BFC9C5" />
              </svg>
              <div className="absolute top-2 left-4 type-eyebrow text-ink-soft">engagement</div>
              <div className="absolute bottom-1 left-3 text-[9px] text-ink-soft font-bold uppercase tracking-[0.08em]">
                card 1
              </div>
              <div className="absolute bottom-1 left-1/3 text-[9px] text-ink-soft font-bold uppercase tracking-[0.08em]">
                card 4
              </div>
              <div className="absolute bottom-1 right-6 text-[9px] text-ink-soft font-bold uppercase tracking-[0.08em]">
                finish
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <PhaseBlock active={phase >= 0} label="T+22s" who="SWIPE" msg="Jordan swipes 3 cards in 11s. Strong start." />
              <PhaseBlock
                active={phase >= 1}
                label="T+58s"
                who="AGENT"
                tone="lime"
                msg="Engagement score dropped to 0.31. Cards 4–5 showed 8s+ hesitation. Context: referral traffic, high-signal prior."
              />
              <PhaseBlock
                active={phase >= 2}
                label="T+61s"
                who="AGENT"
                tone="teal"
                msg="Offering modality switch: Outfit Builder. Preserves momentum, captures gold-standard signal for a user who wants to build, not skim."
              />
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="p-5 flex-1">
              <Eyebrow className="mb-3">What Jordan sees</Eyebrow>
              <div className="relative bg-teal/15 border border-teal rounded p-4">
                <div className="text-[16px] font-semibold text-navy leading-snug">
                  Want to build it instead?
                </div>
                <p className="text-[12px] text-navy/70 mt-2 leading-snug">
                  You seem like someone who’d rather make the outfit than vote on it. Takes 2 more minutes. We’ll keep what you’ve told us so far.
                </p>
                <div className="mt-3 flex gap-2">
                  <div className="px-3 py-1.5 rounded bg-navy text-white text-[10px] font-bold uppercase tracking-[0.08em]">
                    Yes, let’s build
                  </div>
                  <div className="px-3 py-1.5 rounded border border-navy text-navy text-[10px] font-bold uppercase tracking-[0.08em]">
                    Keep swiping
                  </div>
                </div>
              </div>
            </Card>
            <div className="text-[12px] text-ink-soft leading-relaxed p-3">
              <Eyebrow className="text-teal-500 mb-1">Outcome (simulated)</Eyebrow>
              Jordan accepts, completes Builder in 3m, yields signal density{' '}
              <span className="text-navy font-bold tabular-nums">97</span> — the highest captured this week.
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function OverrideModal({ open, onClose, visitor, variants, recommended, onChoose }) {
  if (!visitor) return null;
  return (
    <Modal open={open} onClose={onClose} className="w-full max-w-[560px]">
      <div className="p-8">
        <div className="flex items-start justify-between mb-5">
          <div>
            <Eyebrow className="text-lime-700">Manual override</Eyebrow>
            <h2 className="type-headline-md text-navy leading-tight mt-2">
              Pick a different door for {visitor.name}.
            </h2>
            <p className="type-body-md text-ink-soft mt-2">
              The agent recommended{' '}
              <span className="text-navy font-semibold">{recommended?.name}</span>.
              You can route anywhere — we’ll log the override and learn from it.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded hover:bg-surface-base flex items-center justify-center text-navy"
            aria-label="Close"
          >
            <Icon name="x" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => onChoose(v)}
              className={cx(
                'flex items-center gap-3 p-3 rounded border text-left transition-colors',
                v.id === recommended?.id
                  ? 'border-teal bg-teal/15'
                  : 'border-outline-variant bg-surface-lowest hover:border-navy',
              )}
            >
              <span className={cx('w-8 h-10 rounded-sm ph-tex flex-shrink-0', v.thumb)} />
              <div className="flex-1 min-w-0">
                <div className="type-eyebrow text-ink-soft">{v.kind}</div>
                <div className="text-[13px] text-navy font-semibold truncate mt-1">
                  {v.name}
                </div>
              </div>
              {v.id === recommended?.id && (
                <Badge tone="teal" className="flex-shrink-0">
                  agent
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default function RouterView({ onSendToVariant }) {
  const { variants } = useFactory();
  const [vid, setVid] = useState(VISITORS[0].id);
  const [stage, setStage] = useState(0);
  const [adaptOpen, setAdaptOpen] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [routedTo, setRoutedTo] = useState(null);
  const v = VISITORS.find((x) => x.id === vid);
  const recommended = variants.find((x) => x.id === v.recommend);
  const variant = variants.find((x) => x.id === (routedTo || v.recommend)) || recommended;

  useEffect(() => {
    setStage(0);
    setRoutedTo(null);
    const t1 = setTimeout(() => setStage(1), 400);
    const t2 = setTimeout(() => setStage(2), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [vid]);

  const confidence = useCountUp(stage >= 2 ? v.confidence : 0, 900);

  return (
    <div className="px-6 md:px-10 py-12 max-w-[1400px] mx-auto">
      <SectionHead
        eyebrow="Router / reasoning trace"
        title="One agent, six doors."
        sub="The router reads each visitor, considers signals, and picks the variant most likely to land. Watch it work."
        right={
          <Button variant="secondary" onClick={() => setAdaptOpen(true)}>
            <Icon name="bolt" /> See mid-flow adaptation
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-8">
        {VISITORS.map((x) => (
          <button
            key={x.id}
            onClick={() => setVid(x.id)}
            className={cx(
              'flex items-center gap-2.5 pl-2 pr-4 py-2 rounded border transition-all',
              vid === x.id
                ? 'bg-navy text-white border-navy'
                : 'bg-surface-lowest text-navy border-outline-variant hover:border-navy',
            )}
          >
            <span className={cx('w-7 h-7 rounded-sm ph-tex', AVATARS[x.id])} />
            <span className="text-[13px] font-semibold">
              {x.name}, {x.age}
            </span>
            <span
              className={cx(
                'text-[10px] uppercase tracking-[0.12em] font-bold',
                vid === x.id ? 'text-white/70' : 'text-ink-soft',
              )}
            >
              {x.device === 'Mobile' ? 'mob' : 'dsk'}
            </span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[280px_1fr_280px] gap-5">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className={cx('w-14 h-14 rounded-full ph-tex', AVATARS[v.id])} />
            <div>
              <div className="text-[22px] font-semibold leading-tight text-navy tracking-tight">
                {v.name}, {v.age}
              </div>
              <div className="type-eyebrow text-ink-soft mt-1">{v.session}</div>
            </div>
          </div>
          <div className="space-y-3 text-[13px]">
            <Row k="channel" v={v.channel} />
            <Row k="device" v={v.device} />
            <Row k="session" v={v.session} />
          </div>
          <div className="mt-6 pt-5 border-t border-outline-variant">
            <Eyebrow className="mb-3">Behavioral signals</Eyebrow>
            <div className="flex flex-wrap gap-1.5">
              {v.signals.map((s) => (
                <Badge key={s} tone="outline">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-outline-variant">
            <div>
              <Eyebrow>Reasoning trace</Eyebrow>
              <div className="type-headline-md text-navy mt-2">
                The agent, thinking out loud
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cx(
                  'w-2 h-2 rounded-full',
                  stage < 2 ? 'bg-lime-700 pulse-dot' : 'bg-teal-500',
                )}
              />
              <span className="type-eyebrow text-ink-soft">
                {stage < 2 ? 'analyzing' : 'decided'}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-5 min-h-[380px]">
            <TraceStep n="01" t="Read" active={stage >= 1} done={stage >= 2}>
              <div className="text-[13px] text-navy">
                Observing {v.signals.length} signals from the session. Highest-weight:{' '}
                <span className="text-teal-500 font-bold">{v.signals[0]}</span>.
              </div>
            </TraceStep>

            <TraceStep n="02" t="Weigh" active={stage >= 1} done={stage >= 2}>
              <div className="space-y-2">
                {v.reasoning.map((r, i) => (
                  <div
                    key={i}
                    className="flex gap-2 items-start text-[13px] text-navy leading-snug"
                  >
                    <span className="text-[10px] text-ink-soft mt-1 font-bold">&gt;</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </TraceStep>

            <TraceStep n="03" t="Route" active={stage >= 2} done={stage >= 2} last>
              {stage < 2 ? (
                <div className="h-16 shimmer rounded" />
              ) : (
                <div className="bloom">
                  <div
                    className={cx(
                      'relative rounded overflow-hidden border border-outline-variant p-5 flex items-center gap-4',
                      variant.thumb,
                      'ph-tex',
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-navy/50 to-transparent" />
                    <div className="relative z-10">
                      <div className="type-eyebrow text-white/80">Selected variant</div>
                      <div className="type-headline-md text-white leading-tight mt-1">
                        {variant.name}
                      </div>
                      <div className="text-[12.5px] text-white/90 mt-1 italic">
                        {variant.tagline}
                      </div>
                    </div>
                    <div className="relative z-10 ml-auto text-right">
                      <div className="type-eyebrow text-white/80">Confidence</div>
                      <div className="text-[2.25rem] font-bold text-white leading-none mt-1 tabular-nums">
                        {confidence}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <Button
                      variant="primary"
                      className="text-[11px] py-2"
                      onClick={() => onSendToVariant && onSendToVariant(variant.id)}
                    >
                      <Icon name="play" size={14} /> Send {v.name} into {variant.name}
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-[11px] py-2"
                      onClick={() => setOverrideOpen(true)}
                    >
                      Override
                    </Button>
                    {routedTo && routedTo !== v.recommend && (
                      <Badge tone="lime" className="ml-1">
                        Overridden
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </TraceStep>
          </div>
        </Card>

        <Card className="p-6">
          <Eyebrow className="mb-3">Considered alternatives</Eyebrow>
          <div className="space-y-2.5">
            {variants.filter((x) => x.id !== v.recommend)
              .slice(0, 4)
              .map((x, i) => {
                const score = Math.max(
                  12,
                  v.confidence - (i + 1) * 15 - Math.round(Math.random() * 6),
                );
                return (
                  <div
                    key={x.id}
                    className="p-2.5 rounded border border-outline-variant bg-surface-lowest"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cx('w-6 h-6 rounded-sm ph-tex', x.thumb)} />
                      <span className="text-[12.5px] text-navy flex-1 font-semibold">{x.name}</span>
                      <span className="text-[11px] text-ink-soft font-bold tabular-nums">
                        {score}%
                      </span>
                    </div>
                    <MiniBar value={score} max={100} />
                  </div>
                );
              })}
          </div>
          <div className="mt-5 pt-5 border-t border-outline-variant">
            <Eyebrow className="mb-3">Routing principles used</Eyebrow>
            <ul className="space-y-2 text-[12px] text-ink-soft">
              <li>· Acquisition channel prior</li>
              <li>· Device &amp; session profile</li>
              <li>· Behavioral entropy</li>
              <li>· Prior style-graph signal</li>
            </ul>
          </div>
        </Card>
      </div>

      <AdaptationModal open={adaptOpen} onClose={() => setAdaptOpen(false)} />
      <OverrideModal
        open={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        visitor={v}
        variants={variants}
        recommended={recommended}
        onChoose={(picked) => {
          setRoutedTo(picked.id);
          setOverrideOpen(false);
        }}
      />
    </div>
  );
}
