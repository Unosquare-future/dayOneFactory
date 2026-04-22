// View 4: Results & Learnings

function ResultsView() {
  const [sortBy, setSortBy] = useState('firstFix');
  const sorted = [...RESULTS_BY_VARIANT].sort((a,b) => b[sortBy] - a[sortBy]);
  const totalCompletion = Math.round(RESULTS_BY_VARIANT.reduce((s,r)=>s+r.completion,0)/RESULTS_BY_VARIANT.length);
  const lift = 34;
  const bestLtv = Math.max(...RESULTS_BY_VARIANT.map(r=>r.ltv));
  const worstLtv = Math.min(...RESULTS_BY_VARIANT.map(r=>r.ltv));

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
      <SectionHead
        eyebrow="Results / 90-day window"
        title="What we learned."
        sub="A written summary from the agent, plus the numbers that back it up. Read it the way you’d read a field report."
      />

      {/* Hero insight */}
      <div className="relative overflow-hidden rounded-4xl border border-taupe-300 bg-ink text-cream-50 mb-6">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full ph-4 blur-3xl"/>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full ph-8 blur-3xl"/>
        </div>
        <div className="relative p-8 md:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-end">
          <div>
            <div className="mono text-[11px] uppercase tracking-[0.18em] text-cream-50/60">Headline</div>
            <h2 className="serif text-[56px] md:text-[72px] leading-[0.95] mt-2">
              Routing by behavior lifted<br/>
              onboarding conversion by <span className="text-sage-200">+{lift}%</span><br/>
              <span className="italic text-cream-50/90">over single-flow baseline.</span>
            </h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-1 gap-4 min-w-[200px]">
            <QuickStat k="Avg completion" v={`${totalCompletion}%`} d="+12 pts"/>
            <QuickStat k="90d LTV range" v={`$${worstLtv}–$${bestLtv}`} d="widened"/>
            <QuickStat k="Signal density" v="84/100" d="+29 pts"/>
          </div>
        </div>
      </div>

      {/* Results table */}
      <Card className="p-0 overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-taupe-300">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500">Performance by variant</div>
            <div className="serif text-[22px] text-ink mt-0.5">The six flows, measured</div>
          </div>
          <Segmented value={sortBy} onChange={setSortBy} options={[
            {value:'completion',label:'Completion'},
            {value:'signal',label:'Signal'},
            {value:'firstFix',label:'First-Fix'},
            {value:'ltv',label:'LTV'},
          ]}/>
        </div>
        <div className="divide-y divide-taupe-300">
          <div className="grid grid-cols-[minmax(0,2fr)_100px_100px_1fr_100px_100px] gap-4 px-6 py-2.5 mono text-[10px] uppercase tracking-wider text-ink-500">
            <div>Variant</div>
            <div className="text-right">Completion</div>
            <div className="text-right">Time</div>
            <div>Signal density</div>
            <div className="text-right">First-Fix</div>
            <div className="text-right">90d LTV</div>
          </div>
          {sorted.map((r,i) => {
            const v = VARIANTS.find(x => x.id===r.id);
            const best = i===0;
            return (
              <div key={r.id} className={cx('grid grid-cols-[minmax(0,2fr)_100px_100px_1fr_100px_100px] gap-4 px-6 py-4 items-center transition-colors', best ? 'bg-sage-50' : 'hover:bg-taupe-100/50')}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cx('w-10 h-12 rounded-md ph-tex flex-shrink-0', v.thumb)}/>
                  <div className="min-w-0">
                    <div className="text-[14px] text-ink truncate flex items-center gap-2">{r.name} {best && <Badge tone="sage">best</Badge>}</div>
                    <div className="mono text-[10px] uppercase tracking-wider text-ink-500">{v.kind}</div>
                  </div>
                </div>
                <div className="mono text-[13px] text-ink text-right">{r.completion}%</div>
                <div className="mono text-[13px] text-ink-500 text-right">{r.time}</div>
                <div><MiniBar value={r.signal} max={100}/></div>
                <div className="mono text-[13px] text-ink text-right">{r.firstFix}%</div>
                <div className="mono text-[13px] text-ink text-right">${r.ltv}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Two-col: chart + written summary */}
      <div className="grid md:grid-cols-[1.1fr_1fr] gap-5 mb-6">
        <Card className="p-5">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">Completion vs. signal density</div>
          <div className="serif text-[22px] text-ink mb-3">The frontier</div>
          <FrontierChart/>
          <div className="text-[12px] text-ink-500 leading-relaxed mt-3">Top-right is where a variant earns its keep: high completion <em>and</em> deep signal. The router’s job is getting each visitor to their own top-right.</div>
        </Card>

        <Card className="p-5 bg-sage-50 border-sage/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-sage-600 text-cream-50 flex items-center justify-center"><Icon name="sparkle" size={14}/></div>
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-sage-600">Written by the agent</div>
          </div>
          <h3 className="serif text-[28px] text-ink leading-[1.1] mb-3">What I’d tell a new stylist.</h3>
          <div className="space-y-3 text-[13.5px] text-ink leading-relaxed">
            <p>Three of the six variants outperform the old single quiz on first-Fix keep. Two underperform on completion but out-earn the rest on 90-day value — because the visitors who finish them really want to be here.</p>
            <p>The gift wasn’t one winning flow. The gift was matching. When I route a mobile social-ad visitor into Swipe and a returning lapsed client into Taste Transfer, the whole system lifts.</p>
            <p>If we want one next experiment: let me switch modalities mid-flow for visitors whose engagement dips past the 4-card mark. Early results suggest <span className="mono text-sage-600">+18%</span> completion recovery.</p>
          </div>
          <div className="mt-4 pt-4 border-t border-sage/30 mono text-[10px] uppercase tracking-widest text-ink-500">— DayOne Router, week 12</div>
        </Card>
      </div>

      {/* What we learned bullets */}
      <div className="grid md:grid-cols-3 gap-3">
        <LearningCard eyebrow="Learning 01" title="Self-description is a trap." body="48% of visitors can’t describe their style. The variants that don’t ask them to — Swipe, Chat, Taste Transfer — out-convert the ones that do."/>
        <LearningCard eyebrow="Learning 02" title="Effort earns signal." body="Builder has the lowest completion (41%) and the highest signal density (98/100). Don’t kill it. Route to it."/>
        <LearningCard eyebrow="Learning 03" title="Returning clients deserve the shortcut." body="Taste Transfer for lapsed clients produced a 49% first-Fix keep — the best of any winback flow we’ve run in two years."/>
      </div>

      <div className="mt-10 pt-8 border-t border-taupe-300 text-[12px] text-ink-500 mono flex items-center justify-between">
        <span>DAYONE / RESULTS / 90-DAY</span>
        <span>COHORT: 41,228 VISITORS &middot; 12 WEEKS</span>
      </div>
    </div>
  );
}

function QuickStat({ k, v, d }) {
  return (
    <div>
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-cream-50/60">{k}</div>
      <div className="serif text-[26px] text-cream-50 leading-none mt-1">{v}</div>
      <div className="mono text-[10px] text-sage-200 mt-1">{d}</div>
    </div>
  );
}

function LearningCard({ eyebrow, title, body }) {
  return (
    <Card className="p-5">
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-clay-600">{eyebrow}</div>
      <h3 className="serif text-[24px] text-ink leading-tight mt-1">{title}</h3>
      <p className="text-[13px] text-ink-500 mt-2 leading-relaxed">{body}</p>
    </Card>
  );
}

function FrontierChart() {
  // x = completion, y = signal density
  const pts = RESULTS_BY_VARIANT.map(r => {
    const v = VARIANTS.find(x => x.id===r.id);
    return { ...r, thumb: v.thumb };
  });
  const W=480, H=220, P=32;
  const xScale = c => P + ((c-40)/(100-40))*(W-2*P);
  const yScale = s => (H-P) - ((s-60)/(100-60))*(H-2*P);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* axes */}
      <line x1={P} y1={H-P} x2={W-P} y2={H-P} stroke="#E6DCC8"/>
      <line x1={P} y1={P} x2={P} y2={H-P} stroke="#E6DCC8"/>
      {/* grid */}
      {[0,0.25,0.5,0.75,1].map((t,i) => (
        <line key={i} x1={P} x2={W-P} y1={P + t*(H-2*P)} y2={P + t*(H-2*P)} stroke="#F1E9D9"/>
      ))}
      {/* labels */}
      <text x={P} y={H-8} fontFamily="JetBrains Mono" fontSize="9" fill="#8D97B1">40%</text>
      <text x={W-P-20} y={H-8} fontFamily="JetBrains Mono" fontSize="9" fill="#8D97B1">100%</text>
      <text x={8} y={H-P} fontFamily="JetBrains Mono" fontSize="9" fill="#8D97B1">60</text>
      <text x={8} y={P+6} fontFamily="JetBrains Mono" fontSize="9" fill="#8D97B1">100</text>
      <text x={W/2} y={H-8} fontFamily="JetBrains Mono" fontSize="9" fill="#5A6684" textAnchor="middle">COMPLETION %</text>
      <text x={14} y={P-10} fontFamily="JetBrains Mono" fontSize="9" fill="#5A6684">SIGNAL DENSITY</text>
      {/* points */}
      {pts.map(p => (
        <g key={p.id}>
          <circle cx={xScale(p.completion)} cy={yScale(p.signal)} r={9 + p.firstFix/10} fill="#7A9A82" opacity="0.18"/>
          <circle cx={xScale(p.completion)} cy={yScale(p.signal)} r="4" fill="#14213D"/>
          <text x={xScale(p.completion)+8} y={yScale(p.signal)+3} fontFamily="DM Sans" fontSize="11" fill="#14213D">{p.name}</text>
        </g>
      ))}
    </svg>
  );
}

Object.assign(window, { ResultsView });
