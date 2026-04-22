// Shared UI primitives

const { useState, useEffect, useRef, useMemo, useCallback } = React;

function cx(...xs) { return xs.filter(Boolean).join(' '); }

function Icon({ name, className='', size=16 }) {
  // Minimal inline line icons
  const s = { width:size, height:size, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:1.6, strokeLinecap:'round', strokeLinejoin:'round', className };
  const paths = {
    factory: <><path d="M4 20V10l6 4V10l6 4V6l4-2v18H4Z"/><path d="M8 20v-4"/><path d="M13 20v-4"/><path d="M18 20v-4"/></>,
    layers: <><path d="M12 3 2 8l10 5 10-5-10-5Z"/><path d="m2 12 10 5 10-5"/><path d="m2 16 10 5 10-5"/></>,
    route: <><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 6h8"/><path d="M6 8v2a6 6 0 0 0 6 6h4"/></>,
    chart: <><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></>,
    play: <><path d="M6 4v16l14-8Z"/></>,
    pause: <><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    check: <><path d="M5 12l4 4 10-10"/></>,
    x: <><path d="M6 6l12 12"/><path d="M6 18L18 6"/></>,
    chev: <><path d="M9 6l6 6-6 6"/></>,
    back: <><path d="M15 6l-6 6 6 6"/></>,
    heart: <><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10Z"/></>,
    send: <><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/></>,
    sparkle: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    drag: <><circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/></>,
    mobile: <><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></>,
    desktop: <><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></>,
    search: <><circle cx="11" cy="11" r="6"/><path d="m20 20-3.5-3.5"/></>,
    filter: <><path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    bolt: <><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></>,
    brain: <><path d="M8 6a3 3 0 0 1 4-2 3 3 0 0 1 4 2 3 3 0 0 1 2 5 3 3 0 0 1-1 5 3 3 0 0 1-5 2 3 3 0 0 1-5-2 3 3 0 0 1-1-5 3 3 0 0 1 2-5Z"/><path d="M12 4v16"/></>,
    message: <><path d="M4 5h16v11H8l-4 4V5Z"/></>,
    swipe: <><path d="M6 12h12"/><path d="m14 8 4 4-4 4"/><path d="m10 16-4-4 4-4"/></>,
    clipboard: <><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 4h6v3H9z"/></>,
    palette: <><path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-1 1-2-.4-.9.1-2 1.5-2H17a3 3 0 0 0 3-3c0-5-3.5-9-8-9Z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/></>,
    timer: <><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/></>,
    trend: <><path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/></>,
    spark: <><path d="M3 12c6 0 6-6 12-6s6 6 6 6-0 6-6 6-6-6-12-6Z"/></>,
  };
  return <svg {...s}>{paths[name] || null}</svg>;
}

function Badge({ tone='ink', children, className='' }) {
  const tones = {
    ink: 'bg-ink/5 text-ink border-ink/10',
    sage: 'bg-sage-50 text-sage-600 border-sage/30',
    clay: 'bg-clay-50 text-clay-600 border-clay/30',
    taupe: 'bg-taupe-100 text-ink-700 border-taupe-300',
    live: 'bg-sage-50 text-sage-600 border-sage/30',
    draft: 'bg-taupe-100 text-ink/60 border-taupe-300',
    paused: 'bg-clay-50 text-clay-600 border-clay/30',
  };
  return <span className={cx('inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border', tones[tone] || tones.ink, className)}>{children}</span>;
}

function StatusDot({ status }) {
  const map = { Live: 'bg-sage-600', Paused: 'bg-clay', Draft: 'bg-taupe-500' };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cx('w-1.5 h-1.5 rounded-full', map[status] || 'bg-ink-300', status==='Live' && 'pulse-dot')}/>
      <span className="text-[11px] tracking-wide text-ink-500 uppercase mono">{status}</span>
    </span>
  );
}

function Button({ variant='primary', className='', children, ...p }) {
  const v = {
    primary: 'bg-ink text-cream hover:bg-ink-700',
    secondary: 'bg-cream-50 text-ink border border-taupe-300 hover:bg-taupe-100',
    ghost: 'text-ink hover:bg-taupe-100',
    sage: 'bg-sage-600 text-cream hover:bg-sage',
    clay: 'bg-clay text-cream hover:bg-clay-600',
  };
  return (
    <button {...p} className={cx('inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all active:scale-[0.98]', v[variant], className)}>
      {children}
    </button>
  );
}

