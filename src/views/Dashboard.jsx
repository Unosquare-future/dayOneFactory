// Factory / overview dashboard — headline KPIs, traffic allocator,
// variant cards, routing panel, and floor activity feed.

import React from 'react';
import {
  Badge,
  Button,
  Card,
  Eyebrow,
  Icon,
  SectionHead,
  StatusDot,
  cx,
} from '../ui.jsx';
import { useFactory } from '../state.jsx';
import { stockTotals } from '../inventory.js';

function Metric({ label, value, tone }) {
  const c =
    tone === 'teal'
      ? 'text-teal-500'
      : tone === 'lime'
        ? 'text-lime-700'
        : 'text-navy';
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <div className={cx('text-[1.0625rem] font-bold mt-1 tabular-nums', c)}>
        {value}
      </div>
    </div>
  );
}

function VariantCard({ v, onOpen }) {
  return (
    <Card
      className="group overflow-hidden cursor-pointer transition-colors hover:border-navy"
      onClick={onOpen}
    >
      <div className={cx('relative h-40 ph-tex', v.thumb)}>
        <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent" />
        <div className="absolute top-3 left-3">
          <StatusDot status={v.status} />
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded bg-surface-lowest border border-outline-variant">
          <span className="text-[11px] font-bold text-navy tabular-nums">
            {v.traffic}%
          </span>
          <span className="text-[10px] text-ink-soft uppercase tracking-[0.08em]">
            traffic
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="type-eyebrow text-white/90">{v.kind}</span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="type-headline-md text-navy leading-tight">{v.name}</h3>
          <Icon name="chev" className="text-outline group-hover:text-navy transition-colors" />
        </div>
        <p className="type-body-md text-ink-soft mt-2 leading-relaxed">
          {v.tagline}
        </p>
        <div className="mt-5 pt-5 border-t border-outline-variant grid grid-cols-2 gap-x-5 gap-y-3">
          <Metric label="completion" value={`${v.metrics.completion}%`} tone="teal" />
          <Metric label="avg time" value={v.metrics.avgTime} />
          <Metric
            label="signal density"
            value={`${v.metrics.signalDensity}`}
            tone="teal"
          />
          <Metric label="first-fix keep" value={`${v.metrics.firstFix}%`} tone="lime" />
        </div>
      </div>
    </Card>
  );
}

