// Lightweight shared state for the Factory.
// We keep rules + variants mutable at the App root so every tab
// (Dashboard, Rules, Router, Simulation, Results) stays in sync.

import React, { createContext, useContext, useState } from 'react';
import {
  ROUTING_RULES as INITIAL_RULES,
  VARIANTS as INITIAL_VARIANTS,
} from './data.js';
import { INVENTORY as INITIAL_INVENTORY } from './inventory.js';

const FactoryContext = createContext(null);

export function FactoryProvider({ children }) {
  const [variants, setVariants] = useState(INITIAL_VARIANTS);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);

  // --- rules CRUD ---
  function toggleRule(id) {
    setRules((rs) =>
      rs.map((r) =>
        r.id === id ? { ...r, status: r.status === 'on' ? 'draft' : 'on' } : r,
      ),
    );
  }
  function updateRule(id, patch) {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function addRule(rule) {
    const id = `r${Date.now()}`;
    setRules((rs) => [...rs, { id, status: 'on', weight: 0.5, ...rule }]);
    return id;
  }
  function removeRule(id) {
    setRules((rs) => rs.filter((r) => r.id !== id));
  }

  // --- variants CRUD ---
  function addVariant(v) {
    const id = v.id || `v-${Date.now()}`;
    const draft = {
      id,
      name: v.name || 'New variant',
      kind: v.kind || 'Swipe',
      thumb: v.thumb || 'ph-6',
      tagline: v.tagline || 'A fresh door into the style graph.',
      why: v.why || 'Drafted — not yet receiving traffic.',
      traffic: 0,
      status: 'Draft',
      metrics: { completion: 0, avgTime: '—', signalDensity: 0, firstFix: 0 },
      accent: v.accent || 'teal',
      ...v,
    };
    setVariants((vs) => [...vs, draft]);
    return id;
  }

  // --- inventory helpers ---
  function adjustStock(id, delta) {
    setInventory((inv) =>
      inv.map((item) => {
        if (item.id !== id) return item;
        const stock = Math.max(0, item.stock + delta);
        return {
          ...item,
          stock,
          status:
            stock === 0 ? 'Sold out' : stock < 6 ? 'Low stock' : 'In stock',
        };
      }),
    );
  }

  const value = {
    variants,
    rules,
    inventory,
    setVariants,
    setRules,
    setInventory,
    toggleRule,
    updateRule,
    addRule,
    removeRule,
    addVariant,
    adjustStock,
  };
  return <FactoryContext.Provider value={value}>{children}</FactoryContext.Provider>;
}

export function useFactory() {
  const ctx = useContext(FactoryContext);
  if (!ctx) throw new Error('useFactory must be used inside <FactoryProvider>');
  return ctx;
}