function Card({ className='', children, ...p }) {
  return <div {...p} className={cx('bg-cream-50 border border-taupe-300 rounded-2xl shadow-soft', className)}>{children}</div>;
}

function Progress({ value=0, tone='sage' }) {
  const c = tone==='clay' ? 'bg-clay' : tone==='ink' ? 'bg-ink' : 'bg-sage-600';
  return (
    <div className="w-full h-1.5 bg-taupe-100 rounded-full overflow-hidden">
      <div className={cx('h-full rounded-full transition-all duration-500', c)} style={{ width: `${Math.max(0,Math.min(100,value))}%` }} />
    </div>
  );
}

function MiniBar({ value, max=100, tone='sage' }) {
  const pct = (value/max)*100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-taupe-100 rounded-full overflow-hidden">
        <div className={cx('h-full rounded-full', tone==='clay'?'bg-clay':'bg-sage-600')} style={{ width: `${pct}%` }}/>
      </div>
      <span className="mono text-[11px] text-ink-500 w-8 text-right">{value}</span>
    </div>
  );
}

// Segmented Control
function Segmented({ options, value, onChange, className='' }) {
  return (
    <div className={cx('inline-flex p-1 bg-taupe-100 rounded-full border border-taupe-300', className)}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} className={cx('px-3.5 py-1.5 text-[12px] font-medium rounded-full transition-all', value===o.value ? 'bg-cream-50 text-ink shadow-soft' : 'text-ink-500 hover:text-ink')}>{o.label}</button>
      ))}
    </div>
  );
}

function Toggle({ on, onChange, size='md' }) {
  const w = size==='sm'?'w-8 h-[18px]':'w-10 h-[22px]';
  const d = size==='sm'?'w-3.5 h-3.5':'w-4 h-4';
  return (
    <button type="button" onClick={() => onChange(!on)} className={cx('relative rounded-full transition-colors', w, on ? 'bg-sage-600' : 'bg-taupe-300')}>
      <span className={cx('absolute top-1/2 -translate-y-1/2 bg-cream-50 rounded-full shadow-soft transition-all', d)} style={{ left: on ? 'calc(100% - 18px)' : '2px' }}/>
    </button>
  );
}

// Modal
function Modal({ open, onClose, children, className='' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow=''; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose}/>
      <div className={cx('relative bg-cream-50 rounded-3xl shadow-lift border border-taupe-300 max-h-[92vh] overflow-hidden', className)}>
        {children}
      </div>
    </div>
  );
}

// Phone frame for variants
function PhoneFrame({ children, tone='cream', className='' }) {
  return (
    <div className={cx('mx-auto', className)}>
      <div className="relative w-[360px] h-[720px] rounded-[44px] bg-ink p-2 shadow-lift">
        <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-24 h-5 bg-ink rounded-b-xl z-10"/>
        <div className={cx('w-full h-full rounded-[36px] overflow-hidden relative', tone==='cream' ? 'bg-cream' : 'bg-cream-50')}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Animated count-up
function useCountUp(target, duration=900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf; const start = performance.now();
    const step = t => {
      const p = Math.min(1, (t-start)/duration);
      const e = 1 - Math.pow(1-p, 3);
      setV(Math.round(target*e));
      if (p<1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

// Section header
function SectionHead({ eyebrow, title, sub, right }) {
  return (
    <div className="flex items-end justify-between gap-6 mb-6">
      <div>
        {eyebrow && <div className="mono text-[11px] uppercase tracking-[0.18em] text-ink-500 mb-1.5">{eyebrow}</div>}
        <h2 className="serif text-[40px] leading-[1.05] text-ink">{title}</h2>
        {sub && <p className="mt-2 text-ink-500 max-w-[58ch]">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

Object.assign(window, {
  cx, Icon, Badge, StatusDot, Button, Card, Progress, MiniBar,
  Segmented, Toggle, Modal, PhoneFrame, useCountUp, SectionHead,
});
