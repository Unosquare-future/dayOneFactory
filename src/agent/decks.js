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
  if (segment === 'All') {
    return inventory.filter((i) => i.category === 'Women' || i.category === 'Men');
  }
  return inventory.filter((i) => i.category === segment);
}

// -----------------------------------------------------------------------
// Swipe deck — 12 diverse items from the segment. Prefer items WITH an
// inventory photo; spread across subcategories + archetypes.
// -----------------------------------------------------------------------
export function buildSwipeDeck(inventory, segment, count = 12) {
  const pool = byCategory(inventory, segment);
  const withImage = pool.filter((i) => i.imageUrl);
  const withoutImage = pool.filter((i) => !i.imageUrl);

  // Round-robin across archetypes + subcategories so the 12 cards
  // aren't 8 identical tops.
  const picked = [];
  const used = new Set();

  function pickRound(list) {
    const byBucket = {};
    for (const i of list) {
      const key = `${i.archetypes?.[0] || 'x'}|${i.subcategory}`;
      if (!byBucket[key]) byBucket[key] = [];
      byBucket[key].push(i);
    }
    const buckets = Object.values(byBucket);
    let idx = 0;
    while (picked.length < count && buckets.some((b) => b.length > 0)) {
      const bucket = buckets[idx % buckets.length];
      idx += 1;
      if (bucket.length === 0) continue;
      const item = bucket.shift();
      if (used.has(item.id)) continue;
      used.add(item.id);
      picked.push(item);
    }
  }

  pickRound(withImage);
  if (picked.length < count) pickRound(withoutImage);

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

  const pickForArchetype = (archId, preferImage = true) => {
    const matches = pool.filter((i) => i.archetypes?.includes(archId));
    const withImg = matches.filter((i) => i.imageUrl);
    if (preferImage && withImg.length > 0)
      return withImg[Math.floor(Math.random() * withImg.length)];
    if (matches.length > 0)
      return matches[Math.floor(Math.random() * matches.length)];
    // Last-resort fallback: any item in segment
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
