// Top-level app shell — nav, view switcher, and new-variant modal.
// Navigation order: Factory → Variants → Rules → Router → Simulation → Results

import React from 'react';
import {
  Button,
  Icon,
  Modal,
  cx,
  useState,
} from './ui.jsx';
import Dashboard from './views/Dashboard.jsx';
import InventoryView from './views/Inventory.jsx';
import VariantGallery from './views/Variants.jsx';
import FitTwinView from './views/FitTwin.jsx';
import RulesView from './views/Rules.jsx';
import RouterView from './views/RouterView.jsx';
import SimulationView from './views/Simulation.jsx';
import ResultsView from './views/Results.jsx';
import { FactoryProvider, useFactory } from './state.jsx';

// -----------------------------------------------------------------------
// New variant modal — actually creates a draft and jumps to the gallery
// -----------------------------------------------------------------------
function NewVariantModal({ open, onClose, onCreated }) {
  const { addVariant } = useFactory();
  const [name, setName] = useState('');
  const [kind, setKind] = useState('Swipe');

  const kindMap = {
    Swipe: 'ph-3',
    Chat: 'ph-8',
    Binary: 'ph-4',
    Inspiration: 'ph-10',
    Quiz: 'ph-5',
    Canvas: 'ph-6',
  };

  function reset() {
    setName('');
    setKind('Swipe');
  }

  function create() {
    const finalName = name.trim() || `${kind} variant`;
    const id = addVariant({
      name: finalName,
      kind,
      thumb: kindMap[kind] || 'ph-6',
      tagline: 'Drafted — not yet receiving traffic.',
      why: 'A new experiment. Tune it, then flip it on.',
    });
    reset();
    onClose();
    onCreated && onCreated(id);
  }

  return (
    <Modal open={open} onClose={onClose} className="w-full max-w-[520px]">
      <div className="p-8">
        <div className="type-eyebrow text-lime-700">Begin an experiment</div>
        <h2 className="type-headline-md text-navy leading-tight mt-2 mb-5">
          New variant
        </h2>
        <div className="space-y-4">
          <div>
            <div className="type-eyebrow text-ink-soft mb-2">Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Style Shuffle — long-form"
              className="w-full bg-surface-lowest border border-outline-variant rounded px-4 py-2.5 text-[13.5px] focus:border-teal"
            />
          </div>
          <div>
            <div className="type-eyebrow text-ink-soft mb-2">Modality</div>
            <div className="flex flex-wrap gap-1.5">
              {['Swipe', 'Chat', 'Binary', 'Inspiration', 'Quiz', 'Canvas'].map((k) => (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={cx(
                    'px-3 py-1.5 rounded text-[11px] uppercase tracking-[0.08em] font-bold border transition-colors',
                    kind === k
                      ? 'bg-teal text-navy border-teal'
                      : 'bg-surface-lowest text-ink-soft border-outline-variant hover:border-navy',
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 rounded bg-teal/10 border border-teal text-[13px] text-navy leading-relaxed flex items-start gap-3">
            <Icon name="sparkle" className="text-teal-500 mt-0.5 flex-shrink-0" />
            <span>
              We’ll scaffold this variant against the current StyleFile schema and hand it to the router in draft mode. You’ll see zero live traffic until you flip it on.
            </span>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose}>
            Not yet
          </Button>
          <Button variant="primary" onClick={create}>
            Create draft
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// -----------------------------------------------------------------------
// Brand logo
// -----------------------------------------------------------------------
function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded bg-navy" />
        <div className="absolute top-1.5 left-1.5 right-1.5 bottom-1.5 rounded-sm bg-teal" />
        <div className="absolute top-2.5 left-2.5 w-3 h-3 rounded-full bg-lime" />
      </div>
      <div>
        <div className="text-[1.0625rem] text-navy font-bold leading-none tracking-tight">
          DayOne
        </div>
        <div className="text-[9px] uppercase tracking-[0.22em] text-ink-soft leading-none mt-1.5 font-bold">
          Flow Factory
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Top nav — Factory → Inventory → Variants → Fit Twin → Rules → Router → Simulation → Results
// -----------------------------------------------------------------------
function TopNav({ view, setView, onSimulate }) {
  const items = [
    { id: 'dashboard', label: 'Factory', icon: 'factory' },
    { id: 'inventory', label: 'Inventory', icon: 'grid' },
    { id: 'gallery', label: 'Variants', icon: 'layers' },
    { id: 'fittwin', label: 'Fit Twin', icon: 'user' },
    { id: 'rules', label: 'Rules', icon: 'clipboard' },
    { id: 'router', label: 'Router', icon: 'route' },
    { id: 'simulation', label: 'Simulation', icon: 'bolt' },
    { id: 'results', label: 'Results', icon: 'chart' },
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface/85 backdrop-blur">
      <div className="px-6 md:px-10 h-16 max-w-[1400px] mx-auto flex items-center gap-4">
        <Logo />
        <nav className="hidden md:flex items-center gap-1 ml-6">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              className={cx(
                'flex items-center gap-2 px-3 py-2 rounded text-[11px] uppercase tracking-[0.08em] font-bold transition-colors border',
                view === it.id
                  ? 'bg-navy text-white border-navy'
                  : 'text-ink-soft border-transparent hover:text-navy hover:bg-surface-base',
              )}
            >
              <Icon name={it.icon} /> {it.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {/* Simulate CTA — placeholder; wiring comes later. */}
          <Button variant="primary" onClick={onSimulate} className="hidden md:inline-flex">
            <Icon name="plus" /> Simulate
          </Button>
          <div className="w-9 h-9 rounded-full ph-10 ph-tex border border-outline-variant" />
        </div>
      </div>
      <div className="md:hidden flex gap-1 px-4 pb-3 overflow-x-auto no-scrollbar">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => setView(it.id)}
            className={cx(
              'flex items-center gap-2 px-3 py-2 rounded text-[11px] uppercase tracking-[0.08em] font-bold flex-shrink-0',
              view === it.id
                ? 'bg-navy text-white'
                : 'text-ink-soft bg-surface-base',
            )}
          >
            <Icon name={it.icon} /> {it.label}
          </button>
        ))}
      </div>
    </header>
  );
}

// -----------------------------------------------------------------------
// App shell
// -----------------------------------------------------------------------
function AppShell() {
  const [view, setView] = useState('dashboard');
  const [activeVariant, setActiveVariant] = useState('swipe');
  const [newOpen, setNewOpen] = useState(false);

  function openVariant(id) {
    setActiveVariant(id);
    setView('gallery');
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Top-bar "+ Simulate" button is intentionally unwired for now — placeholder. */}
      <TopNav view={view} setView={setView} onSimulate={() => {}} />
      {view === 'dashboard' && (
        <Dashboard
          onOpenVariant={openVariant}
          onOpenRules={() => setView('rules')}
          onOpenInventory={() => setView('inventory')}
        />
      )}
      {view === 'inventory' && <InventoryView />}
      {view === 'gallery' && (
        <VariantGallery
          initialId={activeVariant}
          onNewVariant={() => setNewOpen(true)}
        />
      )}
      {view === 'fittwin' && <FitTwinView />}
      {view === 'rules' && <RulesView />}
      {view === 'router' && <RouterView onSendToVariant={openVariant} />}
      {view === 'simulation' && <SimulationView />}
      {view === 'results' && <ResultsView />}
      <NewVariantModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={(id) => {
          setActiveVariant(id);
          setView('gallery');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <FactoryProvider>
      <AppShell />
    </FactoryProvider>
  );
}
