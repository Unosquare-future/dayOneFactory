// Deck builders — resolve inventory-backed Swipe and This-or-That
// content from the live catalog, filtered by the user's chosen
// segment (Women / Men / Kids / All). Items with seeded Unsplash
// images are preferred so the agent-driven flow shows real photos;
// items without images still work via the editorial gradient.

// -----------------------------------------------------------------------
// Archetype → short style tags the agent can see + derive signal from
// -----------------------------------------------------------------------
const ARCHETYPE_TAGS = {
  'rustic-rebel': ['rugged', 'earth', 'worked-in'],
  'modern-muse': ['tailored', 'refined', 'edited'],
  'adventure-sport': ['athletic', 'functional'],
  'coastal-sport': ['coastal', 'soft', 'breezy'],
  'modern-prep': ['prep', 'collegiate'],
  'boho-dreamer': ['boho', 'textural'],
  'quiet-classic': ['classic', 'quiet', 'timeless'],
  'studio-minimal': ['minimal', 'architectural'],
};

function itemTags(item) {
  const arch = item.archetypes?.[0];
  const base = ARCHETYPE_TAGS[arch] || [];
  return [...new Set([...base, ...(item.tags || [])])];
}

function byCategory(inventory, segment) {
  return inventory.filter((i) => i.category === segment);
}

// -----------------------------------------------------------------------
// Swipe deck — up to 12 diverse items from the segment.
//
// Priorities, in order:
//   1. Items WITH real inventory photos always win — if there are any,
//      no-image items are excluded entirely (the UI is meant to feel
//      like a real shopping stream, not a placeholder grid).
//   2. Round-robin across archetype × subcategory buckets so the
//      agent's 12 picks span style + body part rather than piling up
//      on the same category.
//   3. If the segment has < 12 imaged items, cycle through the imaged
//      pool again so every card still lands a photo.
//   4. Only when a segment has ZERO imaged items do we fall back to
//      gradient-only items (the simulator surfaces a "photo pending"
//      editorial treatment in that case).
// -----------------------------------------------------------------------
export function buildSwipeDeck(inventory, segment, count = 12) {
  const pool = byCategory(inventory, segment);
  const withImage = pool.filter((i) => i.imageUrl);
  const source = withImage.length > 0 ? withImage : pool;

  const picked = [];
  const used = new Set();

  function pickRound(list, allowRepeat = false) {
    const byBucket = {};
    for (const i of list) {
      const key = `${i.archetypes?.[0] || 'x'}|${i.subcategory}`;
      if (!byBucket[key]) byBucket[key] = [];
      byBucket[key].push(i);
    }
    const buckets = Object.values(byBucket);
    let idx = 0;
    let guard = 0;
    while (picked.length < count && guard < buckets.length * count + 10) {
      const bucket = buckets[idx % buckets.length];
      idx += 1;
      guard += 1;
      if (!bucket || bucket.length === 0) continue;
      const item = bucket.shift();
      if (!allowRepeat && used.has(item.id)) continue;
      used.add(item.id);
      picked.push(item);
    }
  }

  // First pass — distinct items from the imaged source.
  pickRound(source);

  // Second pass — if the imaged pool is smaller than `count`, cycle
  // (allow repeats) so we still land 12 cards with photos rather than
  // back-filling from un-imaged items.
  if (picked.length < count && withImage.length > 0) {
    pickRound(withImage, true);
  }

  // Last-resort: pad from un-imaged items only if we started with zero
  // images for this segment.
  if (picked.length < count && withImage.length === 0) {
    pickRound(pool, true);
  }

  return picked.slice(0, count).map((item) => ({
    id: item.id,
    label: item.name,
    brand: item.brand,
    subcategory: item.subcategory,
    ph: item.ph,
    imageUrl: item.imageUrl || null,
    tags: itemTags(item),
    archetypes: item.archetypes || [],
  }));
}

// -----------------------------------------------------------------------
// This-or-That deck — contrast pairs across archetypes. Each pair pulls
// one item from each of two opposing archetypes to make the pick a
// real signal rather than a toss-up.
// -----------------------------------------------------------------------
const CONTRAST_TEMPLATES = [
  {
    q: 'Which one feels more like a Saturday?',
    a: 'coastal-sport',
    b: 'rustic-rebel',
  },
  {
    q: "Pick the jacket you'd actually wear.",
    a: 'adventure-sport',
    b: 'modern-prep',
  },
  {
    q: "On a first date \u2026",
    a: 'modern-muse',
    b: 'boho-dreamer',
  },
  {
    q: 'Shoes. Go.',
    a: 'quiet-classic',
    b: 'rustic-rebel',
  },
  {
    q: "Your closet's dream fabric.",
    a: 'studio-minimal',
    b: 'boho-dreamer',
  },
  {
    q: 'Pattern energy?',
    a: 'studio-minimal',
    b: 'boho-dreamer',
  },
  {
    q: 'Color that follows you home.',
    a: 'coastal-sport',
    b: 'modern-prep',
  },
  {
    q: 'Weekend morning.',
    a: 'rustic-rebel',
    b: 'modern-muse',
  },
];

export function buildTotDeck(inventory, segment, count = 8) {
  const pool = byCategory(inventory, segment);
  const hasAnyImage = pool.some((i) => i.imageUrl);

  // Prefer items with an inventory photo. For archetypes where the
  // segment has no imaged match, fall back to a similarly-toned
  // archetype's imaged item before giving up.
  const pickForArchetype = (archId) => {
    const matches = pool.filter((i) => i.archetypes?.includes(archId));
    const withImg = matches.filter((i) => i.imageUrl);
    if (withImg.length > 0)
      return withImg[Math.floor(Math.random() * withImg.length)];
    // If we have imaged items SOMEWHERE in the segment, use one of
    // them rather than a gradient — the UX honesty cost of a less-
    // archetype-pure match is smaller than showing a blank tile.
    if (hasAnyImage) {
      const anyImg = pool.filter((i) => i.imageUrl);
      return anyImg[Math.floor(Math.random() * anyImg.length)];
    }
    if (matches.length > 0)
      return matches[Math.floor(Math.random() * matches.length)];
    return pool[Math.floor(Math.random() * pool.length)] || null;
  };

  const pairs = [];
  for (const tpl of CONTRAST_TEMPLATES) {
    const a = pickForArchetype(tpl.a);
    const b = pickForArchetype(tpl.b);
    if (!a || !b || a.id === b.id) continue;
    pairs.push({
      q: tpl.q,
      a: {
        id: a.id,
        label: a.name,
        brand: a.brand,
        ph: a.ph,
        imageUrl: a.imageUrl || null,
        archetype: tpl.a,
      },
      b: {
        id: b.id,
        label: b.name,
        brand: b.brand,
        ph: b.ph,
        imageUrl: b.imageUrl || null,
        archetype: tpl.b,
      },
    });
    if (pairs.length >= count) break;
  }
  return pairs;
}
