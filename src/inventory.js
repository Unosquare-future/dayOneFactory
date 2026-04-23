// DayOne Flow Factory — limited inventory catalog.
//
// ~200 fictional items across Women / Men / Kids, curated with realistic
// subcategories, materials, price bands, colorways, and archetype affinities.
// Every item maps to one of the editorial `ph-*` placeholder palettes so
// the whole app reads as one composed look.
//
// Item shape:
//   {
//     id, name, brand, category, subcategory, material,
//     colorway, ph, price, sizes, tags, archetypes, stock
//   }
//
// `archetypes` maps to ARCHETYPES in data.js; the inventory view uses it
// to filter and the builder flow uses it to populate realistic looks.

// ----- Helpers ----------------------------------------------------------

let seq = 0;
function nextId(prefix) {
  seq += 1;
  return `${prefix}${String(seq).padStart(3, '0')}`;
}

function make(prefix, spec) {
  const price = spec.price;
  // Light deterministic stock spread so the view has variety.
  const stock = spec.stock != null ? spec.stock : seededStock(spec.name, price);
  return {
    id: nextId(prefix),
    ...spec,
    stock,
    status: stock === 0 ? 'Sold out' : stock < 6 ? 'Low stock' : 'In stock',
  };
}

function seededStock(name, price) {
  // Low-cost deterministic pseudo-random so stock values feel varied
  // without being flaky between renders.
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const seed = Math.abs(h) % 100;
  // Fewer high-priced items in stock, more low-priced — feels real.
  const cap = price > 400 ? 8 : price > 200 ? 20 : price > 80 ? 40 : 60;
  return (seed % cap) + 2;
}

// ----- WOMEN (100) ------------------------------------------------------

