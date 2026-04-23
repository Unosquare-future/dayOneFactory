// Shared data model for DayOne Flow Factory.
// All data here is fictional — intended for design/demo purposes.

export const ARCHETYPES = [
  {
    id: 'rustic-rebel',
    name: 'Rustic Rebel',
    tagline: 'Weather-worn denim, leather that’s earned it, a quiet nonconformity.',
    palette: 'ph-7',
    pairs: ['raw-edge selvedge', 'oiled work boots', 'vintage flannel'],
    mood: 'ph-7',
  },
  {
    id: 'modern-muse',
    name: 'Modern Muse',
    tagline: 'Sharp silhouettes, soft fabrics, an instinct for the one perfect piece.',
    palette: 'ph-10',
    pairs: ['tailored wool trouser', 'silk crewneck', 'sculptural heel'],
    mood: 'ph-10',
  },
  {
    id: 'adventure-sport',
    name: 'Adventure Sport',
    tagline: 'Built to move. Fabrics that breathe. Nothing precious about any of it.',
    palette: 'ph-9',
    pairs: ['technical shell', 'merino base', 'trail-ready crossbody'],
    mood: 'ph-9',
  },
  {
    id: 'coastal-sport',
    name: 'Coastal Sport',
    tagline: 'Salt air, long afternoons, linen that gets better with every wash.',
    palette: 'ph-4',
    pairs: ['washed linen shirt', 'drawstring pant', 'suede loafer'],
    mood: 'ph-4',
  },
  {
    id: 'modern-prep',
    name: 'Modern Prep',
    tagline: 'Collegiate, but grown up. Cashmere with a little bit of swagger.',
    palette: 'ph-11',
    pairs: ['cable-knit cashmere', 'chino trouser', 'leather penny loafer'],
    mood: 'ph-11',
  },
  {
    id: 'boho-dreamer',
    name: 'Boho Dreamer',
    tagline: 'Soft layers, found objects, a wardrobe that tells stories.',
    palette: 'ph-8',
    pairs: ['hand-block cotton', 'vintage denim', 'beaded leather sandal'],
    mood: 'ph-8',
  },
  {
    id: 'quiet-classic',
    name: 'Quiet Classic',
    tagline: 'Nothing shouts. Everything fits. Five pieces that work for ten years.',
    palette: 'ph-5',
    pairs: ['white oxford', 'straight-leg denim', 'unlined trench'],
    mood: 'ph-5',
  },
  {
    id: 'studio-minimal',
    name: 'Studio Minimal',
    tagline: 'Architectural lines, one neutral, and a single thoughtful detail.',
    palette: 'ph-2',
    pairs: ['boxy tee', 'pleated wide-leg', 'leather derby'],
    mood: 'ph-2',
  },
];

export const VARIANTS = [
  {
    id: 'swipe',
    name: 'Style Shuffle',
    kind: 'Swipe',
    thumb: 'ph-3',
    tagline: 'Left is "not me." Right is "yes, please."',
    why: 'Fastest signal on mobile. Built for short attention, gut reactions, social-ad traffic.',
    traffic: 28,
    status: 'Live',
    metrics: { completion: 92, avgTime: '47s', signalDensity: 71, firstFix: 38 },
    accent: 'lime',
  },
  {
    id: 'chat',
    name: 'Stylist Chat',
    kind: 'Conversational AI',
    thumb: 'ph-8',
    tagline: 'Tell us what’s going on with your wardrobe. We’ll go from there.',
    why: 'For the 48% of clients who can’t articulate their own style. Warm, branching, patient.',
    traffic: 22,
    status: 'Live',
    metrics: { completion: 74, avgTime: '3m 12s', signalDensity: 94, firstFix: 46 },
    accent: 'teal',
  },
  {
    id: 'this-or-that',
    name: 'This or That',
    kind: 'Binary Pairs',
    thumb: 'ph-4',
    tagline: 'Eight pairs. No wrong answers. Mostly.',
    why: 'Shareable, low-effort, surprisingly high signal. Skews female 25–40.',
    traffic: 18,
    status: 'Live',
    metrics: { completion: 88, avgTime: '1m 08s', signalDensity: 78, firstFix: 41 },
    accent: 'teal',
  },
  {
    id: 'inspiration',
    name: 'Taste Transfer',
    kind: 'Inspiration',
    thumb: 'ph-10',
    tagline: 'Pick a mood. Drop a handle. We’ll read between the lines.',
    why: 'Near-zero effort, premium feel. Ideal for lapsed clients and fashion-forward newcomers.',
    traffic: 12,
    status: 'Live',
    metrics: { completion: 81, avgTime: '1m 34s', signalDensity: 86, firstFix: 49 },
    accent: 'navy',
  },
  {
    id: 'classic',
    name: 'Classic (Refined)',
    kind: 'Structured Quiz',
    thumb: 'ph-5',
    tagline: 'The original. Shorter now. Still the one some of us want.',
    why: 'Still the best fit for users who arrive wanting structure and certainty.',
    traffic: 14,
    status: 'Live',
    metrics: { completion: 69, avgTime: '4m 41s', signalDensity: 82, firstFix: 44 },
    accent: 'outline',
  },
  {
    id: 'builder',
    name: 'Outfit Builder',
    kind: 'Canvas',
    thumb: 'ph-6',
    tagline: 'Build the outfit you wish was in your closet.',
    why: 'Lowest completion, highest signal. Gold for re-engaging fashion-forward users.',
    traffic: 6,
    status: 'Draft',
    metrics: { completion: 41, avgTime: '5m 22s', signalDensity: 98, firstFix: 57 },
    accent: 'lime',
  },
];

