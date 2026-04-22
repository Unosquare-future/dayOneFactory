// View 1: Factory Dashboard

function VariantCard({ v, onOpen }) {
  return (
    <Card className="group overflow-hidden hover:shadow-lift transition-shadow cursor-pointer" onClick={onOpen}>
      <div className={cx('relative h-36 ph-tex', v.thumb)}>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent"/>
        <div className="absolute top-3 left-3"><StatusDot status={v.status}/></div>
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-cream-50/90 backdrop-blur border border-taupe-300">
          <span className="mono text-[11px] text-ink-700">{v.traffic}%</span>
          <span className="text-[10px] text-ink-500">traffic</span>
        </div>
        <div className="absolute bottom-3 left-3 text-cream-50">
          <div className="mono text-[10px] uppercase tracking-widest opacity-80">{v.kind}</div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="serif text-[26px] leading-tight text-ink">{v.name}</h3>
          <Icon name="chev" className="text-ink-300 group-hover:text-ink transition-colors"/>
        </div>
        <p className="text-[13px] text-ink-500 mt-1 leading-relaxed">{v.tagline}</p>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
          <Metric label="completion" value={`${v.metrics.completion}%`} tone="sage"/>
          <Metric label="avg time" value={v.metrics.avgTime}/>
          <Metric label="signal density" value={`${v.metrics.signalDensity}`} tone="sage"/>
          <Metric label="first-fix keep" value={`${v.metrics.firstFix}%`} tone="clay"/>
        </div>
      </div>
    </Card>
  );
}

function Metric({ label, value, tone }) {
  const c = tone==='sage'?'text-sage-600':tone==='clay'?'text-clay-600':'text-ink';
  return (
    <div>
      <div className="mono text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
      <div className={cx('mono text-[14px] font-medium mt-0.5', c)}>{value}</div>
    </div>
  );
}