const WOMEN_SEED = [
  // Tops (20)
  { name: 'Cashmere crewneck sweater', brand: 'Studio 12', subcategory: 'Tops', material: 'Cashmere', colorway: 'Cream', ph: 'ph-5', price: 148, sizes: ['XS', 'S', 'M', 'L', 'XL'], tags: ['minimal', 'refined'], archetypes: ['modern-muse', 'quiet-classic'] },
  { name: 'Cable-knit fisherman sweater', brand: 'Ardeo', subcategory: 'Tops', material: 'Merino wool', colorway: 'Ecru', ph: 'ph-1', price: 168, sizes: ['XS', 'S', 'M', 'L'], tags: ['prep', 'cozy'], archetypes: ['modern-prep', 'quiet-classic'] },
  { name: 'Silk crewneck shell', brand: 'Maison Vasari', subcategory: 'Tops', material: 'Silk', colorway: 'Ink', ph: 'ph-10', price: 198, sizes: ['XS', 'S', 'M', 'L', 'XL'], tags: ['tailored', 'refined'], archetypes: ['modern-muse', 'studio-minimal'] },
  { name: 'Boxy cotton tee', brand: 'North Fold', subcategory: 'Tops', material: 'Organic cotton', colorway: 'Matte black', ph: 'ph-2', price: 58, sizes: ['XS', 'S', 'M', 'L', 'XL'], tags: ['minimal', 'architectural'], archetypes: ['studio-minimal'] },
  { name: 'Oversized Oxford shirt', brand: 'Houseplant', subcategory: 'Tops', material: 'Cotton poplin', colorway: 'White', ph: 'ph-5', price: 118, sizes: ['XS', 'S', 'M', 'L'], tags: ['classic', 'quiet'], archetypes: ['quiet-classic', 'modern-prep'] },
  { name: 'Washed linen button-down', brand: 'Port & Tide', subcategory: 'Tops', material: 'Linen', colorway: 'Sand', ph: 'ph-4', price: 128, sizes: ['XS', 'S', 'M', 'L'], tags: ['coastal', 'soft'], archetypes: ['coastal-sport'] },
  { name: 'Raglan henley top', brand: 'Hinterland', subcategory: 'Tops', material: 'Waffle cotton', colorway: 'Rust', ph: 'ph-8', price: 78, sizes: ['XS', 'S', 'M', 'L'], tags: ['warm', 'worked-in'], archetypes: ['rustic-rebel', 'boho-dreamer'] },
  { name: 'Hand-block cotton blouse', brand: 'Pashma', subcategory: 'Tops', material: 'Block-print cotton', colorway: 'Terracotta', ph: 'ph-8', price: 148, sizes: ['XS', 'S', 'M', 'L'], tags: ['boho', 'textural'], archetypes: ['boho-dreamer'] },
  { name: 'Ribbed cashmere turtleneck', brand: 'Studio 12', subcategory: 'Tops', material: 'Cashmere', colorway: 'Charcoal', ph: 'ph-2', price: 188, sizes: ['XS', 'S', 'M', 'L'], tags: ['refined', 'quiet'], archetypes: ['quiet-classic', 'modern-muse'] },
  { name: 'Silk camisole', brand: 'Maison Vasari', subcategory: 'Tops', material: 'Silk', colorway: 'Champagne', ph: 'ph-3', price: 138, sizes: ['XS', 'S', 'M', 'L'], tags: ['refined', 'soft'], archetypes: ['modern-muse'] },
  { name: 'Flannel overshirt', brand: 'Hinterland', subcategory: 'Tops', material: 'Brushed cotton', colorway: 'Forest', ph: 'ph-9', price: 118, sizes: ['XS', 'S', 'M', 'L'], tags: ['rugged', 'layered'], archetypes: ['rustic-rebel'] },
  { name: 'Relaxed merino polo', brand: 'Ardeo', subcategory: 'Tops', material: 'Merino wool', colorway: 'Navy', ph: 'ph-10', price: 138, sizes: ['XS', 'S', 'M', 'L'], tags: ['prep', 'collegiate'], archetypes: ['modern-prep'] },
  { name: 'Crop denim jacket tee', brand: 'Field/Note', subcategory: 'Tops', material: 'Denim', colorway: 'Indigo', ph: 'ph-7', price: 128, sizes: ['XS', 'S', 'M'], tags: ['casual', 'fresh'], archetypes: ['rustic-rebel'] },
  { name: 'Cotton poplin blouse', brand: 'Houseplant', subcategory: 'Tops', material: 'Cotton poplin', colorway: 'Soft navy', ph: 'ph-6', price: 108, sizes: ['XS', 'S', 'M', 'L'], tags: ['tailored', 'classic'], archetypes: ['quiet-classic'] },
  { name: 'Ribbed bodysuit', brand: 'North Fold', subcategory: 'Tops', material: 'Modal', colorway: 'Black', ph: 'ph-2', price: 68, sizes: ['XS', 'S', 'M', 'L'], tags: ['minimal'], archetypes: ['studio-minimal', 'modern-muse'] },
  { name: 'Oversized tee', brand: 'North Fold', subcategory: 'Tops', material: 'Organic cotton', colorway: 'Oatmeal', ph: 'ph-5', price: 48, sizes: ['XS', 'S', 'M', 'L', 'XL'], tags: ['minimal'], archetypes: ['studio-minimal'] },
  { name: 'Embroidered peasant blouse', brand: 'Pashma', subcategory: 'Tops', material: 'Cotton', colorway: 'Ivory', ph: 'ph-8', price: 128, sizes: ['XS', 'S', 'M', 'L'], tags: ['boho', 'detailed'], archetypes: ['boho-dreamer'] },
  { name: 'Boat-neck Breton tee', brand: 'Port & Tide', subcategory: 'Tops', material: 'Cotton', colorway: 'Navy stripe', ph: 'ph-4', price: 58, sizes: ['XS', 'S', 'M', 'L'], tags: ['classic', 'coastal'], archetypes: ['coastal-sport', 'quiet-classic'] },
  { name: 'Rib-knit tank', brand: 'North Fold', subcategory: 'Tops', material: 'Pima cotton', colorway: 'Bone', ph: 'ph-5', price: 38, sizes: ['XS', 'S', 'M', 'L'], tags: ['minimal', 'layerable'], archetypes: ['studio-minimal'] },
  { name: 'Drape-front silk top', brand: 'Maison Vasari', subcategory: 'Tops', material: 'Silk', colorway: 'Sage', ph: 'ph-4', price: 178, sizes: ['XS', 'S', 'M', 'L'], tags: ['tailored'], archetypes: ['modern-muse'] },

  // Bottoms (15)
  { name: 'Tailored wool trouser', brand: 'Maison Vasari', subcategory: 'Bottoms', material: 'Wool', colorway: 'Charcoal', ph: 'ph-11', price: 198, sizes: ['0', '2', '4', '6', '8', '10', '12'], tags: ['tailored', 'refined'], archetypes: ['modern-muse', 'modern-prep'] },
  { name: 'Straight-leg selvedge denim', brand: 'Field/Note', subcategory: 'Bottoms', material: 'Japanese selvedge', colorway: 'Indigo', ph: 'ph-7', price: 198, sizes: ['24', '25', '26', '27', '28', '29', '30'], tags: ['rugged', 'quiet'], archetypes: ['rustic-rebel', 'quiet-classic'] },
  { name: 'Pleated wide-leg trouser', brand: 'Houseplant', subcategory: 'Bottoms', material: 'Wool blend', colorway: 'Stone', ph: 'ph-5', price: 168, sizes: ['0', '2', '4', '6', '8', '10'], tags: ['architectural', 'minimal'], archetypes: ['studio-minimal'] },
  { name: 'High-waist jean', brand: 'Field/Note', subcategory: 'Bottoms', material: 'Denim', colorway: 'Mid wash', ph: 'ph-6', price: 128, sizes: ['24', '25', '26', '27', '28', '29'], tags: ['classic'], archetypes: ['quiet-classic', 'modern-muse'] },
  { name: 'Drawstring linen pant', brand: 'Port & Tide', subcategory: 'Bottoms', material: 'Linen', colorway: 'Sand', ph: 'ph-4', price: 118, sizes: ['XS', 'S', 'M', 'L'], tags: ['coastal', 'relaxed'], archetypes: ['coastal-sport', 'boho-dreamer'] },
  { name: 'Chino trouser', brand: 'Ardeo', subcategory: 'Bottoms', material: 'Cotton twill', colorway: 'Khaki', ph: 'ph-5', price: 98, sizes: ['0', '2', '4', '6', '8', '10', '12'], tags: ['prep'], archetypes: ['modern-prep'] },
  { name: 'Slouchy trouser', brand: 'Maison Vasari', subcategory: 'Bottoms', material: 'Crepe', colorway: 'Black', ph: 'ph-2', price: 158, sizes: ['XS', 'S', 'M', 'L'], tags: ['tailored', 'evening'], archetypes: ['modern-muse', 'studio-minimal'] },
  { name: 'A-line midi skirt', brand: 'Houseplant', subcategory: 'Bottoms', material: 'Wool', colorway: 'Camel', ph: 'ph-3', price: 138, sizes: ['0', '2', '4', '6', '8', '10'], tags: ['classic'], archetypes: ['modern-prep', 'quiet-classic'] },
  { name: 'Maxi wrap skirt', brand: 'Pashma', subcategory: 'Bottoms', material: 'Block-print cotton', colorway: 'Terracotta', ph: 'ph-8', price: 128, sizes: ['XS', 'S', 'M', 'L'], tags: ['boho'], archetypes: ['boho-dreamer'] },
  { name: 'Pencil skirt', brand: 'Maison Vasari', subcategory: 'Bottoms', material: 'Wool', colorway: 'Ink', ph: 'ph-10', price: 148, sizes: ['0', '2', '4', '6', '8', '10'], tags: ['tailored', 'work'], archetypes: ['modern-muse'] },
  { name: 'Cargo trouser', brand: 'Alpcrest', subcategory: 'Bottoms', material: 'Ripstop cotton', colorway: 'Olive', ph: 'ph-9', price: 118, sizes: ['XS', 'S', 'M', 'L'], tags: ['utility'], archetypes: ['adventure-sport'] },
  { name: 'High-waist black denim', brand: 'Field/Note', subcategory: 'Bottoms', material: 'Denim', colorway: 'Raw black', ph: 'ph-2', price: 138, sizes: ['24', '25', '26', '27', '28', '29'], tags: ['minimal'], archetypes: ['studio-minimal'] },
  { name: 'Cropped flare jean', brand: 'Field/Note', subcategory: 'Bottoms', material: 'Denim', colorway: 'Vintage wash', ph: 'ph-6', price: 138, sizes: ['24', '25', '26', '27', '28'], tags: ['retro'], archetypes: ['rustic-rebel', 'boho-dreamer'] },
  { name: 'Linen bermuda short', brand: 'Port & Tide', subcategory: 'Bottoms', material: 'Linen', colorway: 'White', ph: 'ph-5', price: 88, sizes: ['XS', 'S', 'M', 'L'], tags: ['coastal'], archetypes: ['coastal-sport'] },
  { name: 'Track-stripe pant', brand: 'Alpcrest', subcategory: 'Bottoms', material: 'Technical blend', colorway: 'Navy', ph: 'ph-10', price: 128, sizes: ['XS', 'S', 'M', 'L'], tags: ['athletic'], archetypes: ['adventure-sport'] },

  // Dresses (10)
  { name: 'Slip midi dress', brand: 'Maison Vasari', subcategory: 'Dresses', material: 'Silk', colorway: 'Champagne', ph: 'ph-3', price: 298, sizes: ['XS', 'S', 'M', 'L'], tags: ['evening', 'refined'], archetypes: ['modern-muse'] },
  { name: 'Shirt dress', brand: 'Houseplant', subcategory: 'Dresses', material: 'Cotton poplin', colorway: 'Ink', ph: 'ph-10', price: 178, sizes: ['XS', 'S', 'M', 'L'], tags: ['classic'], archetypes: ['quiet-classic', 'modern-muse'] },
  { name: 'Hand-block maxi dress', brand: 'Pashma', subcategory: 'Dresses', material: 'Block-print cotton', colorway: 'Sunset', ph: 'ph-8', price: 228, sizes: ['XS', 'S', 'M', 'L'], tags: ['boho'], archetypes: ['boho-dreamer'] },
  { name: 'A-line sweater dress', brand: 'Studio 12', subcategory: 'Dresses', material: 'Merino wool', colorway: 'Oatmeal', ph: 'ph-5', price: 198, sizes: ['XS', 'S', 'M', 'L'], tags: ['cozy', 'refined'], archetypes: ['quiet-classic'] },
  { name: 'Wrap dress', brand: 'Houseplant', subcategory: 'Dresses', material: 'Rayon', colorway: 'Forest', ph: 'ph-9', price: 158, sizes: ['XS', 'S', 'M', 'L'], tags: ['classic'], archetypes: ['modern-prep', 'quiet-classic'] },
  { name: 'Linen sundress', brand: 'Port & Tide', subcategory: 'Dresses', material: 'Linen', colorway: 'Bone', ph: 'ph-5', price: 168, sizes: ['XS', 'S', 'M', 'L'], tags: ['coastal', 'soft'], archetypes: ['coastal-sport'] },
  { name: 'Knit column dress', brand: 'Studio 12', subcategory: 'Dresses', material: 'Fine merino', colorway: 'Black', ph: 'ph-2', price: 228, sizes: ['XS', 'S', 'M', 'L'], tags: ['architectural'], archetypes: ['studio-minimal'] },
  { name: 'Midi tank dress', brand: 'North Fold', subcategory: 'Dresses', material: 'Modal', colorway: 'Charcoal', ph: 'ph-2', price: 118, sizes: ['XS', 'S', 'M', 'L'], tags: ['minimal'], archetypes: ['studio-minimal'] },
  { name: 'Prairie mini dress', brand: 'Pashma', subcategory: 'Dresses', material: 'Cotton', colorway: 'Ivory', ph: 'ph-1', price: 168, sizes: ['XS', 'S', 'M', 'L'], tags: ['boho', 'soft'], archetypes: ['boho-dreamer'] },
  { name: 'Ribbed polo dress', brand: 'Ardeo', subcategory: 'Dresses', material: 'Cotton blend', colorway: 'Navy', ph: 'ph-10', price: 148, sizes: ['XS', 'S', 'M', 'L'], tags: ['prep'], archetypes: ['modern-prep'] },

  // Outerwear (10)
  { name: 'Unlined trench coat', brand: 'Houseplant', subcategory: 'Outerwear', material: 'Cotton gabardine', colorway: 'Oat', ph: 'ph-5', price: 398, sizes: ['XS', 'S', 'M', 'L'], tags: ['classic'], archetypes: ['quiet-classic', 'modern-muse'] },
  { name: 'Double-breasted wool coat', brand: 'Maison Vasari', subcategory: 'Outerwear', material: 'Wool', colorway: 'Camel', ph: 'ph-11', price: 598, sizes: ['XS', 'S', 'M', 'L'], tags: ['tailored', 'classic'], archetypes: ['modern-muse', 'modern-prep'] },
  { name: 'Suede bomber', brand: 'Hinterland', subcategory: 'Outerwear', material: 'Suede', colorway: 'Terracotta', ph: 'ph-8', price: 498, sizes: ['XS', 'S', 'M', 'L'], tags: ['boho'], archetypes: ['boho-dreamer', 'rustic-rebel'] },
  { name: 'Technical shell', brand: 'Alpcrest', subcategory: 'Outerwear', material: '3-layer waterproof', colorway: 'Moss', ph: 'ph-9', price: 348, sizes: ['XS', 'S', 'M', 'L'], tags: ['athletic', 'functional'], archetypes: ['adventure-sport'] },
  { name: 'Cropped denim jacket', brand: 'Field/Note', subcategory: 'Outerwear', material: 'Denim', colorway: 'Raw indigo', ph: 'ph-7', price: 168, sizes: ['XS', 'S', 'M', 'L'], tags: ['rugged'], archetypes: ['rustic-rebel'] },
  { name: 'Merino car coat', brand: 'Ardeo', subcategory: 'Outerwear', material: 'Wool', colorway: 'Stone', ph: 'ph-5', price: 458, sizes: ['XS', 'S', 'M', 'L'], tags: ['prep'], archetypes: ['modern-prep'] },
  { name: 'Cashmere wrap', brand: 'Studio 12', subcategory: 'Outerwear', material: 'Cashmere', colorway: 'Heather grey', ph: 'ph-5', price: 248, sizes: ['One size'], tags: ['cozy', 'refined'], archetypes: ['quiet-classic'] },
  { name: 'Boxy blazer', brand: 'Houseplant', subcategory: 'Outerwear', material: 'Wool blend', colorway: 'Black', ph: 'ph-2', price: 298, sizes: ['XS', 'S', 'M', 'L'], tags: ['architectural'], archetypes: ['studio-minimal'] },
  { name: 'Quilted field jacket', brand: 'Hinterland', subcategory: 'Outerwear', material: 'Waxed cotton', colorway: 'Forest', ph: 'ph-9', price: 268, sizes: ['XS', 'S', 'M', 'L'], tags: ['rugged'], archetypes: ['rustic-rebel'] },
  { name: 'Puffer vest', brand: 'Alpcrest', subcategory: 'Outerwear', material: 'Recycled down', colorway: 'Ink', ph: 'ph-10', price: 198, sizes: ['XS', 'S', 'M', 'L'], tags: ['athletic'], archetypes: ['adventure-sport', 'modern-prep'] },

  // Shoes (15)
  { name: 'Sculptural heel', brand: 'Torre', subcategory: 'Shoes', material: 'Leather', colorway: 'Black', ph: 'ph-2', price: 328, sizes: ['6', '7', '8', '9', '10'], tags: ['refined'], archetypes: ['modern-muse'] },
  { name: 'Leather penny loafer', brand: 'Torre', subcategory: 'Shoes', material: 'Leather', colorway: 'Cognac', ph: 'ph-3', price: 268, sizes: ['6', '7', '8', '9', '10'], tags: ['prep', 'classic'], archetypes: ['modern-prep'] },
  { name: 'Suede loafer', brand: 'Torre', subcategory: 'Shoes', material: 'Suede', colorway: 'Sage', ph: 'ph-4', price: 248, sizes: ['6', '7', '8', '9'], tags: ['coastal'], archetypes: ['coastal-sport', 'modern-prep'] },
  { name: 'Worn leather boot', brand: 'Hinterland', subcategory: 'Shoes', material: 'Leather', colorway: 'Aged brown', ph: 'ph-7', price: 368, sizes: ['6', '7', '8', '9', '10'], tags: ['rugged'], archetypes: ['rustic-rebel'] },
  { name: 'Platform sandal', brand: 'Torre', subcategory: 'Shoes', material: 'Leather', colorway: 'Caramel', ph: 'ph-3', price: 228, sizes: ['6', '7', '8', '9'], tags: ['warm'], archetypes: ['boho-dreamer'] },
  { name: 'Beaded leather sandal', brand: 'Pashma', subcategory: 'Shoes', material: 'Leather', colorway: 'Natural', ph: 'ph-1', price: 178, sizes: ['6', '7', '8', '9'], tags: ['boho'], archetypes: ['boho-dreamer'] },
  { name: 'White low-top sneaker', brand: 'North Fold', subcategory: 'Shoes', material: 'Canvas', colorway: 'White', ph: 'ph-5', price: 118, sizes: ['6', '7', '8', '9', '10'], tags: ['minimal', 'casual'], archetypes: ['studio-minimal', 'coastal-sport'] },
  { name: 'Trail runner', brand: 'Alpcrest', subcategory: 'Shoes', material: 'Technical mesh', colorway: 'Moss', ph: 'ph-9', price: 158, sizes: ['6', '7', '8', '9', '10'], tags: ['athletic'], archetypes: ['adventure-sport'] },
  { name: 'Ballet flat', brand: 'Maison Vasari', subcategory: 'Shoes', material: 'Suede', colorway: 'Bone', ph: 'ph-5', price: 188, sizes: ['6', '7', '8', '9'], tags: ['refined', 'classic'], archetypes: ['quiet-classic', 'modern-muse'] },
  { name: 'Leather derby', brand: 'Torre', subcategory: 'Shoes', material: 'Leather', colorway: 'Black', ph: 'ph-2', price: 298, sizes: ['6', '7', '8', '9'], tags: ['architectural'], archetypes: ['studio-minimal'] },
  { name: 'Ankle boot', brand: 'Torre', subcategory: 'Shoes', material: 'Leather', colorway: 'Chestnut', ph: 'ph-3', price: 298, sizes: ['6', '7', '8', '9', '10'], tags: ['warm'], archetypes: ['rustic-rebel', 'boho-dreamer'] },
  { name: 'Canvas slip-on', brand: 'Port & Tide', subcategory: 'Shoes', material: 'Canvas', colorway: 'Navy', ph: 'ph-10', price: 78, sizes: ['6', '7', '8', '9', '10'], tags: ['coastal'], archetypes: ['coastal-sport'] },
  { name: 'Chelsea boot', brand: 'Hinterland', subcategory: 'Shoes', material: 'Leather', colorway: 'Black', ph: 'ph-2', price: 328, sizes: ['6', '7', '8', '9'], tags: ['classic'], archetypes: ['quiet-classic'] },
  { name: 'Minimalist mule', brand: 'Torre', subcategory: 'Shoes', material: 'Leather', colorway: 'Bone', ph: 'ph-5', price: 218, sizes: ['6', '7', '8', '9'], tags: ['architectural'], archetypes: ['studio-minimal'] },
  { name: 'Cork footbed sandal', brand: 'Port & Tide', subcategory: 'Shoes', material: 'Leather', colorway: 'Tan', ph: 'ph-3', price: 148, sizes: ['6', '7', '8', '9'], tags: ['coastal'], archetypes: ['coastal-sport'] },

  // Accessories (10)
  { name: 'Silk scarf', brand: 'Maison Vasari', subcategory: 'Accessories', material: 'Silk', colorway: 'Ink pattern', ph: 'ph-10', price: 148, sizes: ['One size'], tags: ['refined'], archetypes: ['modern-muse', 'modern-prep'] },
  { name: 'Structured tote', brand: 'Torre', subcategory: 'Accessories', material: 'Leather', colorway: 'Caramel', ph: 'ph-3', price: 388, sizes: ['One size'], tags: ['classic', 'work'], archetypes: ['modern-muse'] },
  { name: 'Woven straw tote', brand: 'Port & Tide', subcategory: 'Accessories', material: 'Straw', colorway: 'Natural', ph: 'ph-1', price: 128, sizes: ['One size'], tags: ['coastal', 'warm'], archetypes: ['coastal-sport', 'boho-dreamer'] },
  { name: 'Cashmere beanie', brand: 'Studio 12', subcategory: 'Accessories', material: 'Cashmere', colorway: 'Charcoal', ph: 'ph-2', price: 88, sizes: ['One size'], tags: ['cozy'], archetypes: ['quiet-classic'] },
  { name: 'Leather belt', brand: 'Torre', subcategory: 'Accessories', material: 'Leather', colorway: 'Cognac', ph: 'ph-3', price: 118, sizes: ['S', 'M', 'L'], tags: ['classic'], archetypes: ['modern-prep', 'quiet-classic'] },
  { name: 'Oversized sunglasses', brand: 'Maison Vasari', subcategory: 'Accessories', material: 'Acetate', colorway: 'Tortoise', ph: 'ph-3', price: 168, sizes: ['One size'], tags: ['refined'], archetypes: ['modern-muse'] },
  { name: 'Beaded drop earrings', brand: 'Pashma', subcategory: 'Accessories', material: 'Glass beads', colorway: 'Amber', ph: 'ph-8', price: 68, sizes: ['One size'], tags: ['boho'], archetypes: ['boho-dreamer'] },
  { name: 'Minimal hoop earrings', brand: 'North Fold', subcategory: 'Accessories', material: 'Sterling silver', colorway: 'Silver', ph: 'ph-5', price: 58, sizes: ['One size'], tags: ['minimal'], archetypes: ['studio-minimal'] },
  { name: 'Cashmere gloves', brand: 'Studio 12', subcategory: 'Accessories', material: 'Cashmere', colorway: 'Ink', ph: 'ph-10', price: 118, sizes: ['S', 'M', 'L'], tags: ['cozy'], archetypes: ['quiet-classic', 'modern-muse'] },
  { name: 'Leather crossbody', brand: 'Torre', subcategory: 'Accessories', material: 'Leather', colorway: 'Black', ph: 'ph-2', price: 268, sizes: ['One size'], tags: ['minimal'], archetypes: ['studio-minimal'] },

  // Activewear (10)
  { name: 'High-support sports bra', brand: 'Alpcrest', subcategory: 'Activewear', material: 'Recycled poly', colorway: 'Moss', ph: 'ph-9', price: 68, sizes: ['XS', 'S', 'M', 'L', 'XL'], tags: ['athletic'], archetypes: ['adventure-sport'] },
  { name: '7/8 compression legging', brand: 'Alpcrest', subcategory: 'Activewear', material: 'Recycled poly', colorway: 'Ink', ph: 'ph-10', price: 98, sizes: ['XS', 'S', 'M', 'L', 'XL'], tags: ['athletic'], archetypes: ['adventure-sport'] },
  { name: 'Run short', brand: 'Alpcrest', subcategory: 'Activewear', material: 'Ripstop', colorway: 'Sage', ph: 'ph-4', price: 58, sizes: ['XS', 'S', 'M', 'L'], tags: ['athletic'], archetypes: ['adventure-sport'] },
  { name: 'Seamless tank', brand: 'Alpcrest', subcategory: 'Activewear', material: 'Seamless knit', colorway: 'Black', ph: 'ph-2', price: 48, sizes: ['XS', 'S', 'M', 'L'], tags: ['athletic'], archetypes: ['adventure-sport'] },
  { name: 'Quarter-zip mid layer', brand: 'Alpcrest', subcategory: 'Activewear', material: 'Fleece', colorway: 'Forest', ph: 'ph-9', price: 98, sizes: ['XS', 'S', 'M', 'L'], tags: ['athletic'], archetypes: ['adventure-sport'] },
  { name: 'Yoga jumpsuit', brand: 'Alpcrest', subcategory: 'Activewear', material: 'Stretch knit', colorway: 'Navy', ph: 'ph-10', price: 148, sizes: ['XS', 'S', 'M', 'L'], tags: ['athletic'], archetypes: ['adventure-sport'] },
  { name: 'Studio wrap sweater', brand: 'Studio 12', subcategory: 'Activewear', material: 'Merino blend', colorway: 'Heather', ph: 'ph-5', price: 128, sizes: ['XS', 'S', 'M', 'L'], tags: ['cozy'], archetypes: ['modern-prep'] },
  { name: 'Hiking pant', brand: 'Alpcrest', subcategory: 'Activewear', material: 'Stretch nylon', colorway: 'Stone', ph: 'ph-5', price: 128, sizes: ['XS', 'S', 'M', 'L'], tags: ['utility'], archetypes: ['adventure-sport'] },
  { name: 'Reflective trail vest', brand: 'Alpcrest', subcategory: 'Activewear', material: 'Ripstop', colorway: 'Lime pop', ph: 'ph-8', price: 118, sizes: ['XS', 'S', 'M', 'L'], tags: ['athletic'], archetypes: ['adventure-sport'] },
  { name: 'Merino base layer', brand: 'Alpcrest', subcategory: 'Activewear', material: 'Merino wool', colorway: 'Forest', ph: 'ph-9', price: 108, sizes: ['XS', 'S', 'M', 'L'], tags: ['athletic'], archetypes: ['adventure-sport'] },

  // Loungewear (10)
  { name: 'Waffle robe', brand: 'North Fold', subcategory: 'Loungewear', material: 'Waffle cotton', colorway: 'Bone', ph: 'ph-5', price: 128, sizes: ['XS', 'S', 'M', 'L'], tags: ['cozy'], archetypes: ['quiet-classic'] },
  { name: 'Silk pajama set', brand: 'Maison Vasari', subcategory: 'Loungewear', material: 'Silk', colorway: 'Ivory', ph: 'ph-1', price: 298, sizes: ['XS', 'S', 'M', 'L'], tags: ['refined'], archetypes: ['modern-muse'] },
  { name: 'Cashmere jogger', brand: 'Studio 12', subcategory: 'Loungewear', material: 'Cashmere', colorway: 'Oatmeal', ph: 'ph-5', price: 268, sizes: ['XS', 'S', 'M', 'L'], tags: ['cozy', 'refined'], archetypes: ['quiet-classic'] },
  { name: 'Ribbed lounge set', brand: 'North Fold', subcategory: 'Loungewear', material: 'Modal', colorway: 'Charcoal', ph: 'ph-2', price: 118, sizes: ['XS', 'S', 'M', 'L'], tags: ['minimal'], archetypes: ['studio-minimal'] },
  { name: 'Boxy crewneck sweatshirt', brand: 'Houseplant', subcategory: 'Loungewear', material: 'Brushed cotton', colorway: 'Cream', ph: 'ph-5', price: 98, sizes: ['XS', 'S', 'M', 'L'], tags: ['cozy'], archetypes: ['modern-prep'] },
  { name: 'Henley sleep shirt', brand: 'Hinterland', subcategory: 'Loungewear', material: 'Cotton', colorway: 'Rust', ph: 'ph-8', price: 68, sizes: ['XS', 'S', 'M', 'L'], tags: ['worked-in'], archetypes: ['rustic-rebel'] },
  { name: 'Drawstring lounge pant', brand: 'Port & Tide', subcategory: 'Loungewear', material: 'Linen', colorway: 'Sand', ph: 'ph-4', price: 88, sizes: ['XS', 'S', 'M', 'L'], tags: ['coastal'], archetypes: ['coastal-sport'] },
  { name: 'Cashmere beanie (loungewear)', brand: 'Studio 12', subcategory: 'Loungewear', material: 'Cashmere', colorway: 'Dusty rose', ph: 'ph-8', price: 88, sizes: ['One size'], tags: ['cozy'], archetypes: ['boho-dreamer'] },
  { name: 'Oversized hoodie', brand: 'North Fold', subcategory: 'Loungewear', material: 'French terry', colorway: 'Heather', ph: 'ph-5', price: 108, sizes: ['XS', 'S', 'M', 'L'], tags: ['casual'], archetypes: ['adventure-sport'] },
  { name: 'Slipper clog', brand: 'Torre', subcategory: 'Loungewear', material: 'Shearling', colorway: 'Natural', ph: 'ph-1', price: 148, sizes: ['6', '7', '8', '9'], tags: ['cozy'], archetypes: ['quiet-classic'] },
];

