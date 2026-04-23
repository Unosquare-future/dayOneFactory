// Fit Twin — data module.
//
// Three seed lists that power the playable Fit Twin showcase:
//   - CLOSET_CATALOG  — real-ish garments a visitor might "name" in L1
//   - FIT_TWINS       — curated anonymized fit profiles for L2
//   - SHARPEN_PAIRS   — disambiguation question pairs for L3
//
// The fit catalog is intentionally small but plausible. In production
// it would be joined against the garment-measurements + kept/returned
// dataset Stitch Fix already owns — which is the whole moat.

// ----- Closet catalog (Layer 1) -----------------------------------------
// Each garment knows the size profile it would give a visitor, so when
// they say "I own the Levi's 501 in 29" we can translate that into a
// measurement posture we can use across categories.
//
// sizeProfile shape: { Tops, Bottoms, Outerwear, Shoes }
// Values are common clothing sizes. The showcase treats this as fact;
// in production the translation is fit-model-driven.

export const CLOSET_CATALOG = [
  {
    id: 'g001',
    brand: "Levi's",
    name: "501 Original",
    category: 'Bottoms',
    sizes: ['25', '26', '27', '28', '29', '30', '31', '32'],
    keywords: ['levi', '501', 'jean', 'denim'],
    sizeProfile: {
      Tops: 'S',
      Bottoms: '29',
      Outerwear: 'S/M',
      Shoes: '7.5',
    },
  },
  {
    id: 'g002',
    brand: 'Madewell',
    name: 'Cali Demi-Boot Jean',
    category: 'Bottoms',
    sizes: ['24', '25', '26', '27', '28', '29', '30'],
    keywords: ['madewell', 'cali', 'demi', 'boot', 'jean'],
    sizeProfile: { Tops: 'S', Bottoms: '27', Outerwear: 'S', Shoes: '7' },
  },
  {
    id: 'g003',
    brand: 'Everlane',
    name: 'The Perform Legging',
    category: 'Bottoms',
    sizes: ['XS', 'S', 'M', 'L'],
    keywords: ['everlane', 'perform', 'legging'],
    sizeProfile: { Tops: 'S', Bottoms: 'S', Outerwear: 'S', Shoes: '7' },
  },
  {
    id: 'g004',
    brand: 'J.Crew',
    name: 'Cashmere Crewneck',
    category: 'Tops',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    keywords: ['jcrew', 'j crew', 'cashmere', 'crewneck'],
    sizeProfile: { Tops: 'M', Bottoms: '28', Outerwear: 'M', Shoes: '8' },
  },
  {
    id: 'g005',
    brand: 'Uniqlo',
    name: 'Airism Cotton T',
    category: 'Tops',
    sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL'],
    keywords: ['uniqlo', 'airism', 'cotton', 'tee', 't-shirt'],
    sizeProfile: { Tops: 'M', Bottoms: '30', Outerwear: 'M', Shoes: '9' },
  },
  {
    id: 'g006',
    brand: 'Madewell',
    name: 'Whisper Cotton V-Neck',
    category: 'Tops',
    sizes: ['XXS', 'XS', 'S', 'M', 'L'],
    keywords: ['madewell', 'whisper', 'v-neck', 'vneck'],
    sizeProfile: { Tops: 'S', Bottoms: '27', Outerwear: 'S', Shoes: '7' },
  },
  {
    id: 'g007',
    brand: 'Reformation',
    name: 'Cynthia High Rise Jean',
    category: 'Bottoms',
    sizes: ['23', '24', '25', '26', '27', '28', '29'],
    keywords: ['reformation', 'cynthia', 'high rise', 'jean'],
    sizeProfile: { Tops: 'XS', Bottoms: '25', Outerwear: 'XS', Shoes: '6.5' },
  },
  {
    id: 'g008',
    brand: 'Banana Republic',
    name: 'Italian Wool Sloan Pant',
    category: 'Bottoms',
    sizes: ['00', '0', '2', '4', '6', '8', '10'],
    keywords: ['banana', 'sloan', 'wool', 'trouser', 'pant'],
    sizeProfile: { Tops: 'S', Bottoms: '6', Outerwear: 'S', Shoes: '7.5' },
  },
  {
    id: 'g009',
    brand: 'Aritzia',
    name: 'Babaton Sculpt Knit Tee',
    category: 'Tops',
    sizes: ['XXS', 'XS', 'S', 'M', 'L'],
    keywords: ['aritzia', 'babaton', 'sculpt', 'knit', 'tee'],
    sizeProfile: { Tops: 'S', Bottoms: '27', Outerwear: 'S', Shoes: '7' },
  },
  {
    id: 'g010',
    brand: 'Everlane',
    name: 'The Way-High Jean',
    category: 'Bottoms',
    sizes: ['24', '25', '26', '27', '28', '29', '30'],
    keywords: ['everlane', 'way high', 'high rise', 'jean'],
    sizeProfile: { Tops: 'M', Bottoms: '28', Outerwear: 'M', Shoes: '8' },
  },
  {
    id: 'g011',
    brand: 'Patagonia',
    name: "Better Sweater 1/4-Zip",
    category: 'Tops',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    keywords: ['patagonia', 'better sweater', 'fleece'],
    sizeProfile: { Tops: 'M', Bottoms: '30', Outerwear: 'M', Shoes: '9' },
  },
  {
    id: 'g012',
    brand: 'Vuori',
    name: 'Performance Jogger',
    category: 'Bottoms',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    keywords: ['vuori', 'jogger', 'performance'],
    sizeProfile: { Tops: 'M', Bottoms: 'M', Outerwear: 'M', Shoes: '9' },
  },
  {
    id: 'g013',
    brand: 'Theory',
    name: 'Good Wool Blazer',
    category: 'Outerwear',
    sizes: ['0', '2', '4', '6', '8', '10'],
    keywords: ['theory', 'good wool', 'blazer'],
    sizeProfile: { Tops: 'S', Bottoms: '26', Outerwear: '4', Shoes: '7' },
  },
  {
    id: 'g014',
    brand: 'Outdoor Voices',
    name: 'Exercise Dress',
    category: 'Dresses',
    sizes: ['XS', 'S', 'M', 'L'],
    keywords: ['outdoor voices', 'exercise dress', 'ov'],
    sizeProfile: { Tops: 'S', Bottoms: 'S', Outerwear: 'S', Shoes: '7.5' },
  },
  {
    id: 'g015',
    brand: 'Bonobos',
    name: 'Stretch Washed Chino',
    category: 'Bottoms',
    sizes: ['30', '32', '34', '36', '38'],
    keywords: ['bonobos', 'chino', 'washed'],
    sizeProfile: { Tops: 'M', Bottoms: '32', Outerwear: 'M', Shoes: '10' },
  },
  {
    id: 'g016',
    brand: 'Nike',
    name: 'Air Force 1',
    category: 'Shoes',
    sizes: ['6', '7', '8', '9', '10', '11'],
    keywords: ['nike', 'air force'],
    sizeProfile: { Tops: 'M', Bottoms: 'M', Outerwear: 'M', Shoes: '8' },
  },
];

