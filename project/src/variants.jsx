// View 2: Variant Gallery — all 6 flows, playable

function ArchetypeReveal({ archetypeId, onRestart, onSchedule, variantName }) {
  const a = ARCHETYPES.find(x => x.id === archetypeId) || ARCHETYPES[0];
  return (
    <div className="absolute inset-0 bg-cream flex flex-col">
      <div className={cx('relative h-[44%] ph-tex', a.palette)}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cream"/>
        <div className="absolute top-4 left-4 mono text-[10px] uppercase tracking-[0.18em] text-cream-50 bloom">Your StyleFile</div>
      </div>
      <div className="px-6 pt-2 pb-6 flex-1 flex flex-col bloom">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-clay-600">Archetype 03 of 08</div>
        <h2 className="serif text-[44px] leading-[0.95] text-ink mt-1">{a.name}</h2>
        <p className="serif italic text-[18px] leading-snug text-ink-500 mt-3">{a.tagline}</p>
        <div className="mt-5 space-y-2">
          {a.pairs.map((p,i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="w-1 h-1 rounded-full bg-sage-600"/>
              <span className="text-[13px] text-ink">{p}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto space-y-2 pt-4">
          <Button variant="sage" className="w-full justify-center"><Icon name="sparkle"/> Schedule your first Fix</Button>
          <button onClick={onRestart} className="w-full text-center text-[12px] text-ink-500 py-2 hover:text-ink transition-colors">Try a different {variantName} run</button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// 1. SWIPE
// -----------------------------------------------------------------
function SwipeVariant() {
  const [i, setI] = useState(0);
  const [liked, setLiked] = useState([]);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const startX = useRef(0);

  function onDown(e) { setDragging(true); startX.current = (e.touches? e.touches[0].clientX : e.clientX); }
  function onMove(e) {
    if (!dragging) return;
    const x = (e.touches? e.touches[0].clientX : e.clientX);
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
    if (i+1 >= 10) { setDone(true); }
    else setI(i+1);
  }

  if (done) return <ArchetypeReveal archetypeId={archetypeFor('swipe',{liked})} onRestart={()=>{setI(0);setLiked([]);setDone(false);}} variantName="Swipe"/>;

  const card = SWIPE_CARDS[i];
  const next = SWIPE_CARDS[i+1];
  const next2 = SWIPE_CARDS[i+2];
  const rot = drag * 0.06;

  return (
    <div className="absolute inset-0 bg-cream flex flex-col">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500">Style Shuffle</div>
          <div className="serif text-[18px] text-ink leading-tight">Left is "not me." Right is yes.</div>
        </div>
        <div className="mono text-[11px] text-ink-500">{i+1}/10</div>
      </div>
      <div className="px-5"><Progress value={(i/10)*100} tone="sage"/></div>

      <div className="flex-1 relative px-5 pt-4 card-stack select-none" onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
        {next2 && <CardFace card={next2} style={{ transform: 'translateY(16px) scale(0.94)', opacity: 0.4 }}/>}
        {next && <CardFace card={next} style={{ transform: 'translateY(8px) scale(0.97)', opacity: 0.7 }}/>}
        <CardFace
          card={card}
          style={{ transform: `translateX(${drag}px) rotate(${rot}deg)`, transition: dragging ? 'none' : 'transform 300ms cubic-bezier(.2,.8,.2,1)' }}
          onMouseDown={onDown}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
          drag={drag}
        />
      </div>

      <div className="px-5 pt-3 pb-6 flex items-center justify-center gap-6">
        <button onClick={()=>decide(false)} className="w-14 h-14 rounded-full bg-cream-50 border border-taupe-300 shadow-soft flex items-center justify-center text-ink hover:scale-105 transition-transform">
          <Icon name="x" size={20}/>
        </button>
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500">swipe or tap</div>
        <button onClick={()=>decide(true)} className="w-14 h-14 rounded-full bg-sage-600 text-cream-50 shadow-lift flex items-center justify-center hover:scale-105 transition-transform">
          <Icon name="heart" size={20}/>
        </button>
      </div>
    </div>
  );
}

function CardFace({ card, style, drag=0, ...p }) {
  return (
    <div {...p} className={cx('absolute left-5 right-5 top-4 bottom-4 rounded-3xl overflow-hidden shadow-lift border border-taupe-300 cursor-grab active:cursor-grabbing', card.ph, 'ph-tex')} style={style}>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent"/>
      {drag > 40 && <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full border-2 border-sage-600 mono text-[11px] uppercase tracking-widest text-sage-600 bg-cream-50/90">Yes, please</div>}
      {drag < -40 && <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full border-2 border-clay mono text-[11px] uppercase tracking-widest text-clay-600 bg-cream-50/90">Not me</div>}
      <div className="absolute bottom-4 left-4 right-4 text-cream-50">
        <div className="serif text-[22px] leading-tight">{card.label}</div>
        <div className="mono text-[10px] uppercase tracking-widest opacity-80 mt-1">{card.tags.join(' • ')}</div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// 2. CHAT
// -----------------------------------------------------------------
function ChatVariant() {
  const [msgs, setMsgs] = useState([
    { from:'bot', t:'Hey — I’m Ava, one of our stylists. No quiz today. Just tell me what’s going on with your wardrobe right now.' },
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [typing, setTyping] = useState(false);
  const ref = useRef(null);

  const script = [
    { q: 'That makes sense. What feels missing most — tops, bottoms, something to layer, or something dressier?', opts: ['A great jacket', 'Pants that actually fit', 'One perfect knit', 'Something that feels like me'] },
    { q: 'Got it. And when you picture yourself feeling really you in an outfit, is it closer to soft and at ease, or sharp and pulled-together?', opts: ['Soft and at ease', 'Sharp and pulled-together', 'A little of both, honestly'] },
    { q: 'Last thing — what’s a color you keep reaching for?', opts: ['Cream / oat', 'Soft navy', 'Camel', 'Charcoal'] },
    { q: 'Okay. I have a pretty strong read already. Want to see what I’m thinking?', opts: ['Yes, show me'] },
  ];

  useEffect(() => { ref.current && (ref.current.scrollTop = ref.current.scrollHeight); }, [msgs, typing]);

  function send(text) {
    if (!text.trim()) return;
    setMsgs(m => [...m, { from:'you', t:text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      if (step >= script.length) { setTyping(false); setDone(true); return; }
      setMsgs(m => [...m, { from:'bot', t: script[step].q, opts: script[step].opts }]);
      setStep(s => s+1);
      setTyping(false);
    }, 900);
  }

  if (done) return <ArchetypeReveal archetypeId={archetypeFor('chat')} onRestart={()=>{setMsgs([{from:'bot',t:'Hey — I’m Ava, one of our stylists. Tell me what’s going on with your wardrobe right now.'}]); setStep(0); setDone(false);}} variantName="Chat"/>;

  return (
    <div className="absolute inset-0 bg-cream flex flex-col">
      <div className="px-5 pt-5 pb-3 flex items-center gap-3 border-b border-taupe-300">
        <div className="w-9 h-9 rounded-full ph-8 ph-tex shadow-soft"/>
        <div>
          <div className="text-[14px] text-ink font-medium leading-tight">Ava</div>
          <div className="mono text-[10px] text-sage-600 uppercase tracking-wider flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-sage-600 pulse-dot"/> stylist, online</div>
        </div>
      </div>
      <div ref={ref} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {msgs.map((m,i) => (
          <div key={i} className={cx('flex flex-col', m.from==='you' ? 'items-end' : 'items-start')}>
            <div className={cx('max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-snug',
              m.from==='you' ? 'bg-ink text-cream-50 rounded-br-md' : 'bg-cream-50 text-ink border border-taupe-300 rounded-bl-md')}>
              {m.t}
            </div>
            {m.opts && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                {m.opts.map(o => (
                  <button key={o} onClick={()=>send(o)} className="px-3 py-1.5 rounded-full border border-sage/50 bg-sage-50 text-sage-600 text-[12px] hover:bg-sage-200 transition-colors">{o}</button>
                ))}
              </div>
            )}
          </div>
        ))}
        {typing && <div className="flex items-center gap-1.5 px-2"><span className="w-1.5 h-1.5 rounded-full bg-ink-300 pulse-dot"/><span className="w-1.5 h-1.5 rounded-full bg-ink-300 pulse-dot" style={{animationDelay:'200ms'}}/><span className="w-1.5 h-1.5 rounded-full bg-ink-300 pulse-dot" style={{animationDelay:'400ms'}}/><span className="mono text-[10px] text-ink-500 ml-1">Ava’s taking notes</span></div>}
      </div>
      <div className="p-3 border-t border-taupe-300">
        <div className="flex items-center gap-2 bg-cream-50 border border-taupe-300 rounded-full px-4 py-2.5">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send(input)} placeholder="Tell Ava what’s on your mind…" className="flex-1 bg-transparent text-[13.5px] placeholder:text-ink-300"/>
          <button onClick={()=>send(input)} className="text-sage-600 hover:text-sage"><Icon name="send" size={18}/></button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// 3. THIS OR THAT
// -----------------------------------------------------------------
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
      if (i+1 >= TOT_PAIRS.length) setDone(true);
      else setI(i+1);
    }, 280);
  }

  if (done) return <ArchetypeReveal archetypeId={archetypeFor('this-or-that')} onRestart={()=>{setI(0); setPicks([]); setDone(false);}} variantName="This or That"/>;

  const pair = TOT_PAIRS[i];
  const interstitials = [null, 'Nice. You’re decisive.', null, 'Oooh, we see you.', null, 'Patterns incoming.', null, 'One more.'];
  const message = interstitials[i];

  return (
    <div className="absolute inset-0 bg-cream flex flex-col">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500">This or That</div>
          <div className="serif text-[22px] text-ink leading-tight mt-0.5">{pair.q}</div>
        </div>
        <div className="mono text-[11px] text-ink-500">{i+1}/{TOT_PAIRS.length}</div>
      </div>
      <div className="px-5"><Progress value={((i+1)/TOT_PAIRS.length)*100} tone="clay"/></div>
      {message && <div className="px-5 pt-2 mono text-[10px] uppercase tracking-[0.18em] text-clay-600">{message}</div>}
      <div className="flex-1 px-5 py-4 grid grid-rows-2 gap-3">
        <ToTCard side="a" ph={pair.a.ph} label={pair.a.label} active={flash==='a'} onPick={()=>pick('a')}/>
        <ToTCard side="b" ph={pair.b.ph} label={pair.b.label} active={flash==='b'} onPick={()=>pick('b')}/>
      </div>
      <div className="text-center pb-4 mono text-[10px] text-ink-500 uppercase tracking-widest">tap either, no wrong answer</div>
    </div>
  );
}

function ToTCard({ ph, label, active, onPick, side }) {
  return (
    <button onClick={onPick} className={cx('relative rounded-3xl overflow-hidden ph-tex border border-taupe-300 shadow-soft transition-all text-left', ph, active ? 'ring-4 ring-sage-600 scale-[0.985]' : 'hover:scale-[1.01]')}>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/55 to-transparent"/>
      <div className="absolute top-3 left-3 mono text-[10px] uppercase tracking-[0.18em] text-cream-50/80">{side.toUpperCase()}</div>
      <div className="absolute bottom-3 left-3 right-3 serif text-[20px] leading-tight text-cream-50">{label}</div>
    </button>
  );
}

// -----------------------------------------------------------------
// 4. INSPIRATION
// -----------------------------------------------------------------
function InspirationVariant() {
  const [mode, setMode] = useState('board'); // board | handle | celeb
  const [sel, setSel] = useState(null);
  const [handle, setHandle] = useState('');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [archetypeId, setArchetypeId] = useState(null);

  function commit(id) {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false); setDone(true);
      const byBoard = { m1:'coastal-sport', m2:'rustic-rebel', m3:'modern-muse', m4:'modern-prep', m5:'boho-dreamer', m6:'adventure-sport', m7:'studio-minimal', m8:'rustic-rebel', m9:'quiet-classic' };
      setArchetypeId(byBoard[id] || 'modern-muse');
    }, 1800);
  }

  if (done) return <ArchetypeReveal archetypeId={archetypeId} onRestart={()=>{setDone(false); setSel(null); setHandle(''); setArchetypeId(null);}} variantName="Taste Transfer"/>;

  if (processing) return (
    <div className="absolute inset-0 bg-cream flex flex-col items-center justify-center p-8 text-center">
      <div className="relative w-28 h-28 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-taupe-300"/>
        <div className="absolute inset-0 rounded-full border-2 border-sage-600 border-t-transparent animate-spin" style={{ animationDuration: '1.4s' }}/>
        <div className="absolute inset-3 rounded-full ph-10 ph-tex"/>
      </div>
      <div className="serif text-[26px] text-ink leading-tight">Reading between the lines.</div>
      <div className="mono text-[11px] text-ink-500 uppercase tracking-[0.18em] mt-2">extracting aesthetic signature</div>
      <div className="mt-6 text-[12px] text-ink-500 max-w-[280px]">Your stylist is pulling threads from color, silhouette, and texture signals.</div>
    </div>
  );

  return (
    <div className="absolute inset-0 bg-cream flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500">Taste Transfer</div>
        <div className="serif text-[22px] text-ink leading-tight mt-0.5">Pick a mood. Drop a handle. Either works.</div>
      </div>
      <div className="px-5 pb-3">
        <Segmented className="w-full flex" options={[{value:'board',label:'Mood board'},{value:'handle',label:'Instagram'},{value:'celeb',label:'Taste icon'}]} value={mode} onChange={setMode}/>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {mode==='board' && (
          <div className="grid grid-cols-3 gap-2">
            {MOOD_BOARDS.map(m => (
              <button key={m.id} onClick={()=>{setSel(m.id); commit(m.id);}} className={cx('relative aspect-[3/4] rounded-2xl overflow-hidden border border-taupe-300 shadow-soft transition-all ph-tex', m.ph, sel===m.id ? 'ring-2 ring-sage-600' : 'hover:scale-[1.02]')}>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent"/>
                <div className="absolute bottom-1.5 left-2 right-2 text-left">
                  <div className="serif text-[13px] text-cream-50 leading-tight">{m.title}</div>
                  <div className="mono text-[8px] uppercase tracking-wider text-cream-50/80">{m.sub}</div>
                </div>
              </button>
            ))}
          </div>
        )}
        {mode==='handle' && (
          <div className="pt-6 space-y-3">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500">Instagram handle</div>
            <div className="flex items-center gap-2 bg-cream-50 border border-taupe-300 rounded-full px-4 py-3">
              <span className="text-ink-500">@</span>
              <input value={handle} onChange={e=>setHandle(e.target.value)} placeholder="someone whose closet you’d raid" className="flex-1 bg-transparent text-[13.5px] placeholder:text-ink-300"/>
            </div>
            <Button variant="sage" className="w-full justify-center" onClick={()=>commit('m3')} disabled={!handle.trim()}><Icon name="sparkle"/> Read the aesthetic</Button>
            <div className="text-[11px] text-ink-500 leading-relaxed pt-2">We only look at public posts. We don’t follow, save, or store handles after reading.</div>
          </div>
        )}
        {mode==='celeb' && (
          <div className="pt-4 space-y-2">
            {[
              {name:'Carolyn Bessette', desc:'sharp minimalism, one perfect line', id:'modern-muse'},
              {name:'Steve McQueen', desc:'work jacket, boot, quiet cool', id:'rustic-rebel'},
              {name:'Jane Birkin', desc:'relaxed, soft, a little unbothered', id:'coastal-sport'},
              {name:'Brunello Cucinelli', desc:'cashmere as a philosophy', id:'modern-prep'},
              {name:'Sade', desc:'ink, silver, restraint', id:'studio-minimal'},
              {name:'Jenny Slate', desc:'soft prints, stories, layers', id:'boho-dreamer'},
            ].map(p => (
              <button key={p.name} onClick={()=>commit(p.id)} className="w-full flex items-center gap-3 p-3 rounded-2xl border border-taupe-300 bg-cream-50 hover:bg-taupe-100 transition-colors text-left">
                <div className="w-10 h-10 rounded-full ph-11 ph-tex"/>
                <div className="flex-1">
                  <div className="text-[13.5px] text-ink">{p.name}</div>
                  <div className="text-[11px] text-ink-500 italic serif">{p.desc}</div>
                </div>
                <Icon name="chev" className="text-ink-300"/>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// 5. CLASSIC (REFINED)
// -----------------------------------------------------------------
function ClassicVariant() {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState({});
  const [celebrate, setCelebrate] = useState(false);
  const [done, setDone] = useState(false);
  const total = CLASSIC_QS.length;

  function answer(opt) {
    setPicks(p => ({...p, [step]: opt}));
    if (step === 1 || step === 3) {
      setCelebrate(true);
      setTimeout(() => { setCelebrate(false); advance(); }, 900);
    } else advance();
  }
  function advance() {
    if (step+1 >= total) setDone(true);
    else setStep(s => s+1);
  }

  if (done) return <ArchetypeReveal archetypeId={archetypeFor('classic')} onRestart={()=>{setStep(0); setPicks({}); setDone(false);}} variantName="Classic"/>;

  const q = CLASSIC_QS[step];
  const pct = (step/total)*100;

  return (
    <div className="absolute inset-0 bg-cream flex flex-col">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500">Classic, refined</div>
          <div className="mono text-[11px] text-ink-500">{step+1} of {total}</div>
        </div>
        <Progress value={pct} tone="sage"/>
      </div>
      <div className="flex-1 px-6 pb-6 flex flex-col">
        <h2 className="serif text-[28px] leading-tight text-ink mb-5">{q.q}</h2>
        <div className="space-y-2.5 flex-1">
          {q.opts.map(o => {
            const sel = picks[step] === o;
            return (
              <button key={o} onClick={()=>answer(o)} className={cx('w-full text-left p-4 rounded-2xl border transition-all', sel ? 'border-sage-600 bg-sage-50 shadow-soft' : 'border-taupe-300 bg-cream-50 hover:border-ink-300')}>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-ink">{o}</span>
                  {sel && <Icon name="check" className="text-sage-600"/>}
                </div>
              </button>
            );
          })}
        </div>
        {celebrate && (
          <div className="mt-3 p-3 rounded-2xl bg-clay-50 border border-clay/30 bloom flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-clay text-cream-50 flex items-center justify-center"><Icon name="sparkle" size={14}/></div>
            <div className="text-[13px] text-clay-600 serif italic">Halfway home.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// 6. BUILDER
// -----------------------------------------------------------------
function BuilderVariant() {
  const [placed, setPlaced] = useState([]); // { id, x, y, item }
  const [cat, setCat] = useState('Top');
  const [dragItem, setDragItem] = useState(null);
  const [done, setDone] = useState(false);
  const canvasRef = useRef(null);

  const cats = ['Top','Bottom','Shoes','Layer'];
  const available = BUILDER_ITEMS.filter(i => i.cat === cat);

  function onDrop(e) {
    e.preventDefault();
    if (!dragItem || !canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - r.left - 40;
    const y = e.clientY - r.top - 50;
    setPlaced(p => [...p.filter(q => q.item.cat !== dragItem.cat), { id: Date.now(), x, y, item: dragItem }]);
    setDragItem(null);
  }
  function removeAt(id) { setPlaced(p => p.filter(q => q.id !== id)); }

  if (done) return <ArchetypeReveal archetypeId={archetypeFor('builder')} onRestart={()=>{setPlaced([]); setDone(false);}} variantName="Builder"/>;

  return (
    <div className="absolute inset-0 bg-cream flex flex-col">
      <div className="px-5 pt-5 pb-2">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500">Outfit Builder</div>
        <div className="serif text-[20px] text-ink leading-tight mt-0.5">Build the outfit you wish was in your closet.</div>
      </div>
      <div ref={canvasRef} onDragOver={e=>e.preventDefault()} onDrop={onDrop} className="mx-5 mt-2 mb-3 rounded-3xl border border-taupe-300 bg-cream-50 grid-dots relative overflow-hidden" style={{ height: 300 }}>
        {placed.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-ink-300 text-[12px] mono uppercase tracking-widest">drag here</div>}
        {placed.map(p => (
          <div key={p.id} onDoubleClick={()=>removeAt(p.id)} className={cx('absolute w-20 h-24 rounded-xl shadow-lift ph-tex border border-taupe-300', p.item.ph)} style={{ left: p.x, top: p.y }}>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent rounded-xl"/>
            <div className="absolute bottom-1 left-1 right-1 text-[9px] text-cream-50 leading-tight">{p.item.label.split(' — ')[0]}</div>
          </div>
        ))}
        {placed.length >= 2 && (
          <button onClick={()=>setDone(true)} className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-ink text-cream-50 text-[11px] flex items-center gap-1.5"><Icon name="sparkle" size={12}/> Finish outfit</button>
        )}
      </div>
      <div className="px-5">
        <div className="flex gap-1 mb-2">
          {cats.map(c => (
            <button key={c} onClick={()=>setCat(c)} className={cx('px-3 py-1.5 rounded-full text-[11px] border transition-colors', cat===c ? 'bg-ink text-cream-50 border-ink' : 'bg-cream-50 text-ink-500 border-taupe-300')}>{c}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        <div className="grid grid-cols-4 gap-2">
          {available.map(i => (
            <div key={i.id} draggable onDragStart={()=>setDragItem(i)} className={cx('aspect-[3/4] rounded-xl ph-tex border border-taupe-300 shadow-soft cursor-grab active:cursor-grabbing relative', i.ph)}>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent rounded-xl"/>
              <div className="absolute bottom-1 left-1 right-1 text-[9px] text-cream-50 leading-tight">{i.label.split(' — ')[0]}</div>
            </div>
          ))}
        </div>
        <div className="text-center mono text-[10px] text-ink-500 uppercase tracking-widest mt-3">drag onto canvas &middot; double-click to remove</div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// Variant Gallery shell
// -----------------------------------------------------------------
const VARIANT_IMPLS = {
  swipe: SwipeVariant,
  chat: ChatVariant,
  'this-or-that': TorVariant,
  inspiration: InspirationVariant,
  classic: ClassicVariant,
  builder: BuilderVariant,
};

function VariantGallery({ initialId, onBack }) {
  const [active, setActive] = useState(initialId || 'swipe');
  const [key, setKey] = useState(0);
  const v = VARIANTS.find(x => x.id === active);
  const Impl = VARIANT_IMPLS[active];

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
      <SectionHead
        eyebrow="Gallery / playable variants"
        title="Every door. Same house."
        sub="Click any variant. Run it as a new visitor would — then compare."
        right={
          <Segmented
            options={[{label:'Mobile',value:'mobile'},{label:'Desktop preview',value:'desktop'}]}
            value="mobile" onChange={()=>{}}
          />
        }
      />

      <div className="grid md:grid-cols-[280px_1fr_300px] gap-5">
        {/* Sidebar list */}
        <Card className="p-2">
          {VARIANTS.map(x => (
            <button key={x.id} onClick={()=>{setActive(x.id); setKey(k=>k+1);}} className={cx('w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors', active===x.id ? 'bg-taupe-100' : 'hover:bg-taupe-100/50')}>
              <div className={cx('w-10 h-12 rounded-md ph-tex border border-taupe-300', x.thumb)}/>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] text-ink leading-tight truncate">{x.name}</div>
                <div className="mono text-[10px] uppercase tracking-wider text-ink-500 mt-0.5">{x.kind}</div>
              </div>
              {active===x.id && <Icon name="chev" className="text-ink"/>}
            </button>
          ))}
        </Card>

        {/* Phone */}
        <div className="flex items-start justify-center pt-4">
          <PhoneFrame key={active + '-' + key}>
            <Impl/>
          </PhoneFrame>
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{v.kind}</div>
            <h3 className="serif text-[28px] leading-tight text-ink mt-1">{v.name}</h3>
            <p className="text-[13px] text-ink-500 leading-relaxed mt-2 italic serif">"{v.tagline}"</p>
            <div className="mt-4 pt-4 border-t border-taupe-300">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">Why this variant</div>
              <p className="text-[13px] text-ink leading-relaxed">{v.why}</p>
            </div>
          </Card>
          <Card className="p-5">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-3">Live signal</div>
            <div className="space-y-3">
              <LineStat label="Completion rate" value={v.metrics.completion} suffix="%"/>
              <LineStat label="Avg. time to complete" value={v.metrics.avgTime}/>
              <LineStat label="Style-signal density" value={v.metrics.signalDensity} suffix="/100"/>
              <LineStat label="First-Fix keep rate" value={v.metrics.firstFix} suffix="%"/>
            </div>
          </Card>
          <Button variant="secondary" className="w-full justify-center" onClick={()=>setKey(k=>k+1)}><Icon name="play"/> Restart run</Button>
        </div>
      </div>
    </div>
  );
}

function LineStat({ label, value, suffix='' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12.5px] text-ink-500">{label}</span>
      <span className="mono text-[13px] text-ink">{value}{suffix}</span>
    </div>
  );
}

Object.assign(window, { VariantGallery });