// ----- MEN (60) ---------------------------------------------------------

const MEN_SEED = [
  // Tops (15)
  { name: 'Fine-gauge merino crewneck', brand: 'Ardeo', subcategory: 'Tops', material: 'Merino wool', colorway: 'Navy', ph: 'ph-10', price: 168, sizes: ['S', 'M', 'L', 'XL', 'XXL'], tags: ['prep'], archetypes: ['modern-prep', 'quiet-classic'] },
  { name: 'Oxford button-down', brand: 'Houseplant', subcategory: 'Tops', material: 'Cotton poplin', colorway: 'Blue stripe', ph: 'ph-6', price: 98, sizes: ['S', 'M', 'L', 'XL'], tags: ['prep', 'classic'], archetypes: ['modern-prep'] },
  { name: 'Waffle henley', brand: 'Hinterland', subcategory: 'Tops', material: 'Waffle cotton', colorway: 'Oatmeal', ph: 'ph-5', price: 78, sizes: ['S', 'M', 'L', 'XL'], tags: ['worked-in'], archetypes: ['rustic-rebel'] },
  { name: 'Pima cotton tee', brand: 'North Fold', subcategory: 'Tops', material: 'Pima cotton', colorway: 'White', ph: 'ph-5', price: 42, sizes: ['S', 'M', 'L', 'XL', 'XXL'], tags: ['minimal'], archetypes: ['studio-minimal'] },
  { name: 'Pique polo', brand: 'Ardeo', subcategory: 'Tops', material: 'Cotton pique', colorway: 'Forest', ph: 'ph-9', price: 98, sizes: ['S', 'M', 'L', 'XL'], tags: ['prep'], archetypes: ['modern-prep'] },
  { name: 'Flannel work shirt', brand: 'Hinterland', subcategory: 'Tops', material: 'Flannel', colorway: 'Rust plaid', ph: 'ph-8', price: 118, sizes: ['S', 'M', 'L', 'XL'], tags: ['rugged', 'worked-in'], archetypes: ['rustic-rebel'] },
  { name: 'Linen camp collar shirt', brand: 'Port & Tide', subcategory: 'Tops', material: 'Linen', colorway: 'Sand', ph: 'ph-4', price: 118, sizes: ['S', 'M', 'L', 'XL'], tags: ['coastal'], archetypes: ['coastal-sport'] },
  { name: 'Boxy heavyweight tee', brand: 'North Fold', subcategory: 'Tops', material: 'Organic cotton', colorway: 'Charcoal', ph: 'ph-2', price: 58, sizes: ['S', 'M', 'L', 'XL'], tags: ['minimal'], archetypes: ['studio-minimal'] },
  { name: 'Cashmere v-neck', brand: 'Studio 12', subcategory: 'Tops', material: 'Cashmere', colorway: 'Camel', ph: 'ph-11', price: 188, sizes: ['S', 'M', 'L', 'XL'], tags: ['refined'], archetypes: ['modern-prep', 'quiet-classic'] },
  { name: 'Turtleneck', brand: 'Ardeo', subcategory: 'Tops', material: 'Merino wool', colorway: 'Ink', ph: 'ph-10', price: 158, sizes: ['S', 'M', 'L', 'XL'], tags: ['refined'], archetypes: ['modern-muse', 'quiet-classic'] },
  { name: 'Rugby stripe polo', brand: 'Ardeo', subcategory: 'Tops', material: 'Cotton', colorway: 'Navy/white', ph: 'ph-10', price: 118, sizes: ['S', 'M', 'L', 'XL'], tags: ['prep'], archetypes: ['modern-prep'] },
  { name: 'Denim work shirt', brand: 'Field/Note', subcategory: 'Tops', material: 'Chambray', colorway: 'Indigo', ph: 'ph-7', price: 128, sizes: ['S', 'M', 'L', 'XL'], tags: ['rugged'], archetypes: ['rustic-rebel'] },
  { name: 'Tech base-layer', brand: 'Alpcrest', subcategory: 'Tops', material: 'Merino blend', colorway: 'Moss', ph: 'ph-9', price: 98, sizes: ['S', 'M', 'L', 'XL'], tags: ['athletic'], archetypes: ['adventure-sport'] },
  { name: 'Sun hoodie', brand: 'Alpcrest', subcategory: 'Tops', material: 'Quick-dry poly', colorway: 'Sage', ph: 'ph-4', price: 78, sizes: ['S', 'M', 'L', 'XL'], tags: ['athletic'], archetypes: ['adventure-sport'] },
  { name: 'Silk crew', brand: 'Maison Vasari', subcategory: 'Tops', material: 'Silk', colorway: 'Stone', ph: 'ph-5', price: 198, sizes: ['S', 'M', 'L'], tags: ['refined'], archetypes: ['modern-muse'] },

  // Bottoms (10)
  { name: 'Straight-leg chino', brand: 'Ardeo', subcategory: 'Bottoms', material: 'Cotton twill', colorway: 'Stone', ph: 'ph-5', price: 118, sizes: ['30', '32', '34', '36', '38'], tags: ['prep'], archetypes: ['modern-prep'] },
  { name: 'Japanese selvedge jean', brand: 'Field/Note', subcategory: 'Bottoms', material: 'Selvedge denim', colorway: 'Raw indigo', ph: 'ph-7', price: 228, sizes: ['30', '32', '34', '36'], tags: ['rugged'], archetypes: ['rustic-rebel'] },
  { name: 'Wool dress trouser', brand: 'Maison Vasari', subcategory: 'Bottoms', material: 'Wool', colorway: 'Charcoal', ph: 'ph-11', price: 228, sizes: ['30', '32', '34', '36', '38'], tags: ['tailored'], archetypes: ['modern-muse', 'modern-prep'] },
  { name: 'Corduroy trouser', brand: 'Hinterland', subcategory: 'Bottoms', material: 'Corduroy', colorway: 'Warm brown', ph: 'ph-3', price: 148, sizes: ['30', '32', '34', '36'], tags: ['worked-in'], archetypes: ['rustic-rebel'] },
  { name: 'Linen drawstring pant', brand: 'Port & Tide', subcategory: 'Bottoms', material: 'Linen', colorway: 'Sand', ph: 'ph-4', price: 128, sizes: ['S', 'M', 'L', 'XL'], tags: ['coastal'], archetypes: ['coastal-sport'] },
  { name: 'Stretch chino short', brand: 'Ardeo', subcategory: 'Bottoms', material: 'Cotton stretch', colorway: 'Navy', ph: 'ph-10', price: 78, sizes: ['30', '32', '34', '36'], tags: ['prep'], archetypes: ['modern-prep', 'coastal-sport'] },
  { name: 'Climbing pant', brand: 'Alpcrest', subcategory: 'Bottoms', material: 'Stretch nylon', colorway: 'Olive', ph: 'ph-9', price: 148, sizes: ['30', '32', '34', '36'], tags: ['athletic', 'utility'], archetypes: ['adventure-sport'] },
  { name: 'Pleated trouser', brand: 'Houseplant', subcategory: 'Bottoms', material: 'Wool blend', colorway: 'Stone', ph: 'ph-5', price: 168, sizes: ['30', '32', '34', '36'], tags: ['architectural'], archetypes: ['studio-minimal'] },
  { name: 'Swim trunk', brand: 'Port & Tide', subcategory: 'Bottoms', material: 'Recycled nylon', colorway: 'Sage', ph: 'ph-4', price: 88, sizes: ['S', 'M', 'L', 'XL'], tags: ['coastal'], archetypes: ['coastal-sport'] },
  { name: 'Slim black jean', brand: 'Field/Note', subcategory: 'Bottoms', material: 'Denim', colorway: 'Raw black', ph: 'ph-2', price: 148, sizes: ['30', '32', '34', '36'], tags: ['minimal'], archetypes: ['studio-minimal'] },

  // Sweaters (8)
  { name: 'Cable fisherman', brand: 'Ardeo', subcategory: 'Sweaters', material: 'Wool', colorway: 'Ecru', ph: 'ph-1', price: 198, sizes: ['S', 'M', 'L', 'XL'], tags: ['prep', 'worked-in'], archetypes: ['modern-prep', 'rustic-rebel'] },
  { name: 'Shawl-collar cardigan', brand: 'Ardeo', subcategory: 'Sweaters', material: 'Wool blend', colorway: 'Oatmeal', ph: 'ph-5', price: 228, sizes: ['S', 'M', 'L', 'XL'], tags: ['prep'], archetypes: ['modern-prep'] },
  { name: 'Shetland crewneck', brand: 'Ardeo', subcategory: 'Sweaters', material: 'Shetland wool', colorway: 'Forest', ph: 'ph-9', price: 158, sizes: ['S', 'M', 'L', 'XL'], tags: ['prep'], archetypes: ['modern-prep'] },
  { name: 'Cashmere quarter-zip', brand: 'Studio 12', subcategory: 'Sweaters', material: 'Cashmere', colorway: 'Heather grey', ph: 'ph-5', price: 298, sizes: ['S', 'M', 'L', 'XL'], tags: ['refined'], archetypes: ['modern-prep'] },
  { name: 'Rollneck sweater', brand: 'Studio 12', subcategory: 'Sweaters', material: 'Cashmere', colorway: 'Ink', ph: 'ph-10', price: 268, sizes: ['S', 'M', 'L', 'XL'], tags: ['refined'], archetypes: ['modern-muse'] },
  { name: 'Waffle knit pullover', brand: 'Hinterland', subcategory: 'Sweaters', material: 'Cotton wool blend', colorway: 'Camel', ph: 'ph-11', price: 148, sizes: ['S', 'M', 'L', 'XL'], tags: ['worked-in'], archetypes: ['rustic-rebel'] },
  { name: 'Fair isle pullover', brand: 'Ardeo', subcategory: 'Sweaters', material: 'Wool', colorway: 'Navy pattern', ph: 'ph-10', price: 218, sizes: ['S', 'M', 'L', 'XL'], tags: ['prep'], archetypes: ['modern-prep', 'boho-dreamer'] },
  { name: 'Chunky zip cardigan', brand: 'Hinterland', subcategory: 'Sweaters', material: 'Wool', colorway: 'Rust', ph: 'ph-8', price: 188, sizes: ['S', 'M', 'L', 'XL'], tags: ['worked-in'], archetypes: ['rustic-rebel'] },

  // Outerwear (8)
  { name: 'Wool overcoat', brand: 'Maison Vasari', subcategory: 'Outerwear', material: 'Wool', colorway: 'Camel', ph: 'ph-11', price: 698, sizes: ['S', 'M', 'L', 'XL'], tags: ['tailored', 'classic'], archetypes: ['modern-prep', 'modern-muse'] },
  { name: 'Trench coat', brand: 'Houseplant', subcategory: 'Outerwear', material: 'Cotton gabardine', colorway: 'Stone', ph: 'ph-5', price: 498, sizes: ['S', 'M', 'L', 'XL'], tags: ['classic'], archetypes: ['quiet-classic'] },
  { name: 'Waxed field jacket', brand: 'Hinterland', subcategory: 'Outerwear', material: 'Waxed cotton', colorway: 'Olive', ph: 'ph-9', price: 398, sizes: ['S', 'M', 'L', 'XL'], tags: ['rugged'], archetypes: ['rustic-rebel'] },
  { name: 'Technical shell', brand: 'Alpcrest', subcategory: 'Outerwear', material: '3-layer waterproof', colorway: 'Forest', ph: 'ph-9', price: 398, sizes: ['S', 'M', 'L', 'XL'], tags: ['athletic'], archetypes: ['adventure-sport'] },
  { name: 'Suede bomber', brand: 'Hinterland', subcategory: 'Outerwear', material: 'Suede', colorway: 'Tobacco', ph: 'ph-3', price: 548, sizes: ['S', 'M', 'L', 'XL'], tags: ['worked-in'], archetypes: ['rustic-rebel'] },
  { name: 'Merino peacoat', brand: 'Ardeo', subcategory: 'Outerwear', material: 'Wool', colorway: 'Navy', ph: 'ph-10', price: 468, sizes: ['S', 'M', 'L', 'XL'], tags: ['classic', 'prep'], archetypes: ['modern-prep', 'quiet-classic'] },
  { name: 'Quilted vest', brand: 'Alpcrest', subcategory: 'Outerwear', material: 'Recycled down', colorway: 'Navy', ph: 'ph-10', price: 178, sizes: ['S', 'M', 'L', 'XL'], tags: ['athletic'], archetypes: ['adventure-sport', 'modern-prep'] },
  { name: 'Crewneck harrington', brand: 'Ardeo', subcategory: 'Outerwear', material: 'Cotton twill', colorway: 'Sage', ph: 'ph-4', price: 228, sizes: ['S', 'M', 'L', 'XL'], tags: ['prep'], archetypes: ['modern-prep'] },

  // Shoes (10)
  { name: 'Suede desert boot', brand: 'Torre', subcategory: 'Shoes', material: 'Suede', colorway: 'Sand', ph: 'ph-1', price: 298, sizes: ['8', '9', '10', '11', '12'], tags: ['classic'], archetypes: ['rustic-rebel', 'modern-prep'] },
  { name: 'Penny loafer', brand: 'Torre', subcategory: 'Shoes', material: 'Leather', colorway: 'Burgundy', ph: 'ph-7', price: 328, sizes: ['8', '9', '10', '11', '12'], tags: ['prep', 'classic'], archetypes: ['modern-prep'] },
  { name: 'Chelsea boot', brand: 'Hinterland', subcategory: 'Shoes', material: 'Leather', colorway: 'Black', ph: 'ph-2', price: 398, sizes: ['8', '9', '10', '11'], tags: ['classic'], archetypes: ['quiet-classic', 'rustic-rebel'] },
  { name: 'Derby shoe', brand: 'Torre', subcategory: 'Shoes', material: 'Leather', colorway: 'Oxblood', ph: 'ph-7', price: 368, sizes: ['8', '9', '10', '11', '12'], tags: ['tailored'], archetypes: ['modern-muse'] },
  { name: 'Leather sneaker', brand: 'North Fold', subcategory: 'Shoes', material: 'Leather', colorway: 'White', ph: 'ph-5', price: 198, sizes: ['8', '9', '10', '11', '12'], tags: ['minimal'], archetypes: ['studio-minimal', 'modern-prep'] },
  { name: 'Canvas sneaker', brand: 'North Fold', subcategory: 'Shoes', material: 'Canvas', colorway: 'Navy', ph: 'ph-10', price: 98, sizes: ['8', '9', '10', '11', '12'], tags: ['casual'], archetypes: ['coastal-sport'] },
  { name: 'Trail shoe', brand: 'Alpcrest', subcategory: 'Shoes', material: 'Technical', colorway: 'Moss', ph: 'ph-9', price: 168, sizes: ['8', '9', '10', '11', '12'], tags: ['athletic'], archetypes: ['adventure-sport'] },
  { name: 'Work boot', brand: 'Hinterland', subcategory: 'Shoes', material: 'Leather', colorway: 'Dark brown', ph: 'ph-7', price: 398, sizes: ['8', '9', '10', '11'], tags: ['rugged'], archetypes: ['rustic-rebel'] },
  { name: 'Espadrille', brand: 'Port & Tide', subcategory: 'Shoes', material: 'Canvas/jute', colorway: 'Bone', ph: 'ph-1', price: 88, sizes: ['8', '9', '10', '11'], tags: ['coastal'], archetypes: ['coastal-sport'] },
  { name: 'Slip-on loafer', brand: 'Torre', subcategory: 'Shoes', material: 'Leather', colorway: 'Black', ph: 'ph-2', price: 298, sizes: ['8', '9', '10', '11'], tags: ['minimal'], archetypes: ['studio-minimal'] },

  // Accessories (5)
  { name: 'Leather belt', brand: 'Torre', subcategory: 'Accessories', material: 'Leather', colorway: 'Brown', ph: 'ph-3', price: 128, sizes: ['32', '34', '36', '38'], tags: ['classic'], archetypes: ['modern-prep'] },
  { name: 'Wool watch cap', brand: 'Ardeo', subcategory: 'Accessories', material: 'Merino', colorway: 'Charcoal', ph: 'ph-2', price: 58, sizes: ['One size'], tags: ['cozy'], archetypes: ['rustic-rebel'] },
  { name: 'Silk tie', brand: 'Maison Vasari', subcategory: 'Accessories', material: 'Silk', colorway: 'Ink dot', ph: 'ph-10', price: 118, sizes: ['One size'], tags: ['refined'], archetypes: ['modern-muse'] },
  { name: 'Steel watch', brand: 'Torre', subcategory: 'Accessories', material: 'Stainless steel', colorway: 'Silver/black', ph: 'ph-2', price: 598, sizes: ['One size'], tags: ['refined'], archetypes: ['modern-muse'] },
  { name: 'Canvas messenger bag', brand: 'Hinterland', subcategory: 'Accessories', material: 'Waxed canvas', colorway: 'Olive', ph: 'ph-9', price: 188, sizes: ['One size'], tags: ['worked-in'], archetypes: ['rustic-rebel'] },

  // Activewear (4)
  { name: 'Running tight', brand: 'Alpcrest', subcategory: 'Activewear', material: 'Recycled poly', colorway: 'Black', ph: 'ph-2', price: 98, sizes: ['S', 'M', 'L', 'XL'], tags: ['athletic'], archetypes: ['adventure-sport'] },
  { name: 'Merino run tee', brand: 'Alpcrest', subcategory: 'Activewear', material: 'Merino wool', colorway: 'Heather', ph: 'ph-5', price: 68, sizes: ['S', 'M', 'L', 'XL'], tags: ['athletic'], archetypes: ['adventure-sport'] },
  { name: 'Hiking short', brand: 'Alpcrest', subcategory: 'Activewear', material: 'Ripstop', colorway: 'Sand', ph: 'ph-5', price: 78, sizes: ['S', 'M', 'L', 'XL'], tags: ['utility'], archetypes: ['adventure-sport'] },
  { name: 'Performance polo', brand: 'Alpcrest', subcategory: 'Activewear', material: 'Quick-dry', colorway: 'Navy', ph: 'ph-10', price: 88, sizes: ['S', 'M', 'L', 'XL'], tags: ['athletic'], archetypes: ['adventure-sport'] },
];