// ----- Fit Twins (Layer 2) ----------------------------------------------
// Curated anonymized profiles. Each represents a cluster of real clients
// with overlapping size + fit preference. The `delta` is what choosing
// this twin teaches the Fit Twin model about the user.

// Each twin exposes a `summary` that encodes height for internal
// filtering math (see pickRelevantTwins in OnboardingSimulator) and
// a display-only `bodyType` the UI shows as the twin's headline.
// Height is captured once in Essentials and never shown again on the
// twin cards — it would just repeat what the user already told us.

export const FIT_TWINS = [
  {
    id: 'ft01',
    label: 'Twin A',
    summary: '5\'6", athletic build',
    bodyType: 'Athletic build',
    blurb: 'Prefers slim through the hip, loves high-rise. Goes one size up in merino, true-to-size in denim.',
    signals: ['athletic', 'slim hip', 'high-rise', 'TTS denim'],
    ph: 'ph-4',
  },
  {
    id: 'ft02',
    label: 'Twin B',
    summary: '5\'8", straight build',
    bodyType: 'Straight build',
    blurb: 'Lives in relaxed silhouettes. Long torso — sizes up in tops, down in bottoms. Avoids anything cropped.',
    signals: ['straight', 'long torso', 'relaxed', 'no crop'],
    ph: 'ph-5',
  },
  {
    id: 'ft03',
    label: 'Twin C',
    summary: '5\'4", hourglass',
    bodyType: 'Hourglass',
    blurb: 'Tailored at the waist, easy through the bust and hip. Buys vintage and tailors modern.',
    signals: ['hourglass', 'tailored waist', 'easy bust', 'easy hip'],
    ph: 'ph-8',
  },
  {
    id: 'ft04',
    label: 'Twin D',
    summary: '5\'10", lean',
    bodyType: 'Lean & long',
    blurb: 'Long everything — inseam, sleeves, torso. Gets bottoms from men\'s department, tops from women\'s.',
    signals: ['long inseam', 'long sleeve', 'lean', 'cross-shops'],
    ph: 'ph-10',
  },
  {
    id: 'ft05',
    label: 'Twin E',
    summary: '5\'5", curvy',
    bodyType: 'Curvy',
    blurb: 'Needs real seat and thigh room. Loves stretch denim, avoids stiff wovens. True-to-size up top.',
    signals: ['curvy', 'real seat', 'stretch denim', 'TTS top'],
    ph: 'ph-11',
  },
  {
    id: 'ft06',
    label: 'Twin F',
    summary: '5\'2", petite',
    bodyType: 'Petite frame',
    blurb: 'Petite proportions — short torso, short inseam. Buys petite-line where possible, tailors where not.',
    signals: ['petite', 'short torso', 'short inseam', 'tailors'],
    ph: 'ph-3',
  },
];

