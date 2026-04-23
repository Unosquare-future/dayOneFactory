// Shared UI primitives for the Editorial Blue design system.
// Every component here follows three rules:
//   1. Typography is Epilogue. Labels use the label-bold / eyebrow
//      utility with increased letter-spacing; headlines are tight.
//   2. Surfaces use hairline 1px outlines over shadows to convey depth.
//   3. Primary CTAs are teal (#86C8BC) with navy (#001E60) text.

import React, {
  useState,
  useEffect,
  useRef,
} from 'react';

export { useState, useEffect, useRef };

// -----------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------
export function cx(...xs) {
  return xs.filter(Boolean).join(' ');
}

// -----------------------------------------------------------------------
// Icon — minimal inline stroke library
// -----------------------------------------------------------------------
export function Icon({ name, className = '', size = 16 }) {
  const s = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
  };
  const paths = {
    factory: (
      <>
        <path d="M4 20V10l6 4V10l6 4V6l4-2v18H4Z" />
        <path d="M8 20v-4" />
        <path d="M13 20v-4" />
        <path d="M18 20v-4" />
      </>
    ),
    layers: (
      <>
        <path d="M12 3 2 8l10 5 10-5-10-5Z" />
        <path d="m2 12 10 5 10-5" />
        <path d="m2 16 10 5 10-5" />
      </>
    ),
    route: (
      <>
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="18" r="2" />
        <circle cx="18" cy="6" r="2" />
        <path d="M8 6h8" />
        <path d="M6 8v2a6 6 0 0 0 6 6h4" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 15l4-4 3 3 5-6" />
      </>
    ),
    play: <path d="M6 4v16l14-8Z" />,
    pause: (
      <>
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    check: <path d="M5 12l4 4 10-10" />,
    x: (
      <>
        <path d="M6 6l12 12" />
        <path d="M6 18L18 6" />
      </>
    ),
    chev: <path d="M9 6l6 6-6 6" />,
    back: <path d="M15 6l-6 6 6 6" />,
    heart: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10Z" />,
    send: (
      <>
        <path d="M22 2 11 13" />
        <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
      </>
    ),
    sparkle: (
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    drag: (
      <>
        <circle cx="9" cy="6" r="1" />
        <circle cx="9" cy="12" r="1" />
        <circle cx="9" cy="18" r="1" />
        <circle cx="15" cy="6" r="1" />
        <circle cx="15" cy="12" r="1" />
        <circle cx="15" cy="18" r="1" />
      </>
    ),
    mobile: (
      <>
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M11 18h2" />
      </>
    ),
    desktop: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    filter: <path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z" />,
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
    brain: (
      <>
        <path d="M8 6a3 3 0 0 1 4-2 3 3 0 0 1 4 2 3 3 0 0 1 2 5 3 3 0 0 1-1 5 3 3 0 0 1-5 2 3 3 0 0 1-5-2 3 3 0 0 1-1-5 3 3 0 0 1 2-5Z" />
        <path d="M12 4v16" />
      </>
    ),
    message: <path d="M4 5h16v11H8l-4 4V5Z" />,
    swipe: (
      <>
        <path d="M6 12h12" />
        <path d="m14 8 4 4-4 4" />
        <path d="m10 16-4-4 4-4" />
      </>
    ),
    clipboard: (
      <>
        <rect x="6" y="4" width="12" height="16" rx="2" />
        <path d="M9 4h6v3H9z" />
      </>
    ),
    palette: (
      <>
        <path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-1 1-2-.4-.9.1-2 1.5-2H17a3 3 0 0 0 3-3c0-5-3.5-9-8-9Z" />
        <circle cx="7.5" cy="10.5" r="1" />
        <circle cx="10.5" cy="7.5" r="1" />
        <circle cx="14.5" cy="7.5" r="1" />
      </>
    ),
    timer: (
      <>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2 2" />
        <path d="M9 2h6" />
      </>
    ),
    trend: (
      <>
        <path d="m3 17 6-6 4 4 8-8" />
        <path d="M14 7h7v7" />
      </>
    ),
  };
  return <svg {...s}>{paths[name] || null}</svg>;
}

// -----------------------------------------------------------------------
// Badge — tertiary lime pop + supporting tones
// -----------------------------------------------------------------------
export function Badge({ tone = 'navy', children, className = '' }) {
  const tones = {
    navy: 'bg-surface-lowest text-navy border-navy/15',
    teal: 'bg-teal/20 text-navy border-teal',
    lime: 'bg-lime/30 text-navy border-lime',
    outline: 'bg-surface-lowest text-ink-soft border-outline-variant',
    live: 'bg-teal/20 text-navy border-teal',
    draft: 'bg-surface-base text-ink-soft border-outline-variant',
    paused: 'bg-lime/20 text-navy border-lime/60',
  };
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] rounded border',
        tones[tone] || tones.navy,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ status }) {
  const map = { Live: 'bg-teal-500', Paused: 'bg-lime-700', Draft: 'bg-outline' };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cx(
          'w-1.5 h-1.5 rounded-full',
          map[status] || 'bg-outline',
          status === 'Live' && 'pulse-dot',
        )}
      />
      <span className="text-[11px] tracking-[0.12em] text-ink-soft uppercase font-bold">
        {status}
      </span>
    </span>
  );
}