export const VISITORS = [
  {
    id: 'maya',
    name: 'Maya',
    age: 23,
    channel: 'Paid social — Instagram',
    device: 'Mobile',
    session: 'First-time',
    signals: ['short sessions', 'high tap velocity', 'story-ad click-through', 'no search history'],
    recommend: 'swipe',
    confidence: 94,
    reasoning: [
      'Mobile-first, paid-social acquisition, short attention signals.',
      'No declared style vocabulary — avoid self-description traps.',
      'Visual-first, left/right mechanics match creative context.',
    ],
  },
  {
    id: 'robert',
    name: 'Robert',
    age: 54,
    channel: 'Organic search — Google',
    device: 'Desktop',
    session: 'First-time',
    signals: ['long query dwell', 'reads FAQ', 'scrolls slowly', 'returned after 2 days'],
    recommend: 'classic',
    confidence: 88,
    reasoning: [
      'Deliberate browser. Returns after reflection — wants structure.',
      'Desktop session, long dwell times — tolerant of longer format.',
      'Classic quiz provides the certainty this visitor is seeking.',
    ],
  },
  {
    id: 'priya',
    name: 'Priya',
    age: 38,
    channel: 'Email — winback',
    device: 'Mobile',
    session: 'Lapsed client (11 mo)',
    signals: ['prior style data on file', 'opened 3 of last 5 emails', 'skipped last two Fixes'],
    recommend: 'inspiration',
    confidence: 91,
    reasoning: [
      'Existing style graph — no need to re-ask the basics.',
      'Low-effort re-entry respects the relationship.',
      'Taste Transfer refreshes signal without the interrogation.',
    ],
  },
  {
    id: 'jordan',
    name: 'Jordan',
    age: 29,
    channel: 'Referral — friend link',
    device: 'Mobile',
    session: 'First-time',
    signals: [
      'arrived with friend’s archetype',
      'browsed 4 product pages before signup',
      'fashion-forward query patterns',
    ],
    recommend: 'builder',
    confidence: 79,
    reasoning: [
      'Fashion-forward behavioral pattern — will tolerate higher effort.',
      'Referral from high-signal friend — strong prior on taste.',
      'Builder captures gold-standard signal when they finish.',
    ],
  },
  {
    id: 'lena',
    name: 'Lena',
    age: 31,
    channel: 'Organic — TikTok',
    device: 'Mobile',
    session: 'First-time',
    signals: ['came from "can’t describe my style" creator post', 'long scroll, no click-through yet'],
    recommend: 'chat',
    confidence: 86,
    reasoning: [
      'Self-identified as unable to articulate style — open-ended chat shines here.',
      'Organic creator referral — warm, curious intent.',
      'Patience budget is high; depth of signal matters more than speed.',
    ],
  },
];

export const ROUTING_RULES = [
  { id: 'r1', when: 'Device is Mobile AND Channel is Paid Social', then: 'Route to Style Shuffle', weight: 0.78, status: 'on' },
  { id: 'r2', when: 'Session dwell > 40s on landing AND Desktop', then: 'Route to Classic (Refined)', weight: 0.64, status: 'on' },
  { id: 'r3', when: 'Lapsed client AND has prior style graph', then: 'Route to Taste Transfer', weight: 0.82, status: 'on' },
  { id: 'r4', when: 'Visitor expresses uncertainty ("I don’t know my style")', then: 'Route to Stylist Chat', weight: 0.71, status: 'on' },
  { id: 'r5', when: 'Referral traffic AND 3+ product page views', then: 'Route to Outfit Builder', weight: 0.58, status: 'draft' },
  { id: 'r6', when: 'Mid-flow engagement score drops below 0.35', then: 'Offer modality switch', weight: 0.44, status: 'on' },
];

