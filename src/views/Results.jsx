// 90-day results — editorial hero banner, performance table,
// completion/signal frontier chart, and a written summary from the agent.

import React from 'react';
import {
  Badge,
  Card,
  Eyebrow,
  Icon,
  MiniBar,
  SectionHead,
  Segmented,
  cx,
  useState,
} from '../ui.jsx';
import { useFactory } from '../state.jsx';

function QuickStat({ k, v, d }) {
  return (
    <div>
      <div className="type-eyebrow text-navy/70">{k}</div>
      <div className="text-[1.5rem] text-navy leading-none mt-2 font-bold tabular-nums">
        {v}
      </div>
      <div className="type-eyebrow text-navy/60 mt-2">{d}</div>
    </div>
  );
}

function LearningCard({ eyebrow, title, body }) {
  return (
    <Card className="p-6">
      <Eyebrow className="text-lime-700">{eyebrow}</Eyebrow>
      <h3 className="type-headline-md text-navy leading-tight mt-2">{title}</h3>
      <p className="type-body-md text-ink-soft mt-3 leading-relaxed">{body}</p>
    </Card>
  );
}

function FrontierChart({ variants, results }) {
  const pts = results.map((r) => {
    const v = variants.find((x) => x.id === r.id);
    return { ...r, thumb: v?.thumb || 'ph-5' };
  });
  const W = 480,
    H = 220,
    P = 32;
  const xScale = (c) => P + ((c - 40) / (100 - 40)) * (W - 2 * P);
  const yScale = (s) => H - P - ((s - 60) / (100 - 60)) * (H - 2 * P);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="#BFC9C5" />
      <line x1={P} y1={P} x2={P} y2={H - P} stroke="#BFC9C5" />
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line
          key={i}
          x1={P}
          x2={W - P}
          y1={P + t * (H - 2 * P)}
          y2={P + t * (H - 2 * P)}
          stroke="#E8E8E8"
        />
      ))}
      <text x={P} y={H - 8} fontFamily="Epilogue" fontSize="9" fill="#6F7976" fontWeight="700" letterSpacing="0.08em">
        40%
      </text>
      <text x={W - P - 20} y={H - 8} fontFamily="Epilogue" fontSize="9" fill="#6F7976" fontWeight="700" letterSpacing="0.08em">
        100%
      </text>
      <text x={8} y={H - P} fontFamily="Epilogue" fontSize="9" fill="#6F7976" fontWeight="700" letterSpacing="0.08em">
        60
      </text>
      <text x={8} y={P + 6} fontFamily="Epilogue" fontSize="9" fill="#6F7976" fontWeight="700" letterSpacing="0.08em">
        100
      </text>
      <text
        x={W / 2}
        y={H - 8}
        fontFamily="Epilogue"
        fontSize="9"
        fill="#3F4946"
        textAnchor="middle"
        fontWeight="700"
        letterSpacing="0.08em"
      >
        COMPLETION %
      </text>
      <text x={14} y={P - 10} fontFamily="Epilogue" fontSize="9" fill="#3F4946" fontWeight="700" letterSpacing="0.08em">
        SIGNAL DENSITY
      </text>
      {pts.map((p) => (
        <g key={p.id}>
          <circle
            cx={xScale(p.completion)}
            cy={yScale(p.signal)}
            r={9 + p.firstFix / 10}
            fill="#86C8BC"
            opacity="0.3"
          />
          <circle cx={xScale(p.completion)} cy={yScale(p.signal)} r="4" fill="#001E60" />
          <text
            x={xScale(p.completion) + 8}
            y={yScale(p.signal) + 3}
            fontFamily="Epilogue"
            fontSize="11"
            fill="#001E60"
            fontWeight="600"
          >
            {p.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function ResultsView() {
  const { variants } = useFactory();
  // Derive result summaries from current variants (live + draft).
  const results = variants.map((v) => ({
    id: v.id,
    name: v.name,
    completion: v.metrics.completion,
    time: v.metrics.avgTime,
    signal: v.metrics.signalDensity,
    firstFix: v.metrics.firstFix,
    ltv:
      180 +
      Math.round(v.metrics.signalDensity * 2.4 + v.metrics.firstFix * 1.1),
  }));
  const measured = results.filter((r) => r.completion > 0);
  const [sortBy, setSortBy] = useState('firstFix');
  const sorted = [...measured].sort((a, b) => b[sortBy] - a[sortBy]);
  const totalCompletion =
    measured.length === 0
      ? 0
      : Math.round(
          measured.reduce((s, r) => s + r.completion, 0) / measured.length,
        );
  const lift = 34;
  const bestLtv = measured.length === 0 ? 0 : Math.max(...measured.map((r) => r.ltv));
  const worstLtv = measured.length === 0 ? 0 : Math.min(...measured.map((r) => r.ltv));

  return (
    <div className="px-6 md:px-10 py-12 max-w-[1400px] mx-auto">
      <SectionHead
        eyebrow="Results / 90-day window"
        title="What we learned."
        sub="A written summary from the agent, plus the numbers that back it up. Read it the way you’d read a field report."
      />

      {/* Key banner — Primary Teal background, Navy type (per spec) */}
      <div className="relative overflow-hidden rounded-none border border-teal bg-teal text-navy mb-8">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full ph-10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full ph-8 blur-3xl" />
        </div>
        <div className="relative p-8 md:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-end">
          <div>
            <Eyebrow className="text-navy/70">Headline</Eyebrow>
            <h2 className="type-display-lg text-navy mt-3 leading-[0.95]">
              Routing by behavior lifted
              <br />
              onboarding conversion by{' '}
              <span className="text-navy relative">+{lift}%</span>
              <br />
              <span className="italic font-semibold text-navy/85">
                over single-flow baseline.
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-1 gap-5 min-w-[200px]">
            <QuickStat k="Avg completion" v={`${totalCompletion}%`} d="+12 pts" />
            <QuickStat k="90d LTV range" v={`$${worstLtv}–$${bestLtv}`} d="widened" />
            <QuickStat k="Signal density" v="84/100" d="+29 pts" />
          </div>
        </div>
      </div>

      {/* Results table */}
      <Card className="p-0 overflow-hidden mb-8">
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
          <div>
            <Eyebrow>Performance by variant</Eyebrow>
            <div className="type-headline-md text-navy mt-2">
              The six flows, measured
            </div>
          </div>
          <Segmented
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'completion', label: 'Completion' },
              { value: 'signal', label: 'Signal' },
              { value: 'firstFix', label: 'First-Fix' },
              { value: 'ltv', label: 'LTV' },
            ]}
          />
        </div>
        <div className="divide-y divide-outline-variant">
          <div className="grid grid-cols-[minmax(0,2fr)_100px_100px_1fr_100px_100px] gap-4 px-6 py-3 type-eyebrow text-ink-soft">
            <div>Variant</div>
            <div className="text-right">Completion</div>
            <div className="text-right">Time</div>
            <div>Signal density</div>
            <div className="text-right">First-Fix</div>
            <div className="text-right">90d LTV</div>
          </div>
          {sorted.map((r, i) => {
            const v = variants.find((x) => x.id === r.id);
            const best = i === 0;
            return (
              <div
                key={r.id}
                className={cx(
                  'grid grid-cols-[minmax(0,2fr)_100px_100px_1fr_100px_100px] gap-4 px-6 py-4 items-center transition-colors',
                  best ? 'bg-teal/10' : 'hover:bg-surface-low',
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cx('w-10 h-12 rounded-sm ph-tex flex-shrink-0', v.thumb)} />
                  <div className="min-w-0">
                    <div className="text-[14px] text-navy font-semibold truncate flex items-center gap-2">
                      {r.name} {best && <Badge tone="teal">best</Badge>}
                    </div>
                    <div className="type-eyebrow text-ink-soft mt-1">{v.kind}</div>
                  </div>
                </div>
                <div className="text-[13px] text-navy text-right font-bold tabular-nums">
                  {r.completion}%
                </div>
                <div className="text-[13px] text-ink-soft text-right tabular-nums">
                  {r.time}
                </div>
                <div>
                  <MiniBar value={r.signal} max={100} />
                </div>
                <div className="text-[13px] text-navy text-right font-bold tabular-nums">
                  {r.firstFix}%
                </div>
                <div className="text-[13px] text-navy text-right font-bold tabular-nums">
                  ${r.ltv}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid md:grid-cols-[1.1fr_1fr] gap-6 mb-8">
        <Card className="p-6">
          <Eyebrow>Completion vs. signal density</Eyebrow>
          <div className="type-headline-md text-navy mt-2 mb-4">The frontier</div>
          <FrontierChart variants={variants} results={measured} />
          <div className="text-[13px] text-ink-soft leading-relaxed mt-4">
            Top-right is where a variant earns its keep: high completion{' '}
            <em>and</em> deep signal. The router’s job is getting each visitor to their own top-right.
          </div>
        </Card>

        <Card className="p-8 bg-teal border-teal">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded bg-navy text-white flex items-center justify-center">
              <Icon name="sparkle" size={14} />
            </div>
            <Eyebrow className="text-navy/80">Written by the agent</Eyebrow>
          </div>
          <h3 className="type-headline-md text-navy leading-tight mb-4">
            What I’d tell a new stylist.
          </h3>
          <div className="space-y-4 type-body-md text-navy leading-relaxed">
            <p>
              Three of the six variants outperform the old single quiz on first-Fix keep. Two underperform on completion but out-earn the rest on 90-day value — because the visitors who finish them really want to be here.
            </p>
            <p>
              The gift wasn’t one winning flow. The gift was matching. When I route a mobile social-ad visitor into Swipe and a returning lapsed client into Taste Transfer, the whole system lifts.
            </p>
            <p>
              If we want one next experiment: let me switch modalities mid-flow for visitors whose engagement dips past the 4-card mark. Early results suggest{' '}
              <span className="font-bold">+18%</span> completion recovery.
            </p>
          </div>
          <div className="mt-5 pt-5 border-t border-navy/25 type-eyebrow text-navy/70">
            — DayOne Router, week 12
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <LearningCard
          eyebrow="Learning 01"
          title="Self-description is a trap."
          body="48% of visitors can’t describe their style. The variants that don’t ask them to — Swipe, Chat, Taste Transfer — out-convert the ones that do."
        />
        <LearningCard
          eyebrow="Learning 02"
          title="Effort earns signal."
          body="Builder has the lowest completion (41%) and the highest signal density (98/100). Don’t kill it. Route to it."
        />
        <LearningCard
          eyebrow="Learning 03"
          title="Returning clients deserve the shortcut."
          body="Taste Transfer for lapsed clients produced a 49% first-Fix keep — the best of any winback flow we’ve run in two years."
        />
      </div>

      <div className="mt-16 pt-8 border-t border-outline-variant text-[11px] text-ink-soft font-bold uppercase tracking-[0.12em] flex items-center justify-between">
        <span>Dayone / Results / 90-day</span>
        <span>Cohort: 41,228 visitors · 12 weeks</span>
      </div>
    </div>
  );
}