function TrafficAllocator({ variants }) {
  const total = variants.reduce((s,v)=>s+v.traffic,0);
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.18em] text-ink-500">Live traffic split</div>
          <div className="serif text-[22px] text-ink mt-0.5">Allocation, right now</div>
        </div>
        <Badge tone="sage"><span className="w-1.5 h-1.5 rounded-full bg-sage-600 pulse-dot"/> {total}% routed</Badge>
      </div>
      <div className="flex h-10 rounded-xl overflow-hidden border border-taupe-300">
        {variants.map((v,i) => (
          <div key={v.id} className={cx('relative group', v.thumb)} style={{ width: `${(v.traffic/total)*100}%` }}>
            <div className="absolute inset-0 ph-tex opacity-90"/>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="mono text-[11px] text-cream-50 font-medium drop-shadow">{v.traffic}%</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-2">
        {variants.map(v => (
          <div key={v.id} className="flex items-center gap-2">
            <span className={cx('w-2.5 h-2.5 rounded-sm', v.thumb)}/>
            <span className="text-[11px] text-ink-500 truncate">{v.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RoutingPanel() {
  const [rules, setRules] = useState(ROUTING_RULES);
  function toggle(id) {
    setRules(rs => rs.map(r => r.id===id ? {...r, status: r.status==='on' ? 'draft' : 'on'} : r));
  }
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.18em] text-ink-500">Routing logic</div>
          <div className="serif text-[22px] text-ink mt-0.5">How the agent decides</div>
        </div>
        <Button variant="ghost"><Icon name="plus"/> New rule</Button>
      </div>
      <ul className="divide-y divide-taupe-300">
        {rules.map(r => (
          <li key={r.id} className="py-3 flex items-start gap-4">
            <div className="mt-0.5"><Toggle on={r.status==='on'} onChange={()=>toggle(r.id)} size="sm"/></div>
            <div className="flex-1 min-w-0">
              <div className="mono text-[11px] text-ink-500 uppercase tracking-wider">when</div>
              <div className="text-[13.5px] text-ink leading-snug">{r.when}</div>
              <div className="mono text-[11px] text-ink-500 uppercase tracking-wider mt-1.5">then</div>
              <div className="text-[13.5px] text-ink leading-snug">{r.then}</div>
            </div>
            <div className="text-right">
              <div className="mono text-[11px] text-ink-500 uppercase tracking-wider">weight</div>
              <div className="mono text-[14px] text-ink">{r.weight.toFixed(2)}</div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Dashboard({ onOpenVariant, onNewVariant }) {
  const totalSessions = 12483;
  const avgCompletion = Math.round(VARIANTS.reduce((s,v)=>s+v.metrics.completion,0)/VARIANTS.length);
  const avgFirstFix = Math.round(VARIANTS.reduce((s,v)=>s+v.metrics.firstFix,0)/VARIANTS.length);
  return (
    <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
      <SectionHead
        eyebrow="Factory / overview"
        title="Six flows, one style graph."
        sub="Each variant is a door into the same house. The agent decides which door opens."
        right={<Button onClick={onNewVariant}><Icon name="plus"/> New variant</Button>}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi eyebrow="Sessions last 24h" value="12,483" delta="+6.4%" tone="sage"/>
        <Kpi eyebrow="Avg completion" value={`${avgCompletion}%`} delta="+12.1%" tone="sage"/>
        <Kpi eyebrow="First-Fix keep rate" value={`${avgFirstFix}%`} delta="+3.8%" tone="sage"/>
        <Kpi eyebrow="Active variants" value="5 / 6" delta="1 in draft" tone="taupe"/>
      </div>

      <div className="mb-6"><TrafficAllocator variants={VARIANTS}/></div>

      <div className="grid md:grid-cols-3 gap-3 md:gap-4">
        {VARIANTS.map(v => <VariantCard key={v.id} v={v} onOpen={()=>onOpenVariant(v.id)}/>)}
      </div>

      <div className="mt-6 grid md:grid-cols-5 gap-4">
        <div className="md:col-span-3"><RoutingPanel/></div>
        <div className="md:col-span-2"><RecentActivity/></div>
      </div>

      <div className="mt-10 pt-8 border-t border-taupe-300 text-[12px] text-ink-500 mono flex items-center justify-between">
        <span>DAYONE / FACTORY / v1.4</span>
        <span>SYNCED &middot; 12s AGO</span>
      </div>
    </div>
  );
}

function Kpi({ eyebrow, value, delta, tone='sage' }) {
  const c = tone==='sage' ? 'text-sage-600' : tone==='clay' ? 'text-clay-600' : 'text-ink-500';
  return (
    <Card className="p-4">
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{eyebrow}</div>
      <div className="flex items-baseline gap-2 mt-1.5">
        <div className="serif text-[32px] text-ink leading-none">{value}</div>
        <div className={cx('mono text-[11px]', c)}>{delta}</div>
      </div>
    </Card>
  );
}

function RecentActivity() {
  const items = [
    { when: '2m', who: 'Agent', what: 'Switched Jordan mid-flow, Swipe → Builder, engagement rose +0.42' },
    { when: '14m', who: 'Nora (Growth)', what: 'Paused Outfit Builder rule r5 pending review' },
    { when: '31m', who: 'Agent', what: 'Detected 18 "don’t know my style" queries → lifted Chat to 22%' },
    { when: '1h', who: 'Ben (Product)', what: 'Published Classic (Refined) v3.2 — 5 fewer questions' },
    { when: '3h', who: 'Agent', what: 'Winback cohort +11% completion on Taste Transfer' },
  ];
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.18em] text-ink-500">Floor activity</div>
          <div className="serif text-[22px] text-ink mt-0.5">What’s happening right now</div>
        </div>
      </div>
      <ul className="space-y-3">
        {items.map((it,i) => (
          <li key={i} className="flex gap-3 items-start">
            <div className="mono text-[10px] text-ink-500 w-8 flex-shrink-0 pt-0.5">{it.when}</div>
            <div className="flex-1">
              <div className="text-[12px] text-ink-500">
                <span className={cx('mono text-[10px] uppercase tracking-wider mr-1.5', it.who==='Agent' ? 'text-sage-600' : 'text-ink')}>{it.who}</span>
              </div>
              <div className="text-[13.5px] text-ink leading-snug">{it.what}</div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

Object.assign(window, { Dashboard });