export const RESULTS_BY_VARIANT = VARIANTS.map((v) => ({
  id: v.id,
  name: v.name,
  completion: v.metrics.completion,
  time: v.metrics.avgTime,
  signal: v.metrics.signalDensity,
  firstFix: v.metrics.firstFix,
  ltv: 180 + Math.round(v.metrics.signalDensity * 2.4 + v.metrics.firstFix * 1.1),
}));

// Swipe cards — card decks used by the Swipe variant
export const SWIPE_CARDS = [
  { id: 1, label: 'Oversized flannel, raw denim, scuffed boots', ph: 'ph-7', tags: ['rugged', 'layered', 'earth'] },
  { id: 2, label: 'Silk crewneck, wool trouser, low heel', ph: 'ph-10', tags: ['tailored', 'refined', 'ink'] },
  { id: 3, label: 'Technical shell, cropped legging, trail runner', ph: 'ph-9', tags: ['athletic', 'functional'] },
  { id: 4, label: 'Washed linen button-down, drawstring pant', ph: 'ph-4', tags: ['coastal', 'soft', 'warm'] },
  { id: 5, label: 'Cable cashmere, chino, penny loafer', ph: 'ph-11', tags: ['prep', 'collegiate'] },
  { id: 6, label: 'Hand-block cotton dress, beaded sandal', ph: 'ph-8', tags: ['boho', 'textural'] },
  { id: 7, label: 'White oxford, straight denim, trench', ph: 'ph-5', tags: ['classic', 'quiet'] },
  { id: 8, label: 'Boxy tee, pleated wide-leg, derby', ph: 'ph-2', tags: ['minimal', 'architectural'] },
  { id: 9, label: 'Corduroy overshirt, waffle henley, boots', ph: 'ph-1', tags: ['warm', 'worked-in'] },
  { id: 10, label: 'Matte black knit, relaxed trouser, slide', ph: 'ph-10', tags: ['muse', 'modern'] },
  { id: 11, label: 'Teal utility jacket, straight jean, white sneaker', ph: 'ph-4', tags: ['casual', 'fresh'] },
  { id: 12, label: 'Caramel suede skirt, cream knit, ankle boot', ph: 'ph-3', tags: ['warm', 'autumn'] },
];

export const TOT_PAIRS = [
  { q: 'Which one feels more like a Saturday?', a: { ph: 'ph-4', label: 'linen shirt on a porch' }, b: { ph: 'ph-7', label: 'flannel in the woods' } },
  { q: 'Pick the jacket you’d actually wear.', a: { ph: 'ph-9', label: 'technical shell' }, b: { ph: 'ph-11', label: 'wool overcoat' } },
  { q: 'On a first date …', a: { ph: 'ph-10', label: 'sharp, one detail' }, b: { ph: 'ph-8', label: 'soft, layered, a little story' } },
  { q: 'Shoes. Go.', a: { ph: 'ph-5', label: 'white sneaker' }, b: { ph: 'ph-7', label: 'worn leather boot' } },
  { q: 'Your closet’s dream fabric.', a: { ph: 'ph-2', label: 'matte wool' }, b: { ph: 'ph-3', label: 'washed suede' } },
  { q: 'Pattern energy?', a: { ph: 'ph-6', label: 'solid neutrals' }, b: { ph: 'ph-8', label: 'block-print everything' } },
  { q: 'Color that follows you home.', a: { ph: 'ph-4', label: 'teal + cream' }, b: { ph: 'ph-12', label: 'camel + ink' } },
  { q: 'Weekend morning.', a: { ph: 'ph-1', label: 'worn-in denim' }, b: { ph: 'ph-10', label: 'a single perfect knit' } },
];

export const MOOD_BOARDS = [
  { id: 'm1', ph: 'ph-4', title: 'Coastal, quiet', sub: 'linen, salt, long afternoons' },
  { id: 'm2', ph: 'ph-7', title: 'Workroom', sub: 'leather, raw edge, patina' },
  { id: 'm3', ph: 'ph-10', title: 'After hours', sub: 'ink, silk, one bold line' },
  { id: 'm4', ph: 'ph-11', title: 'Campus in fall', sub: 'cable knit, chinos, copper' },
  { id: 'm5', ph: 'ph-8', title: 'Garden in July', sub: 'block print, bead, terracotta' },
  { id: 'm6', ph: 'ph-9', title: 'Trailhead', sub: 'technical, breathable, moving' },
  { id: 'm7', ph: 'ph-2', title: 'White cube', sub: 'architectural, one neutral' },
  { id: 'm8', ph: 'ph-3', title: 'Golden hour', sub: 'warm suede, caramel, wool' },
  { id: 'm9', ph: 'ph-5', title: 'Library quiet', sub: 'oxford, trench, straight denim' },
];