// -----------------------------------------------------------------------
// Button — label-bold typography, soft radius, teal primary on navy text
// -----------------------------------------------------------------------
export function Button({ variant = 'primary', className = '', children, ...p }) {
  const v = {
    // Teal bg with navy text — the signature CTA
    primary:
      'bg-teal text-navy hover:bg-teal-300 border border-teal hover:border-teal-300',
    // Navy outline on neutral — the supporting CTA
    secondary:
      'bg-surface-lowest text-navy border border-navy hover:bg-navy hover:text-white',
    // Minimal text-only
    ghost:
      'text-navy hover:bg-surface-base border border-transparent',
    // Tertiary lime — reserved for "earned it" moments (small pops only)
    lime: 'bg-lime text-navy border border-lime hover:bg-lime-300 hover:border-lime-300',
    // Ink/dark button for secondary-dark contexts
    ink: 'bg-navy text-white border border-navy hover:bg-navy-700',
  };
  return (
    <button
      {...p}
      className={cx(
        'inline-flex items-center gap-2 px-4 py-2.5 rounded text-[0.8125rem] uppercase tracking-[0.08em] font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        v[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

// -----------------------------------------------------------------------
// Card — flat, 1px outline, soft radius
// -----------------------------------------------------------------------
export function Card({ className = '', children, ...p }) {
  return (
    <div
      {...p}
      className={cx(
        'bg-surface-lowest border border-outline-variant rounded-lg',
        className,
      )}
    >
      {children}
    </div>
  );
}

// -----------------------------------------------------------------------
// Progress — teal on hairline track
// -----------------------------------------------------------------------
export function Progress({ value = 0, tone = 'teal' }) {
  const c = tone === 'lime' ? 'bg-lime-500' : tone === 'navy' ? 'bg-navy' : 'bg-teal';
  return (
    <div className="w-full h-1 bg-surface-high rounded-full overflow-hidden">
      <div
        className={cx('h-full rounded-full transition-all duration-500', c)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function MiniBar({ value, max = 100, tone = 'teal' }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-surface-high rounded-full overflow-hidden">
        <div
          className={cx(
            'h-full rounded-full',
            tone === 'lime' ? 'bg-lime-500' : 'bg-teal',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-ink-soft w-8 text-right font-bold tabular-nums">
        {value}
      </span>
    </div>
  );
}

// -----------------------------------------------------------------------
// Segmented — chip group with teal active
// -----------------------------------------------------------------------
export function Segmented({ options, value, onChange, className = '' }) {
  return (
    <div
      className={cx(
        'inline-flex p-0.5 bg-surface-base rounded border border-outline-variant',
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            'px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.06em] rounded transition-all',
            value === o.value
              ? 'bg-teal text-navy'
              : 'text-ink-soft hover:text-navy',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, size = 'md' }) {
  const w = size === 'sm' ? 'w-8 h-[18px]' : 'w-10 h-[22px]';
  const d = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={cx(
        'relative rounded-full transition-colors border',
        w,
        on ? 'bg-teal border-teal' : 'bg-surface-high border-outline-variant',
      )}
    >
      <span
        className={cx(
          'absolute top-1/2 -translate-y-1/2 bg-surface-lowest rounded-full transition-all border border-outline-variant',
          d,
        )}
        style={{ left: on ? 'calc(100% - 18px)' : '2px' }}
      />
    </button>
  );
}

// -----------------------------------------------------------------------
// Modal — hard overlay, subtle large-radius ambient lift
// -----------------------------------------------------------------------
export function Modal({ open, onClose, children, className = '' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cx(
          'relative bg-surface-lowest rounded-lg border-2 border-navy max-h-[92vh] overflow-hidden shadow-lift',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// PhoneFrame — mockup device shell used by the variant gallery
// -----------------------------------------------------------------------
export function PhoneFrame({ children, tone = 'surface', className = '' }) {
  return (
    <div className={cx('mx-auto', className)}>
      <div className="relative w-[360px] h-[720px] rounded-[44px] bg-navy p-2 shadow-lift">
        <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-24 h-5 bg-navy rounded-b-xl z-10" />
        <div
          className={cx(
            'w-full h-full rounded-[36px] overflow-hidden relative',
            tone === 'surface' ? 'bg-surface' : 'bg-surface-lowest',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Hook — animated count up
// -----------------------------------------------------------------------
export function useCountUp(target, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * e));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

// -----------------------------------------------------------------------
// SectionHead — editorial section title (eyebrow + headline)
// -----------------------------------------------------------------------
export function SectionHead({ eyebrow, title, sub, right }) {
  return (
    <div className="flex items-end justify-between gap-6 mb-10">
      <div>
        {eyebrow && (
          <div className="type-eyebrow text-navy/70 mb-3">{eyebrow}</div>
        )}
        <h2 className="type-headline-lg text-navy">{title}</h2>
        {sub && (
          <p className="mt-3 type-body-lg text-ink-soft max-w-[58ch]">{sub}</p>
        )}
      </div>
      {right}
    </div>
  );
}

// -----------------------------------------------------------------------
// Eyebrow — consistent small caps label helper
// -----------------------------------------------------------------------
export function Eyebrow({ children, className = '' }) {
  return (
    <div className={cx('type-eyebrow text-ink-soft', className)}>
      {children}
    </div>
  );
}