// ----- KIDS (40) --------------------------------------------------------

const KIDS_SEED = [
  // Tops (10)
  { name: 'Striped long-sleeve tee', brand: 'Little North', subcategory: 'Tops', material: 'Organic cotton', colorway: 'Navy/cream', ph: 'ph-10', price: 28, sizes: ['2T', '3T', '4T', '5', '6', '7', '8'], tags: ['classic'], archetypes: ['modern-prep'] },
  { name: 'Rainbow graphic tee', brand: 'Sprout Lab', subcategory: 'Tops', material: 'Cotton', colorway: 'Cream', ph: 'ph-8', price: 24, sizes: ['2T', '3T', '4T', '5', '6', '7'], tags: ['playful'], archetypes: ['boho-dreamer'] },
  { name: 'Waffle henley', brand: 'Hinterland Kids', subcategory: 'Tops', material: 'Waffle cotton', colorway: 'Forest', ph: 'ph-9', price: 32, sizes: ['2T', '3T', '4T', '5', '6', '7', '8'], tags: ['worked-in'], archetypes: ['rustic-rebel'] },
  { name: 'Fisherman pullover', brand: 'Little North', subcategory: 'Tops', material: 'Cotton knit', colorway: 'Ecru', ph: 'ph-1', price: 48, sizes: ['2T', '3T', '4T', '5', '6', '7'], tags: ['prep'], archetypes: ['modern-prep'] },
  { name: 'Polo shirt', brand: 'Little North', subcategory: 'Tops', material: 'Cotton pique', colorway: 'Red', ph: 'ph-8', price: 32, sizes: ['3T', '4T', '5', '6', '7', '8'], tags: ['prep'], archetypes: ['modern-prep'] },
  { name: 'Raglan baseball tee', brand: 'Sprout Lab', subcategory: 'Tops', material: 'Cotton', colorway: 'Sage/cream', ph: 'ph-4', price: 26, sizes: ['2T', '3T', '4T', '5', '6', '7'], tags: ['casual'], archetypes: ['adventure-sport'] },
  { name: 'Corduroy button-up', brand: 'Hinterland Kids', subcategory: 'Tops', material: 'Corduroy', colorway: 'Rust', ph: 'ph-8', price: 42, sizes: ['2T', '3T', '4T', '5', '6'], tags: ['worked-in'], archetypes: ['rustic-rebel'] },
  { name: 'Tie-dye tee', brand: 'Sprout Lab', subcategory: 'Tops', material: 'Cotton', colorway: 'Teal mix', ph: 'ph-4', price: 22, sizes: ['2T', '3T', '4T', '5', '6', '7', '8'], tags: ['boho'], archetypes: ['boho-dreamer'] },
  { name: 'Fleece crewneck', brand: 'Alpcrest Kids', subcategory: 'Tops', material: 'Fleece', colorway: 'Moss', ph: 'ph-9', price: 38, sizes: ['2T', '3T', '4T', '5', '6', '7', '8'], tags: ['athletic'], archetypes: ['adventure-sport'] },
  { name: 'Linen gathered top', brand: 'Pashma Kids', subcategory: 'Tops', material: 'Linen', colorway: 'Ivory', ph: 'ph-5', price: 36, sizes: ['2T', '3T', '4T', '5', '6'], tags: ['boho'], archetypes: ['boho-dreamer'] },

  // Bottoms (8)
  { name: 'Stretch denim jean', brand: 'Little North', subcategory: 'Bottoms', material: 'Denim stretch', colorway: 'Mid wash', ph: 'ph-6', price: 38, sizes: ['2T', '3T', '4T', '5', '6', '7', '8'], tags: ['classic'], archetypes: ['rustic-rebel'] },
  { name: 'Corduroy pant', brand: 'Hinterland Kids', subcategory: 'Bottoms', material: 'Corduroy', colorway: 'Tobacco', ph: 'ph-3', price: 42, sizes: ['2T', '3T', '4T', '5', '6'], tags: ['worked-in'], archetypes: ['rustic-rebel'] },
  { name: 'Jogger pant', brand: 'Sprout Lab', subcategory: 'Bottoms', material: 'French terry', colorway: 'Heather grey', ph: 'ph-5', price: 32, sizes: ['2T', '3T', '4T', '5', '6', '7', '8'], tags: ['casual'], archetypes: ['adventure-sport'] },
  { name: 'Chino short', brand: 'Little North', subcategory: 'Bottoms', material: 'Cotton twill', colorway: 'Khaki', ph: 'ph-5', price: 28, sizes: ['3T', '4T', '5', '6', '7', '8'], tags: ['prep'], archetypes: ['modern-prep'] },
  { name: 'Ruffle bloomer', brand: 'Pashma Kids', subcategory: 'Bottoms', material: 'Cotton', colorway: 'Ivory', ph: 'ph-1', price: 28, sizes: ['2T', '3T', '4T'], tags: ['boho'], archetypes: ['boho-dreamer'] },
  { name: 'Trail pant', brand: 'Alpcrest Kids', subcategory: 'Bottoms', material: 'Ripstop', colorway: 'Olive', ph: 'ph-9', price: 48, sizes: ['3T', '4T', '5', '6', '7', '8'], tags: ['utility'], archetypes: ['adventure-sport'] },
  { name: 'Linen pull-on pant', brand: 'Pashma Kids', subcategory: 'Bottoms', material: 'Linen', colorway: 'Sand', ph: 'ph-4', price: 36, sizes: ['2T', '3T', '4T', '5', '6'], tags: ['coastal'], archetypes: ['coastal-sport'] },
  { name: 'Knit legging', brand: 'Sprout Lab', subcategory: 'Bottoms', material: 'Cotton/elastane', colorway: 'Black', ph: 'ph-2', price: 22, sizes: ['2T', '3T', '4T', '5', '6', '7', '8'], tags: ['casual'], archetypes: ['adventure-sport'] },

  // Dresses (5)
  { name: 'Hand-block prairie dress', brand: 'Pashma Kids', subcategory: 'Dresses', material: 'Cotton', colorway: 'Block terracotta', ph: 'ph-8', price: 58, sizes: ['2T', '3T', '4T', '5', '6', '7'], tags: ['boho'], archetypes: ['boho-dreamer'] },
  { name: 'Smocked sundress', brand: 'Little North', subcategory: 'Dresses', material: 'Cotton', colorway: 'Gingham navy', ph: 'ph-10', price: 48, sizes: ['2T', '3T', '4T', '5', '6', '7'], tags: ['classic'], archetypes: ['modern-prep'] },
  { name: 'Knit sweater dress', brand: 'Studio 12 Kids', subcategory: 'Dresses', material: 'Cotton knit', colorway: 'Oatmeal', ph: 'ph-5', price: 62, sizes: ['2T', '3T', '4T', '5', '6'], tags: ['cozy'], archetypes: ['quiet-classic'] },
  { name: 'Tiered tank dress', brand: 'Pashma Kids', subcategory: 'Dresses', material: 'Muslin cotton', colorway: 'Ivory', ph: 'ph-1', price: 52, sizes: ['2T', '3T', '4T', '5', '6'], tags: ['boho'], archetypes: ['boho-dreamer'] },
  { name: 'Pinafore dress', brand: 'Little North', subcategory: 'Dresses', material: 'Cotton twill', colorway: 'Forest', ph: 'ph-9', price: 56, sizes: ['2T', '3T', '4T', '5', '6', '7'], tags: ['prep'], archetypes: ['modern-prep'] },

  // Outerwear (5)
  { name: 'Puffer jacket', brand: 'Alpcrest Kids', subcategory: 'Outerwear', material: 'Recycled down', colorway: 'Forest', ph: 'ph-9', price: 98, sizes: ['2T', '3T', '4T', '5', '6', '7', '8'], tags: ['athletic'], archetypes: ['adventure-sport'] },
  { name: 'Rain jacket', brand: 'Alpcrest Kids', subcategory: 'Outerwear', material: 'Waterproof', colorway: 'Sage', ph: 'ph-4', price: 78, sizes: ['2T', '3T', '4T', '5', '6', '7', '8'], tags: ['utility'], archetypes: ['adventure-sport', 'coastal-sport'] },
  { name: 'Wool duffle coat', brand: 'Ardeo Kids', subcategory: 'Outerwear', material: 'Wool', colorway: 'Camel', ph: 'ph-11', price: 128, sizes: ['2T', '3T', '4T', '5', '6'], tags: ['classic'], archetypes: ['modern-prep'] },
  { name: 'Denim jacket', brand: 'Field/Note Kids', subcategory: 'Outerwear', material: 'Denim', colorway: 'Indigo', ph: 'ph-7', price: 68, sizes: ['2T', '3T', '4T', '5', '6', '7'], tags: ['rugged'], archetypes: ['rustic-rebel'] },
  { name: 'Fleece anorak', brand: 'Alpcrest Kids', subcategory: 'Outerwear', material: 'Fleece', colorway: 'Lime pop', ph: 'ph-8', price: 68, sizes: ['3T', '4T', '5', '6', '7', '8'], tags: ['athletic'], archetypes: ['adventure-sport'] },

  // Shoes (8)
  { name: 'Canvas sneaker', brand: 'North Fold Kids', subcategory: 'Shoes', material: 'Canvas', colorway: 'White', ph: 'ph-5', price: 38, sizes: ['8T', '9T', '10T', '11', '12', '13', '1'], tags: ['classic'], archetypes: ['modern-prep', 'coastal-sport'] },
  { name: 'Trail shoe', brand: 'Alpcrest Kids', subcategory: 'Shoes', material: 'Technical', colorway: 'Moss', ph: 'ph-9', price: 68, sizes: ['9T', '10T', '11', '12', '13', '1'], tags: ['athletic'], archetypes: ['adventure-sport'] },
  { name: 'Leather mary jane', brand: 'Torre Kids', subcategory: 'Shoes', material: 'Leather', colorway: 'Black', ph: 'ph-2', price: 78, sizes: ['8T', '9T', '10T', '11', '12'], tags: ['classic'], archetypes: ['modern-prep'] },
  { name: 'Rain boot', brand: 'Alpcrest Kids', subcategory: 'Shoes', material: 'Natural rubber', colorway: 'Navy', ph: 'ph-10', price: 58, sizes: ['8T', '9T', '10T', '11', '12', '13'], tags: ['utility'], archetypes: ['coastal-sport'] },
  { name: 'Suede boot', brand: 'Hinterland Kids', subcategory: 'Shoes', material: 'Suede', colorway: 'Cognac', ph: 'ph-3', price: 68, sizes: ['9T', '10T', '11', '12', '13'], tags: ['rugged'], archetypes: ['rustic-rebel'] },
  { name: 'Beaded sandal', brand: 'Pashma Kids', subcategory: 'Shoes', material: 'Leather', colorway: 'Natural', ph: 'ph-1', price: 42, sizes: ['8T', '9T', '10T', '11', '12'], tags: ['boho'], archetypes: ['boho-dreamer'] },
  { name: 'Velcro sneaker', brand: 'North Fold Kids', subcategory: 'Shoes', material: 'Synthetic', colorway: 'Sage', ph: 'ph-4', price: 42, sizes: ['8T', '9T', '10T', '11', '12'], tags: ['casual'], archetypes: ['coastal-sport', 'adventure-sport'] },
  { name: 'Ballet slipper', brand: 'Torre Kids', subcategory: 'Shoes', material: 'Canvas', colorway: 'Bone', ph: 'ph-5', price: 32, sizes: ['8T', '9T', '10T', '11', '12'], tags: ['refined'], archetypes: ['quiet-classic', 'modern-muse'] },

  // PJs (4)
  { name: 'Organic cotton pajama set', brand: 'Sprout Lab', subcategory: 'PJs', material: 'Organic cotton', colorway: 'Ink stars', ph: 'ph-10', price: 48, sizes: ['2T', '3T', '4T', '5', '6', '7', '8'], tags: ['cozy'], archetypes: ['quiet-classic'] },
  { name: 'Waffle pajama set', brand: 'Sprout Lab', subcategory: 'PJs', material: 'Waffle cotton', colorway: 'Oatmeal', ph: 'ph-5', price: 48, sizes: ['2T', '3T', '4T', '5', '6'], tags: ['cozy'], archetypes: ['modern-prep'] },
  { name: 'Striped nightgown', brand: 'Little North', subcategory: 'PJs', material: 'Cotton', colorway: 'Sage stripe', ph: 'ph-4', price: 42, sizes: ['2T', '3T', '4T', '5', '6'], tags: ['classic'], archetypes: ['coastal-sport'] },
  { name: 'Merino PJ set', brand: 'Alpcrest Kids', subcategory: 'PJs', material: 'Merino wool', colorway: 'Heather', ph: 'ph-5', price: 78, sizes: ['3T', '4T', '5', '6', '7', '8'], tags: ['cozy'], archetypes: ['adventure-sport'] },
];