export const CLASSIC_QS = [
  {
    q: 'Which best describes how you want to feel in your clothes?',
    opts: ['Pulled together and sharp', 'Soft and at ease', 'Sporty and ready', 'A little unexpected'],
  },
  {
    q: 'Where are you wearing most of your wardrobe?',
    opts: ['Work and client meetings', 'Studio, freelance, coffee shops', 'Kids, errands, real life', 'Travel and long weekends'],
  },
  { q: 'Pick a neutral you’d build around.', opts: ['Cream', 'Charcoal', 'Camel', 'Soft navy'] },
  {
    q: 'What are you missing right now?',
    opts: ['A great jacket', 'One perfect knit', 'Pants that actually fit', 'Something that feels like me'],
  },
  {
    q: 'Price you’re happiest paying for a staple item.',
    opts: ['Under $75', '$75–$150', '$150–$300', '$300+'],
  },
];

export const BUILDER_ITEMS = [
  { id: 'top-1', cat: 'Top', label: 'Silk crewneck — ink', ph: 'ph-10' },
  { id: 'top-2', cat: 'Top', label: 'Cashmere cable — cream', ph: 'ph-5' },
  { id: 'top-3', cat: 'Top', label: 'Flannel overshirt — rust', ph: 'ph-8' },
  { id: 'top-4', cat: 'Top', label: 'Boxy tee — matte black', ph: 'ph-2' },
  { id: 'bot-1', cat: 'Bottom', label: 'Wool trouser — charcoal', ph: 'ph-11' },
  { id: 'bot-2', cat: 'Bottom', label: 'Raw denim — indigo', ph: 'ph-7' },
  { id: 'bot-3', cat: 'Bottom', label: 'Pleated wide-leg — stone', ph: 'ph-5' },
  { id: 'bot-4', cat: 'Bottom', label: 'Drawstring linen — sand', ph: 'ph-4' },
  { id: 'sho-1', cat: 'Shoes', label: 'Leather derby — cognac', ph: 'ph-3' },
  { id: 'sho-2', cat: 'Shoes', label: 'White low-top sneaker', ph: 'ph-2' },
  { id: 'sho-3', cat: 'Shoes', label: 'Worn leather boot', ph: 'ph-7' },
  { id: 'sho-4', cat: 'Shoes', label: 'Suede loafer — teal', ph: 'ph-4' },
  { id: 'acc-1', cat: 'Layer', label: 'Unlined trench — oat', ph: 'ph-5' },
  { id: 'acc-2', cat: 'Layer', label: 'Wool overcoat — camel', ph: 'ph-11' },
  { id: 'acc-3', cat: 'Layer', label: 'Shell jacket — teal', ph: 'ph-9' },
  { id: 'acc-4', cat: 'Layer', label: 'Suede bomber — terracotta', ph: 'ph-8' },
];

/**
 * Deterministic archetype picker — simple heuristics per variant so each flow's
 * reveal feels earned rather than random.
 */
export function archetypeFor(flowId, payload) {
  if (flowId === 'swipe') {
    const tags = (payload?.liked || []).flatMap((c) => c.tags || []);
    if (tags.includes('tailored') || tags.includes('modern')) return 'modern-muse';
    if (tags.includes('rugged') || tags.includes('earth')) return 'rustic-rebel';
    if (tags.includes('coastal') || tags.includes('soft')) return 'coastal-sport';
    if (tags.includes('athletic')) return 'adventure-sport';
    if (tags.includes('boho')) return 'boho-dreamer';
    if (tags.includes('prep')) return 'modern-prep';
    if (tags.includes('minimal')) return 'studio-minimal';
    return 'quiet-classic';
  }
  if (flowId === 'chat') return 'modern-muse';
  if (flowId === 'this-or-that') return 'coastal-sport';
  if (flowId === 'inspiration') return payload?.archetypeId || 'boho-dreamer';
  if (flowId === 'classic') return 'quiet-classic';
  if (flowId === 'builder') return 'studio-minimal';
  return 'modern-muse';
}