// ----- Sharpen pairs (Layer 3) ------------------------------------------
// Dynamic-feeling disambiguators. The writeup's pitch is that the agent
// generates these based on actual model uncertainty. For the showcase we
// curate 6 pairs and pick 2 at random per session so it feels fresh.

export const SHARPEN_PAIRS = [
  {
    id: 'sp01',
    eyebrow: 'Your fit twins vary on sleeve length',
    q: 'Are your wrists closer to …',
    a: { label: 'Just past the wrist bone', hint: '— standard sleeve', ph: 'ph-5' },
    b: { label: 'Covering half your hand', hint: '— long-sleeve preferred', ph: 'ph-7' },
  },
  {
    id: 'sp02',
    eyebrow: 'One thing we\'re uncertain about',
    q: 'When you buy denim, you usually …',
    a: { label: 'Know your exact size', hint: '— same cut every time', ph: 'ph-10' },
    b: { label: 'Try 2-3 sizes in store', hint: '— never sure', ph: 'ph-2' },
  },
  {
    id: 'sp03',
    eyebrow: 'Last one to refine the signal',
    q: 'Hemlines — you lean …',
    a: { label: 'Cropped or ankle-grazing', hint: '— shows the ankle', ph: 'ph-4' },
    b: { label: 'Full-length or pooled', hint: '— breaks at the shoe', ph: 'ph-11' },
  },
  {
    id: 'sp04',
    eyebrow: 'Your twins split on this',
    q: 'Tops fit best when they …',
    a: { label: 'Skim the torso', hint: '— close but not tight', ph: 'ph-6' },
    b: { label: 'Drape over', hint: '— relaxed with movement', ph: 'ph-1' },
  },
  {
    id: 'sp05',
    eyebrow: 'One quick refinement',
    q: 'Rise preference runs …',
    a: { label: 'High — at the waist', hint: '— classic high-rise', ph: 'ph-7' },
    b: { label: 'Mid — below the belly button', hint: '— relaxed mid', ph: 'ph-3' },
  },
  {
    id: 'sp06',
    eyebrow: 'Almost locked in',
    q: 'Shoulders — you …',
    a: { label: 'Need extra room', hint: '— boxy, broad', ph: 'ph-9' },
    b: { label: 'Prefer fitted', hint: '— narrow, structured', ph: 'ph-11' },
  },
];