// ----- Assemble & expose ------------------------------------------------

import { INVENTORY_IMAGES, INVENTORY_IMAGE_META } from './inventory-images.js';

export const CATEGORIES = ['Women', 'Men', 'Kids'];

export const SUBCATEGORIES = {
  Women: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Activewear', 'Loungewear'],
  Men: ['Tops', 'Bottoms', 'Sweaters', 'Outerwear', 'Shoes', 'Accessories', 'Activewear'],
  Kids: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'PJs'],
};

// Merge the image manifest onto each item. Items without an entry
// still render — they fall back to the editorial gradient placeholder.
function withImage(item) {
  const imageUrl = INVENTORY_IMAGES[item.id] || null;
  const imageMeta = INVENTORY_IMAGE_META[item.id] || null;
  return { ...item, imageUrl, imageMeta };
}

export const INVENTORY = [
  ...WOMEN_SEED.map((s) => withImage(make('w', { ...s, category: 'Women' }))),
  ...MEN_SEED.map((s) => withImage(make('m', { ...s, category: 'Men' }))),
  ...KIDS_SEED.map((s) => withImage(make('k', { ...s, category: 'Kids' }))),
];

/** Build the Unsplash search query we'll use for a given item. */
export function imageQueryFor(item) {
  // Tune per-category so Unsplash returns relevant clothing photos
  // rather than generic lifestyle shots.
  const segment =
    item.category === 'Kids' ? 'kids' : item.category.toLowerCase();
  const subcat = item.subcategory.toLowerCase();
  const core = item.name.toLowerCase();
  return `${core} ${subcat} ${segment} clothing`;
}

// Totals — tiny helpers used by the Inventory view and Dashboard.
export function countBy(list, key) {
  return list.reduce((acc, x) => {
    acc[x[key]] = (acc[x[key]] || 0) + 1;
    return acc;
  }, {});
}

export function stockTotals(list) {
  const total = list.length;
  const inStock = list.filter((x) => x.status === 'In stock').length;
  const low = list.filter((x) => x.status === 'Low stock').length;
  const out = list.filter((x) => x.status === 'Sold out').length;
  const avgPrice =
    list.length === 0
      ? 0
      : Math.round(list.reduce((s, x) => s + x.price, 0) / list.length);
  return { total, inStock, low, out, avgPrice };
}
