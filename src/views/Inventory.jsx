// Inventory — catalog browser across Women / Men / Kids.
// ~200 SKUs with subcategory filter, archetype filter, search, sort,
// in-stock toggle, price range, and a detail modal per item.

import React from 'react';
import {
  Badge,
  Button,
  Card,
  Eyebrow,
  Icon,
  Modal,
  SectionHead,
  Segmented,
  Toggle,
  cx,
  useState,
} from '../ui.jsx';
import { useFactory } from '../state.jsx';
import { CATEGORIES, SUBCATEGORIES, stockTotals } from '../inventory.js';
import { ARCHETYPES } from '../data.js';

// -----------------------------------------------------------------------
// ItemImage — real photo when we have one, editorial gradient fallback
// otherwise. Kept as a separate component so the fallback, loading
// state, and error handling live in one place.
// -----------------------------------------------------------------------
function ItemImage({ item, className = '', children, gradientClass }) {
  const [failed, setFailed] = useState(false);
  const showImage = item.imageUrl && !failed;
  return (
    <div
      className={cx(
        'relative overflow-hidden',
        // fall back to the gradient placeholder if no image
        showImage ? 'bg-surface-high' : cx('ph-tex', gradientClass || item.ph),
        className,
      )}
    >
      {showImage && (
        <img
          src={item.imageUrl}
          alt={`${item.brand} ${item.name}`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy/35 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}

// -----------------------------------------------------------------------
// Item card — one SKU tile
// -----------------------------------------------------------------------
function ItemCard({ item, onOpen }) {
  const statusTone =
    item.status === 'Sold out'
      ? 'draft'
      : item.status === 'Low stock'
        ? 'lime'
        : 'teal';
  return (
    <button
      onClick={() => onOpen(item)}
      className="text-left group flex flex-col bg-surface-lowest border border-outline-variant rounded hover:border-navy transition-colors"
    >
      <ItemImage item={item} className="aspect-[3/4] rounded-t">
        <div className="absolute top-2 right-2">
          <Badge tone={statusTone}>{item.status}</Badge>
        </div>
        <div className="absolute bottom-2 left-2 right-2 text-white">
          <div className="type-eyebrow opacity-80">{item.brand}</div>
          <div className="text-[13px] font-semibold leading-tight mt-1 line-clamp-2">
            {item.name}
          </div>
        </div>
      </ItemImage>
      <div className="p-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="type-eyebrow text-ink-soft">{item.subcategory}</div>
          <div className="text-[12px] text-ink-soft mt-1 truncate">
            {item.colorway} · {item.material}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[14px] text-navy font-bold tabular-nums">
            ${item.price}
          </div>
          <div className="text-[10px] text-ink-soft font-bold uppercase tracking-[0.08em] tabular-nums mt-1">
            {item.stock} in stock
          </div>
        </div>
      </div>
    </button>
  );
}

// -----------------------------------------------------------------------
// Item detail modal
// -----------------------------------------------------------------------
function ItemModal({ item, onClose, onAdjust }) {
  if (!item) return null;
  const archetypes = ARCHETYPES.filter((a) => item.archetypes.includes(a.id));
  return (
    <Modal open={!!item} onClose={onClose} className="w-full max-w-[780px]">
      <div className="grid md:grid-cols-[320px_1fr]">
        <ItemImage
          item={item}
          className="aspect-[3/4] md:aspect-auto md:min-h-[460px]"
        >
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="type-eyebrow opacity-80">{item.brand}</div>
            <div className="text-[22px] font-semibold leading-tight mt-1">
              {item.name}
            </div>
          </div>
        </ItemImage>
        <div className="p-6 md:p-8 flex flex-col max-h-[92vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Eyebrow>
                {item.category} · {item.subcategory}
              </Eyebrow>
              <div className="type-headline-md text-navy leading-tight mt-2">
                ${item.price}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded hover:bg-surface-base flex items-center justify-center text-navy"
            >
              <Icon name="x" />
            </button>
          </div>

          <div className="mt-5 space-y-3 text-[13.5px] text-navy">
            <div className="flex">
              <span className="type-eyebrow text-ink-soft w-28 flex-shrink-0 pt-1">
                sku
              </span>
              <span className="tabular-nums">{item.id}</span>
            </div>
            <div className="flex">
              <span className="type-eyebrow text-ink-soft w-28 flex-shrink-0 pt-1">
                material
              </span>
              <span>{item.material}</span>
            </div>
            <div className="flex">
              <span className="type-eyebrow text-ink-soft w-28 flex-shrink-0 pt-1">
                colorway
              </span>
              <span>{item.colorway}</span>
            </div>
            <div className="flex">
              <span className="type-eyebrow text-ink-soft w-28 flex-shrink-0 pt-1">
                sizes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {item.sizes.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-1 rounded border border-outline-variant bg-surface text-[11px] font-bold tabular-nums"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-outline-variant">
            <Eyebrow className="mb-3">Archetype fit</Eyebrow>
            <div className="space-y-2">
              {archetypes.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 p-2.5 rounded border border-outline-variant bg-surface"
                >
                  <span className={cx('w-6 h-7 rounded-sm ph-tex flex-shrink-0', a.palette)} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] text-navy font-semibold">{a.name}</div>
                    <div className="text-[11px] text-ink-soft italic truncate">
                      {a.tagline}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-outline-variant flex items-center justify-between">
            <div>
              <Eyebrow>Stock on hand</Eyebrow>
              <div className="text-[1.5rem] text-navy font-bold leading-none mt-2 tabular-nums">
                {item.stock}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] mt-2">
                <Badge
                  tone={
                    item.status === 'Sold out'
                      ? 'draft'
                      : item.status === 'Low stock'
                        ? 'lime'
                        : 'teal'
                  }
                >
                  {item.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAdjust(item.id, -1)}
                className="w-9 h-9 rounded border border-outline-variant text-navy hover:border-navy transition-colors flex items-center justify-center"
                aria-label="Decrement stock"
              >
                <Icon name="x" size={14} />
              </button>
              <button
                onClick={() => onAdjust(item.id, 1)}
                className="w-9 h-9 rounded border border-outline-variant text-navy hover:border-navy transition-colors flex items-center justify-center"
                aria-label="Increment stock"
              >
                <Icon name="plus" size={14} />
              </button>
              <Button variant="primary" onClick={onClose}>
                <Icon name="sparkle" /> Close
              </Button>
            </div>
          </div>

          {item.imageMeta && (
            <div className="mt-5 pt-4 border-t border-outline-variant text-[11px] text-ink-soft leading-relaxed">
              Photo by{' '}
              <a
                href={item.imageMeta.photographerUrl}
                target="_blank"
                rel="noreferrer"
                className="text-navy font-semibold hover:underline"
              >
                {item.imageMeta.photographer}
              </a>{' '}
              on Unsplash.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// -----------------------------------------------------------------------
// KPI strip
// -----------------------------------------------------------------------
function KpiStrip({ totals, categoryCounts }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      <Card className="p-5">
        <Eyebrow>Total SKUs</Eyebrow>
        <div className="text-[2.25rem] font-bold text-navy leading-none mt-3 tabular-nums">
          {totals.total}
        </div>
        <div className="type-eyebrow text-ink-soft mt-2">across 3 segments</div>
      </Card>
      <Card className="p-5">
        <Eyebrow>In stock</Eyebrow>
        <div className="text-[2.25rem] font-bold text-teal-500 leading-none mt-3 tabular-nums">
          {totals.inStock}
        </div>
        <div className="type-eyebrow text-ink-soft mt-2">
          {Math.round((totals.inStock / totals.total) * 100)}% of catalog
        </div>
      </Card>
      <Card className="p-5">
        <Eyebrow>Low stock</Eyebrow>
        <div className="text-[2.25rem] font-bold text-lime-700 leading-none mt-3 tabular-nums">
          {totals.low}
        </div>
        <div className="type-eyebrow text-ink-soft mt-2">
          {totals.out > 0 ? `${totals.out} sold out` : 'none sold out'}
        </div>
      </Card>
      <Card className="p-5">
        <Eyebrow>Avg price</Eyebrow>
        <div className="text-[2.25rem] font-bold text-navy leading-none mt-3 tabular-nums">
          ${totals.avgPrice}
        </div>
        <div className="type-eyebrow text-ink-soft mt-2">list value</div>
      </Card>
      <Card className="p-5 col-span-2 md:col-span-1">
        <Eyebrow>Segment mix</Eyebrow>
        <div className="mt-3 space-y-1.5">
          {CATEGORIES.map((c) => (
            <div key={c} className="flex items-center justify-between">
              <span className="text-[12px] text-ink-soft">{c}</span>
              <span className="text-[13px] text-navy font-bold tabular-nums">
                {categoryCounts[c] || 0}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// -----------------------------------------------------------------------
// Main view
// -----------------------------------------------------------------------
export default function InventoryView() {
  const { inventory, adjustStock } = useFactory();
  const [category, setCategory] = useState('Women');
  const [subcategory, setSubcategory] = useState('All');
  const [archetype, setArchetype] = useState('all');
  const [query, setQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [activeId, setActiveId] = useState(null);
  // Re-read active item from live inventory so stock edits reflect immediately.
  const active = activeId ? inventory.find((i) => i.id === activeId) : null;

  const byCategory = inventory.filter((i) => i.category === category);
  const filtered = byCategory
    .filter((i) => subcategory === 'All' || i.subcategory === subcategory)
    .filter((i) => archetype === 'all' || i.archetypes.includes(archetype))
    .filter((i) => !inStockOnly || i.status !== 'Sold out')
    .filter((i) => {
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        i.name.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q) ||
        i.material.toLowerCase().includes(q) ||
        i.colorway.toLowerCase().includes(q)
      );
    });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'stock') return b.stock - a.stock;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const totals = stockTotals(inventory);
  const categoryCounts = CATEGORIES.reduce((acc, c) => {
    acc[c] = inventory.filter((i) => i.category === c).length;
    return acc;
  }, {});

  const subcatList = ['All', ...SUBCATEGORIES[category]];

  function resetFilters() {
    setSubcategory('All');
    setArchetype('all');
    setQuery('');
    setInStockOnly(false);
    setSortBy('featured');
  }

  // Reset subcategory when category changes so we don't leave a stale filter
  React.useEffect(() => {
    if (subcategory !== 'All' && !SUBCATEGORIES[category].includes(subcategory)) {
      setSubcategory('All');
    }
  }, [category]);

  return (
    <div className="px-6 md:px-10 py-12 max-w-[1400px] mx-auto">
      <SectionHead
        eyebrow="Inventory / catalog"
        title="What’s in the closet."
        sub="Two hundred curated SKUs across Women, Men, and Kids — the raw material every variant pulls from. Filter by archetype to see what fits each style signature."
      />

      <KpiStrip totals={totals} categoryCounts={categoryCounts} />

      {/* Category switcher */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-surface-base rounded border border-outline-variant">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cx(
                'px-4 py-2 rounded text-[12px] uppercase tracking-[0.08em] font-bold transition-colors',
                category === c
                  ? 'bg-navy text-white'
                  : 'text-ink-soft hover:text-navy',
              )}
            >
              {c} · {categoryCounts[c] || 0}
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={resetFilters}>
          <Icon name="back" /> Reset filters
        </Button>
      </div>

      {/* Filter bar */}
      <Card className="p-5 mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2 bg-surface-lowest border border-outline-variant rounded px-3 py-2 focus-within:border-teal">
              <Icon name="search" size={16} className="text-ink-soft" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, brand, material, color…"
                className="flex-1 bg-transparent text-[13px] placeholder:text-outline"
                style={{ boxShadow: 'none' }}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-ink-soft hover:text-navy"
                  aria-label="Clear"
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="type-eyebrow text-ink-soft">In stock</span>
            <Toggle on={inStockOnly} onChange={setInStockOnly} size="sm" />
          </div>
          <Segmented
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'featured', label: 'Featured' },
              { value: 'name', label: 'Name' },
              { value: 'price-asc', label: '$ ↑' },
              { value: 'price-desc', label: '$ ↓' },
              { value: 'stock', label: 'Stock' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <div>
            <Eyebrow className="mb-2">Subcategory</Eyebrow>
            <div className="flex flex-wrap gap-1.5">
              {subcatList.map((s) => {
                const count =
                  s === 'All'
                    ? byCategory.length
                    : byCategory.filter((i) => i.subcategory === s).length;
                return (
                  <button
                    key={s}
                    onClick={() => setSubcategory(s)}
                    className={cx(
                      'px-3 py-1.5 rounded text-[11px] uppercase tracking-[0.08em] font-bold border transition-colors',
                      subcategory === s
                        ? 'bg-teal text-navy border-teal'
                        : 'bg-surface-lowest text-ink-soft border-outline-variant hover:border-navy',
                    )}
                  >
                    {s} · {count}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Eyebrow className="mb-2">Archetype affinity</Eyebrow>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setArchetype('all')}
                className={cx(
                  'px-3 py-1.5 rounded text-[11px] uppercase tracking-[0.08em] font-bold border transition-colors',
                  archetype === 'all'
                    ? 'bg-navy text-white border-navy'
                    : 'bg-surface-lowest text-ink-soft border-outline-variant hover:border-navy',
                )}
              >
                All
              </button>
              {ARCHETYPES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setArchetype(a.id)}
                  className={cx(
                    'flex items-center gap-2 px-3 py-1.5 rounded text-[11px] uppercase tracking-[0.08em] font-bold border transition-colors',
                    archetype === a.id
                      ? 'bg-navy text-white border-navy'
                      : 'bg-surface-lowest text-ink-soft border-outline-variant hover:border-navy',
                  )}
                >
                  <span className={cx('w-2.5 h-2.5 rounded-sm ph-tex', a.palette)} />
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-baseline justify-between mb-4">
        <Eyebrow>{sorted.length} of {byCategory.length} items</Eyebrow>
      </div>

      {sorted.length === 0 ? (
        <Card className="p-12 text-center">
          <Eyebrow className="text-ink-soft">Nothing matches</Eyebrow>
          <p className="type-body-md text-ink-soft mt-3 max-w-md mx-auto">
            Try widening the filters, clearing the search, or disabling the
            in-stock toggle.
          </p>
          <div className="mt-5">
            <Button variant="secondary" onClick={resetFilters}>
              <Icon name="back" /> Reset filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.map((item) => (
            <ItemCard key={item.id} item={item} onOpen={(it) => setActiveId(it.id)} />
          ))}
        </div>
      )}

      <div className="mt-16 pt-8 border-t border-outline-variant text-[11px] text-ink-soft font-bold uppercase tracking-[0.12em] flex items-center justify-between">
        <span>Dayone / Inventory / v1.4</span>
        <span>{totals.total} SKUs · catalog refresh weekly</span>
      </div>

      <ItemModal item={active} onClose={() => setActiveId(null)} onAdjust={adjustStock} />
    </div>
  );
}