export const SHARPEN_COUNT = 2;

// ----- Accuracy ladder --------------------------------------------------
// The canonical mapping between "how much has the user done" and
// "how accurate is the resulting size profile". These numbers are the
// writeup's stated claims — surfaced prominently in the UI so the
// value exchange is legible.

export const ACCURACY_LADDER = {
  none: 0,
  essentialsDone: 40,  // segment + height + shoe gives us a coarse posture
  closetOne: 80,
  closetTwo: 85,
  fitTwinPicked: 90,
  sharpenDone: 95,
  arDone: 98,
};

// ----- Essentials (Layer 00) --------------------------------------------
// The fit-twin prerequisite: gender / shopping segment, height, shoe
// size. These are cheap to ask and unlock segment-aware inventory
// filtering for every downstream variant (Swipe deck, This-or-That
// pairs, Budget previews).

export const ESSENTIALS_CONFIG = {
  segments: [
    { id: 'Women', label: 'Women', note: "Women's clothing" },
    { id: 'Men', label: 'Men', note: "Men's clothing" },
    { id: 'Kids', label: 'Kids', note: "Kids' clothing" },
  ],
  // Heights in inches → we render nicely and use the raw inches for
  // downstream measurement math (MediaPipe Pose scaling).
  heightInches: {
    min: 48, // 4'0"
    max: 80, // 6'8"
    default: 66, // 5'6"
  },
  shoeSizes: {
    Women: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '11', '12'],
    Men: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13', '14'],
    Kids: ['10T', '11T', '12T', '13T', '1', '2', '3', '4', '5', '6'],
  },
};

/** Format inches as a feet/inches string: 66 → "5'6\"". */
export function formatHeight(totalInches) {
  const ft = Math.floor(totalInches / 12);
  const inch = totalInches % 12;
  return `${ft}'${inch}"`;
}

// ----- Tailor-precision method -------------------------------------------
// We use MediaPipe Pose Landmarker (Google, Apache 2.0) for the opt-in
// tailor-level scan. It runs entirely in the browser via WASM and
// returns 33 body keypoints — from which we derive shoulder width,
// torso length, and inseam using the user's height as the physical
// reference. No SaaS, no per-scan cost, no PII leaves the tab except
// the one frame we ship to the agent for vision-based sanity-check.

export const TAILOR_METHOD = {
  name: 'MediaPipe Pose Landmarker',
  vendor: 'Google (Apache 2.0)',
  accuracy: 98,
  runtime: 'browser · WASM',
};

// Friendly labels for the layer sidebar / progress moments.
export const LAYER_META = [
  {
    id: 'essentials',
    n: '00',
    title: 'Essentials',
    sub: 'Gender, height, shoe size. 15 seconds.',
    accuracy: 40,
    required: true,
    time: '15s',
  },
  {
    id: 'closet',
    n: '01',
    title: 'Closet anchor',
    sub: 'Name one thing that fits. 30 seconds.',
    accuracy: 80,
    required: true,
    time: '30s',
  },
  {
    id: 'twins',
    n: '02',
    title: 'Meet your Fit Twins',
    sub: 'Pick the client closest to you.',
    accuracy: 90,
    required: false,
    time: '60s',
  },
  {
    id: 'sharpen',
    n: '03',
    title: 'Sharpen the signal',
    sub: 'Two quick disambiguators.',
    accuracy: 95,
    required: false,
    time: '30s',
  },
  {
    id: 'ar',
    n: '04',
    title: 'Tailor-level precision',
    sub: 'Opt-in pose scan via MediaPipe.',
    accuracy: 98,
    required: false,
    time: '60s',
  },
  {
    id: 'budget',
    n: '05',
    title: 'Style allowance',
    sub: 'Budget & Fix size — folded in.',
    accuracy: null,
    required: true,
    time: '20s',
  },
];
