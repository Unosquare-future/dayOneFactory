// App shell — top-level navigation & compose

const { useState: useStateApp } = React;

function NewVariantModal({ open, onClose }) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState('Swipe');
  return (
    <Modal open={open} onClose={onClose} className="w-full max-w-[520px]">
      <div className="p-6">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-clay-600">Begin an experiment</div>
        <h2 className="serif text-[28px] text-ink leading-tight mt-1 mb-4">New variant</h2>
        <div className="space-y-3">
          <div>
            <div className="mono text-[10px] uppercase tracking-wider text-ink-500 mb-1">Name</div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Style Shuffle — long-form"
              className="w-full bg-cream-50 border border-taupe-300 rounded-full px-4 py-2.5 text-[13.5px]"/>
          </div>
          <div>
            <div className="mono text-[10px] uppercase tracking-wider text-ink-500 mb-1">Modality</div>
            <div className="flex flex-wrap gap-1.5">
              {['Swipe','Chat','Binary','Inspiration','Quiz','Canvas'].map(k => (
                <button key={k} onClick={()=>setKind(k)} className={cx('px-3 py-1.5 rounded-full text-[12px] border', kind===k ? 'bg-ink text-cream-50 border-ink' : 'bg-cream-50 text-ink border-taupe-300')}>{k}</button>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-sage-50 border border-sage/30 text-[12.5px] text-ink leading-relaxed flex items-start gap-2">
            <Icon name="sparkle" className="text-sage-600 mt-0.5 flex-shrink-0"/>
            <span>We’ll scaffold this variant against the current StyleFile schema and hand it to the router in draft mode. You’ll see zero live traffic until you flip it on.</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" onClick={onClose}>Not yet</Button>
          <Button variant="sage" onClick={onClose}>Create draft</Button>
        </div>
      </div>
    </Modal>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-lg bg-ink"/>
        <div className="absolute top-1.5 left-1.5 right-1.5 bottom-1.5 rounded-[5px] bg-sage-600"/>
        <div className="absolute top-2.5 left-2.5 w-3 h-3 rounded-full bg-clay"/>
      </div>
      <div>
        <div className="serif text-[18px] text-ink leading-none">DayOne</div>
        <div className="mono text-[9px] uppercase tracking-[0.22em] text-ink-500 leading-none mt-0.5">Flow Factory</div>
      </div>
    </div>
  );
}

function TopNav({ view, setView, onNew }) {
  const items = [
    { id:'dashboard', label:'Factory', icon:'factory' },
    { id:'gallery', label:'Variants', icon:'layers' },
    { id:'router', label:'Router', icon:'route' },
    { id:'results', label:'Results', icon:'chart' },
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-taupe-300 bg-cream/85 backdrop-blur">
      <div className="px-6 md:px-10 h-16 max-w-[1400px] mx-auto flex items-center gap-6">
        <Logo/>
        <div className="hidden md:flex items-center gap-1 ml-6">
          {items.map(it => (
            <button key={it.id} onClick={()=>setView(it.id)} className={cx('flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] transition-colors', view===it.id ? 'bg-ink text-cream-50' : 'text-ink-500 hover:text-ink hover:bg-taupe-100')}>
              <Icon name={it.icon}/> {it.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-taupe-300 bg-cream-50">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-600 pulse-dot"/>
            <span className="mono text-[11px] text-ink-500 uppercase tracking-wider">Agent live</span>
          </div>
          <Button variant="secondary" onClick={onNew} className="hidden md:inline-flex"><Icon name="plus"/> Variant</Button>
          <div className="w-9 h-9 rounded-full ph-10 ph-tex border border-taupe-300 shadow-soft"/>
        </div>
      </div>
      {/* mobile nav */}
      <div className="md:hidden flex gap-1 px-4 pb-3 overflow-x-auto no-scrollbar">
        {items.map(it => (
          <button key={it.id} onClick={()=>setView(it.id)} className={cx('flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] flex-shrink-0', view===it.id ? 'bg-ink text-cream-50' : 'text-ink-500 bg-taupe-100')}>
            <Icon name={it.icon}/> {it.label}
          </button>
        ))}
      </div>
    </header>
  );
}

function App() {
  const [view, setView] = useState('dashboard');
  const [activeVariant, setActiveVariant] = useState('swipe');
  const [newOpen, setNewOpen] = useState(false);

  function openVariant(id) {
    setActiveVariant(id);
    setView('gallery');
  }

  return (
    <div className="min-h-screen">
      <TopNav view={view} setView={setView} onNew={()=>setNewOpen(true)}/>
      {view==='dashboard' && <Dashboard onOpenVariant={openVariant} onNewVariant={()=>setNewOpen(true)}/>}
      {view==='gallery' && <VariantGallery initialId={activeVariant}/>}
      {view==='router' && <RouterView/>}
      {view==='results' && <ResultsView/>}
      <NewVariantModal open={newOpen} onClose={()=>setNewOpen(false)}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