function TrafficAllocator({ variants }) {
  const total = variants.reduce((s, v) => s + v.traffic, 0);
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <Eyebrow>Live traffic split</Eyebrow>
          <div className="type-headline-md text-navy mt-2">
            Allocation, right now
          </div>
        </div>
        <Badge tone="teal">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 pulse-dot" />
          {total}% routed
        </Badge>
      </div>
      <div className="flex h-10 rounded overflow-hidden border border-outline-variant">
        {variants.map((v) => (
          <div
            key={v.id}
            className={cx('relative group', v.thumb)}
            style={{ width: `${(v.traffic / total) * 100}%` }}
          >
            <div className="absolute inset-0 ph-tex opacity-90" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] font-bold text-white tabular-nums">
                {v.traffic}%
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-3">
        {variants.map((v) => (
          <div key={v.id} className="flex items-center gap-2">
            <span className={cx('w-2.5 h-2.5 rounded-sm', v.thumb)} />
            <span className="text-[11px] text-ink-soft truncate">{v.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RulesSummaryCard({ rules, onOpenRules }) {
  const activeRules = rules.filter((r) => r.status === 'on');
  const topThree = activeRules
    .slice()
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);
  return (
    <Card className="p-6 flex flex-col">
      <div className="flex items-start justify-between mb-5">
        <div>
          <Eyebrow>Routing logic</Eyebrow>
          <div className="type-headline-md text-navy mt-2">
            How the agent decides
          </div>
          <p className="type-body-md text-ink-soft mt-2 max-w-[36ch]">
            {activeRules.length} of {rules.length} rules are live. Author,
            tune, or retire them in the Rules engine.
          </p>
        </div>
        <Badge tone="teal">{activeRules.length} active</Badge>
      </div>
      <div className="space-y-3 flex-1">
        {topThree.map((r) => (
          <div
            key={r.id}
            className="p-3 rounded border border-outline-variant bg-surface"
          >
            <div className="flex items-start gap-3">
              <span className="text-[10px] text-ink-soft font-bold uppercase tracking-[0.12em] tabular-nums pt-0.5">
                {r.id}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-navy leading-snug">{r.when}</div>
                <div className="text-[12.5px] text-teal-500 font-semibold leading-snug mt-1">
                  → {r.then.replace(/^Route to /, '')}
                </div>
              </div>
              <span className="text-[12px] text-navy font-bold tabular-nums">
                {r.weight.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-5 border-t border-outline-variant">
        <Button variant="secondary" className="w-full justify-center" onClick={onOpenRules}>
          <Icon name="route" /> Open Rules engine
        </Button>
      </div>
    </Card>
  );
}

function Kpi({ eyebrow, value, delta, tone = 'teal' }) {
  const c =
    tone === 'teal'
      ? 'text-teal-500'
      : tone === 'lime'
        ? 'text-lime-700'
        : 'text-ink-soft';
  return (
    <Card className="p-5">
      <Eyebrow>{eyebrow}</Eyebrow>
      <div className="flex items-baseline gap-3 mt-3">
        <div className="text-[2.25rem] font-bold text-navy leading-none tracking-tight tabular-nums">
          {value}
        </div>
        <div className={cx('text-[11px] font-bold uppercase tracking-[0.08em]', c)}>
          {delta}
        </div>
      </div>
    </Card>
  );
}

function RecentActivity() {
  const items = [
    { when: '2m', who: 'Agent', what: 'Switched Jordan mid-flow, Swipe → Builder, engagement rose +0.42' },
    { when: '14m', who: 'Nora (Growth)', what: 'Paused Outfit Builder rule r5 pending review' },
    {
      when: '31m',
      who: 'Agent',
      what: 'Detected 18 "don’t know my style" queries → lifted Chat to 22%',
    },
    { when: '1h', who: 'Ben (Product)', what: 'Published Classic (Refined) v3.2 — 5 fewer questions' },
    { when: '3h', who: 'Agent', what: 'Winback cohort +11% completion on Taste Transfer' },
  ];
  return (
    <Card className="p-6">
      <div className="mb-5">
        <Eyebrow>Floor activity</Eyebrow>
        <div className="type-headline-md text-navy mt-2">
          What’s happening right now
        </div>
      </div>
      <ul className="space-y-4">
        {items.map((it, i) => (
          <li key={i} className="flex gap-4 items-start">
            <div className="text-[11px] text-ink-soft w-8 flex-shrink-0 pt-1 font-bold tabular-nums uppercase tracking-wider">
              {it.when}
            </div>
            <div className="flex-1">
              <div>
                <span
                  className={cx(
                    'text-[10px] uppercase tracking-[0.12em] font-bold',
                    it.who === 'Agent' ? 'text-teal-500' : 'text-navy',
                  )}
                >
                  {it.who}
                </span>
              </div>
              <div className="type-body-md text-navy leading-snug mt-1">
                {it.what}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function Dashboard({ onOpenVariant, onOpenRules, onOpenInventory }) {
  const { variants, rules, inventory } = useFactory();
  const avgCompletion = Math.round(
    variants.reduce((s, v) => s + v.metrics.completion, 0) / variants.length,
  );
  const avgFirstFix = Math.round(
    variants.reduce((s, v) => s + v.metrics.firstFix, 0) / variants.length,
  );
  const inv = stockTotals(inventory);

  return (
    <div className="px-6 md:px-10 py-12 max-w-[1400px] mx-auto">
      <SectionHead
        eyebrow="Factory / overview"
        title="Six flows, one style graph."
        sub="Each variant is a door into the same house. The agent decides which door opens."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Kpi eyebrow="Sessions last 24h" value="12,483" delta="+6.4%" tone="teal" />
        <Kpi eyebrow="Avg completion" value={`${avgCompletion}%`} delta="+12.1%" tone="teal" />
        <Kpi eyebrow="First-Fix keep rate" value={`${avgFirstFix}%`} delta="+3.8%" tone="teal" />
        <button
          onClick={onOpenInventory}
          className="text-left bg-surface-lowest border border-outline-variant rounded-lg p-5 hover:border-navy transition-colors group"
        >
          <div className="flex items-center justify-between">
            <Eyebrow>Inventory</Eyebrow>
            <Icon name="chev" className="text-outline group-hover:text-navy transition-colors" />
          </div>
          <div className="flex items-baseline gap-3 mt-3">
            <div className="text-[2.25rem] font-bold text-navy leading-none tracking-tight tabular-nums">
              {inv.total}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-teal-500">
              {inv.inStock} in stock
            </div>
          </div>
        </button>
      </div>

      <div className="mb-6">
        <TrafficAllocator variants={variants} />
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-5">
        {variants.map((v) => (
          <VariantCard key={v.id} v={v} onOpen={() => onOpenVariant(v.id)} />
        ))}
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-5">
        <RulesSummaryCard rules={rules} onOpenRules={onOpenRules} />
        <RecentActivity />
      </div>

      <div className="mt-16 pt-8 border-t border-outline-variant text-[11px] text-ink-soft font-bold uppercase tracking-[0.12em] flex items-center justify-between">
        <span>Dayone / Factory / v1.4</span>
        <span>Synced · 12s ago</span>
      </div>
    </div>
  );
}
