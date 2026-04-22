// View 3: Agentic Router

function RouterView() {
  const [vid, setVid] = useState(VISITORS[0].id);
  const [stage, setStage] = useState(0); // 0=profile,1=analyzing,2=decision
  const [adaptOpen, setAdaptOpen] = useState(false);
  const v = VISITORS.find(x => x.id === vid);
  const variant = VARIANTS.find(x => x.id === v.recommend);

  useEffect(() => {
    setStage(0);
    const t1 = setTimeout(() => setStage(1), 400);
    const t2 = setTimeout(() => setStage(2), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [vid]);

  const confidence = useCountUp(stage>=2 ? v.confidence : 0, 900);

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
      <SectionHead
        eyebrow="Router / reasoning trace"
        title="One agent, six doors."
        sub="The router reads each visitor, considers signals, and picks the variant most likely to land. Watch it work."
        right={<Button variant="secondary" onClick={()=>setAdaptOpen(true)}><Icon name="bolt"/> See mid-flow adaptation</Button>}
      />

      {/* Visitor chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {VISITORS.map(x => (
          <button key={x.id} onClick={()=>setVid(x.id)} className={cx('flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full border transition-all', vid===x.id ? 'bg-ink text-cream-50 border-ink shadow-soft' : 'bg-cream-50 text-ink border-taupe-300 hover:border-ink-300')}>
            <span className={cx('w-7 h-7 rounded-full ph-tex', x.id==='maya'?'ph-8':x.id==='robert'?'ph-5':x.id==='priya'?'ph-10':x.id==='jordan'?'ph-9':'ph-4')}/>
            <span className="text-[13px]">{x.name}, {x.age}</span>
            <span className={cx('mono text-[10px] uppercase tracking-wider', vid===x.id ? 'text-cream-50/70':'text-ink-500')}>{x.device==='Mobile'?'mob':'dsk'}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[280px_1fr_280px] gap-5">
        {/* Visitor profile */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className={cx('w-14 h-14 rounded-full ph-tex shadow-soft', v.id==='maya'?'ph-8':v.id==='robert'?'ph-5':v.id==='priya'?'ph-10':v.id==='jordan'?'ph-9':'ph-4')}/>
            <div>
              <div className="serif text-[24px] leading-tight text-ink">{v.name}, {v.age}</div>
              <div className="mono text-[11px] text-ink-500 uppercase tracking-wider">{v.session}</div>
            </div>
          </div>
          <div className="space-y-2.5 text-[13px]">
            <Row k="channel" v={v.channel}/>
            <Row k="device" v={v.device}/>
            <Row k="session" v={v.session}/>
          </div>
          <div className="mt-5 pt-4 border-t border-taupe-300">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">Behavioral signals</div>
            <div className="flex flex-wrap gap-1.5">
              {v.signals.map(s => <Badge key={s} tone="taupe">{s}</Badge>)}
            </div>
          </div>
        </Card>

        {/* Reasoning trace */}
        <Card className="p-0 overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-taupe-300">
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500">Reasoning trace</div>
              <div className="serif text-[22px] text-ink mt-0.5">The agent, thinking out loud</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cx('w-2 h-2 rounded-full', stage<2 ? 'bg-clay pulse-dot' : 'bg-sage-600')}/>
              <span className="mono text-[11px] text-ink-500 uppercase tracking-wider">{stage<2 ? 'analyzing' : 'decided'}</span>
            </div>
          </div>

          <div className="p-5 space-y-4 min-h-[360px]">
            {/* Step 1: read signals */}
            <TraceStep n="01" t="Read" active={stage>=1} done={stage>=2}>
              <div className="text-[13px] text-ink">Observing {v.signals.length} signals from the session. Highest-weight: <span className="mono text-sage-600">{v.signals[0]}</span>.</div>
            </TraceStep>

            {/* Step 2: weigh */}
            <TraceStep n="02" t="Weigh" active={stage>=1} done={stage>=2}>
              <div className="space-y-2">
                {v.reasoning.map((r,i) => (
                  <div key={i} className="flex gap-2 items-start text-[13px] text-ink leading-snug">
                    <span className="mono text-[10px] text-ink-500 mt-1">&gt;</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </TraceStep>

            {/* Step 3: decision */}
            <TraceStep n="03" t="Route" active={stage>=2} done={stage>=2} last>
              {stage < 2 ? <div className="h-16 shimmer rounded-lg"/> : (
                <div className="bloom">
                  <div className={cx('relative rounded-2xl overflow-hidden border border-taupe-300 shadow-soft p-5 flex items-center gap-4', variant.thumb, 'ph-tex')}>
                    <div className="absolute inset-0 bg-gradient-to-r from-ink/40 to-transparent"/>
                    <div className="relative z-10">
                      <div className="mono text-[10px] uppercase tracking-[0.18em] text-cream-50/80">Selected variant</div>
                      <div className="serif text-[30px] text-cream-50 leading-tight">{variant.name}</div>
                      <div className="text-[12.5px] text-cream-50/90 mt-1 italic serif">{variant.tagline}</div>
                    </div>
                    <div className="relative z-10 ml-auto text-right">
                      <div className="mono text-[10px] uppercase tracking-[0.18em] text-cream-50/80">Confidence</div>
                      <div className="mono text-[36px] text-cream-50 leading-none">{confidence}%</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button variant="sage" className="text-[12px] py-2"><Icon name="play" size={14}/> Send {v.name} into {variant.name}</Button>
                    <Button variant="ghost" className="text-[12px] py-2">Override</Button>
                  </div>
                </div>
              )}
            </TraceStep>
          </div>
        </Card>

        {/* Alternative routes */}
        <Card className="p-5">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">Considered alternatives</div>
          <div className="space-y-2.5">
            {VARIANTS.filter(x => x.id !== v.recommend).slice(0,4).map((x,i) => {
              const score = Math.max(12, v.confidence - (i+1)*15 - Math.round(Math.random()*6));
              return (
                <div key={x.id} className="p-2.5 rounded-xl border border-taupe-300 bg-cream-50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cx('w-6 h-6 rounded-md ph-tex', x.thumb)}/>
                    <span className="text-[12.5px] text-ink flex-1">{x.name}</span>
                    <span className="mono text-[11px] text-ink-500">{score}%</span>
                  </div>
                  <MiniBar value={score} max={100}/>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-taupe-300">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">Routing principles used</div>
            <ul className="space-y-1.5 text-[12px] text-ink-500">
              <li>&bull; Acquisition channel prior</li>
              <li>&bull; Device &amp; session profile</li>
              <li>&bull; Behavioral entropy</li>
              <li>&bull; Prior style-graph signal</li>
            </ul>
          </div>
        </Card>
      </div>

      <AdaptationModal open={adaptOpen} onClose={()=>setAdaptOpen(false)}/>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="mono text-[10px] uppercase tracking-wider text-ink-500 w-20 flex-shrink-0">{k}</span>
      <span className="text-[13px] text-ink">{v}</span>
    </div>
  );
}

function TraceStep({ n, t, active, done, last, children }) {
  return (
    <div className={cx('flex gap-4 transition-opacity', active ? 'opacity-100' : 'opacity-40')}>
      <div className="flex flex-col items-center">
        <div className={cx('w-8 h-8 rounded-full flex items-center justify-center mono text-[11px] border', done ? 'bg-sage-600 text-cream-50 border-sage-600' : active ? 'bg-clay-50 text-clay-600 border-clay/30' : 'bg-cream-50 text-ink-500 border-taupe-300')}>
          {done ? <Icon name="check" size={14}/> : n}
        </div>
        {!last && <div className="w-px flex-1 bg-taupe-300 mt-1 min-h-[20px]"/>}
      </div>
      <div className="flex-1 pb-2">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t}</div>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

function AdaptationModal({ open, onClose }) {
  const [phase, setPhase] = useState(0); // 0=flow,1=detect,2=offer,3=switched
  useEffect(() => {
    if (!open) { setPhase(0); return; }
    const timers = [
      setTimeout(()=>setPhase(1), 1400),
      setTimeout(()=>setPhase(2), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} className="w-full max-w-[920px]">
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-clay-600">The lean-forward moment</div>
            <h2 className="serif text-[34px] text-ink leading-tight mt-1">Mid-flow adaptation.</h2>
            <p className="text-[13.5px] text-ink-500 max-w-[60ch] mt-1">Jordan starts in Swipe. Engagement drops at card 4. The agent notices, and offers a gentler door.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-taupe-100 flex items-center justify-center"><Icon name="x"/></button>
        </div>

        <div className="grid md:grid-cols-[1fr_280px] gap-5">
          {/* Timeline */}
          <Card className="p-5 bg-cream">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-3">Session timeline</div>
            <div className="relative h-32 bg-cream-50 rounded-xl border border-taupe-300 p-3">
              {/* engagement line */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                <path d="M 20,30 L 80,28 L 140,32 L 200,55 L 260,78 L 320,82 L 380,30" fill="none" stroke="#C97B63" strokeWidth="1.5" strokeDasharray={phase<1 ? '4,4' : '0'} className="transition-all"/>
                <path d="M 20,30 L 80,28 L 140,32 L 200,55 L 260,78" fill="none" stroke="#C97B63" strokeWidth="2.5"/>
                {phase>=2 && <path d="M 260,78 L 320,40 L 380,22" fill="none" stroke="#7A9A82" strokeWidth="2.5" className="bloom"/>}
                <line x1="260" y1="0" x2="260" y2="100" stroke="#E6DCC8"/>
              </svg>
              <div className="absolute top-2 left-4 mono text-[9px] uppercase tracking-wider text-ink-500">engagement</div>
              <div className="absolute bottom-1 left-3 mono text-[9px] text-ink-500">card 1</div>
              <div className="absolute bottom-1 left-1/3 mono text-[9px] text-ink-500">card 4</div>
              <div className="absolute bottom-1 right-6 mono text-[9px] text-ink-500">finish</div>
            </div>

            <div className="mt-4 space-y-3">
              <PhaseBlock active={phase>=0} label="T+22s" who="SWIPE" msg="Jordan swipes 3 cards in 11s. Strong start."/>
              <PhaseBlock active={phase>=1} label="T+58s" who="AGENT" tone="clay" msg="Engagement score dropped to 0.31. Cards 4–5 showed 8s+ hesitation. Context: referral traffic, high-signal prior."/>
              <PhaseBlock active={phase>=2} label="T+61s" who="AGENT" tone="sage" msg="Offering modality switch: Outfit Builder. Preserves momentum, captures gold-standard signal for a user who wants to build, not skim."/>
            </div>
          </Card>

          {/* Visual prompt on phone */}
          <div className="flex flex-col gap-3">
            <Card className="p-4 flex-1 bg-cream">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">What Jordan sees</div>
              <div className="relative bg-cream-50 border border-taupe-300 rounded-2xl p-4">
                <div className="serif text-[18px] text-ink leading-snug">Want to build it instead?</div>
                <p className="text-[12px] text-ink-500 mt-1 leading-snug">You seem like someone who’d rather make the outfit than vote on it. Takes 2 more minutes. We’ll keep what you’ve told us so far.</p>
                <div className="mt-3 flex gap-2">
                  <div className="px-3 py-1.5 rounded-full bg-sage-600 text-cream-50 text-[11px]">Yes, let’s build</div>
                  <div className="px-3 py-1.5 rounded-full border border-taupe-300 text-ink text-[11px]">Keep swiping</div>
                </div>
              </div>
            </Card>
            <div className="text-[12px] text-ink-500 leading-relaxed p-3">
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-sage-600 block mb-1">Outcome (simulated)</span>
              Jordan accepts, completes Builder in 3m, yields signal density <span className="mono text-ink">97</span> — the highest captured this week.
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function PhaseBlock({ active, label, who, tone='ink', msg }) {
  const c = tone==='sage' ? 'text-sage-600' : tone==='clay' ? 'text-clay-600' : 'text-ink';
  return (
    <div className={cx('flex gap-3 items-start transition-all', active ? 'opacity-100' : 'opacity-30')}>
      <div className="mono text-[10px] text-ink-500 w-12 flex-shrink-0 pt-0.5">{label}</div>
      <div className="flex-1">
        <div className={cx('mono text-[10px] uppercase tracking-wider mb-0.5', c)}>{who}</div>
        <div className="text-[13px] text-ink leading-snug">{msg}</div>
      </div>
    </div>
  );
}

Object.assign(window, { RouterView });
