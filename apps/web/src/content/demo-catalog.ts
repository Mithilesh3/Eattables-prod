import type { Category, Product } from '@eattables/shared';

/**
 * ============================================================================
 * DEMO CATALOGUE — PLACEHOLDER DATA. NOT REAL PRODUCTS OR PRICES.
 * ============================================================================
 *
 * Purpose: let the storefront be designed, reviewed and tested before the real
 * catalogue exists. Used ONLY when Firestore has no catalogue data AND the app
 * is not running in production (see src/lib/catalog/source.ts).
 *
 * The PRODUCT NAMES and CATEGORIES are taken from the Eattables pitch deck
 * (pages 5-8) and are therefore real product *lines*. The PRICES ARE INVENTED
 * PLACEHOLDERS and must never be presented as real: every surface that renders
 * this data shows a visible "Demo data" indicator, and the site refuses to use
 * this file when NODE_ENV is production.
 *
 * Replace this entirely once the business owner supplies the real catalogue
 * (open question Q3 in docs/OPEN_QUESTIONS.md). Do not add a product here that
 * the business has not confirmed, and do not let these prices leak into any
 * order, invoice or Firestore document.
 */

/** Obvious placeholder pricing: every value ends in 00 paise and is round. */
const p = (rupees: number) => rupees * 100;

export const DEMO_CATEGORIES: Category[] = [
  {
    categoryId: 'cat_dry_fruits',
    slug: 'dry-fruits-superfoods',
    name: 'Dry Fruits & Superfoods',
    description: 'Almonds, cashews, raisins and daily-nutrition staples.',
    tagline: 'Daily nutrition',
    sortOrder: 1,
    isActive: true,
  },
  {
    categoryId: 'cat_dates',
    slug: 'dates-sweeteners',
    name: 'Dates & Sweeteners',
    description: 'Dates and natural sweeteners.',
    tagline: 'Naturally sweet',
    sortOrder: 2,
    isActive: true,
  },
  {
    categoryId: 'cat_gifting',
    slug: 'premium-gifting',
    name: 'Premium Gifting',
    description: 'Festive and corporate date gift boxes.',
    tagline: 'Festive & corporate',
    sortOrder: 3,
    isActive: true,
  },
  {
    categoryId: 'cat_snacking',
    slug: 'smart-snacking',
    name: 'Smart Snacking',
    description: 'BOLD single-serve flavoured nuts.',
    tagline: 'Five bold flavours',
    sortOrder: 4,
    isActive: true,
  },
  {
    categoryId: 'cat_spices',
    slug: 'whole-spices',
    name: 'Whole Spices',
    description: 'Sourced and quality-checked.',
    tagline: 'Sourced & checked',
    sortOrder: 5,
    isActive: true,
  },
  {
    categoryId: 'cat_oils',
    slug: 'oils',
    name: 'Oils',
    description: 'Cooking oils for everyday use.',
    tagline: 'Everyday cooking',
    sortOrder: 6,
    isActive: true,
  },
  {
    categoryId: 'cat_pickles',
    slug: 'pickles-gourmet',
    name: 'Pickles & Gourmet',
    description: 'Amla Murabba, Bel Murabba, Guava Candy and more.',
    tagline: 'Traditional gourmet',
    sortOrder: 7,
    isActive: true,
  },
  {
    categoryId: 'cat_honey',
    slug: 'honey-jams',
    name: 'Honey & Jams',
    description: 'Natural sweetening staples.',
    tagline: 'Pure & natural',
    sortOrder: 8,
    isActive: true,
  },
];

interface DemoSpec {
  id: string;
  slug: string;
  name: string;
  short: string;
  categoryId: string;
  type: Product['productType'];
  brand?: string;
  tags?: string[];
  variants: Array<{
    label: string;
    option: Record<string, string>;
    mrp: number;
    price: number;
    grams: number;
  }>;
}

const SPECS: DemoSpec[] = [
  {
    id: 'demo_almonds',
    slug: 'premium-almonds',
    name: 'Premium Almonds',
    short: 'Whole premium almonds in a signature jar.',
    categoryId: 'cat_dry_fruits',
    type: 'shelf_stable',
    tags: ['bestseller', 'daily-nutrition'],
    variants: [
      {
        label: '250g',
        option: { weight: '250g' },
        mrp: p(500),
        price: p(425),
        grams: 250,
      },
      {
        label: '500g',
        option: { weight: '500g' },
        mrp: p(950),
        price: p(799),
        grams: 500,
      },
      {
        label: '1kg',
        option: { weight: '1kg' },
        mrp: p(1800),
        price: p(1499),
        grams: 1000,
      },
    ],
  },
  {
    id: 'demo_cashews',
    slug: 'whole-cashews',
    name: 'Whole Cashews',
    short: 'Creamy whole cashews, hand-sorted.',
    categoryId: 'cat_dry_fruits',
    type: 'shelf_stable',
    tags: ['bestseller'],
    variants: [
      {
        label: '250g',
        option: { weight: '250g' },
        mrp: p(600),
        price: p(525),
        grams: 250,
      },
      {
        label: '500g',
        option: { weight: '500g' },
        mrp: p(1150),
        price: p(999),
        grams: 500,
      },
    ],
  },
  {
    id: 'demo_raisins',
    slug: 'raisins-dried-fruits',
    name: 'Raisins & Dried Fruits',
    short: 'Golden, red and black raisins.',
    categoryId: 'cat_dry_fruits',
    type: 'shelf_stable',
    tags: ['featured'],
    variants: [
      {
        label: '250g',
        option: { weight: '250g' },
        mrp: p(300),
        price: p(249),
        grams: 250,
      },
      {
        label: '500g',
        option: { weight: '500g' },
        mrp: p(560),
        price: p(469),
        grams: 500,
      },
    ],
  },
  {
    id: 'demo_signature_box',
    slug: 'signature-dates-gift-box',
    name: 'Signature Dates Gift Box',
    short: 'Chocolate, rose and fruit-stuffed dates.',
    categoryId: 'cat_gifting',
    type: 'gift_box',
    tags: ['featured', 'gifting'],
    variants: [
      {
        label: '9 pieces',
        option: { pieces: '9' },
        mrp: p(1400),
        price: p(1199),
        grams: 300,
      },
      {
        label: '16 pieces',
        option: { pieces: '16' },
        mrp: p(2400),
        price: p(1999),
        grams: 520,
      },
    ],
  },
  {
    id: 'demo_emerald_box',
    slug: 'nut-stuffed-dates-emerald',
    name: 'Nut-Stuffed Dates — Emerald',
    short: 'Almond, cashew and pistachio fills.',
    categoryId: 'cat_gifting',
    type: 'gift_box',
    tags: ['gifting', 'bestseller'],
    variants: [
      {
        label: '5 pieces',
        option: { pieces: '5' },
        mrp: p(900),
        price: p(749),
        grams: 180,
      },
    ],
  },
  {
    id: 'demo_cocoa_box',
    slug: 'chocolate-dates-cocoa',
    name: 'Chocolate Dates — Cocoa',
    short: 'Dark, white-chocolate and gold-leaf finishes.',
    categoryId: 'cat_gifting',
    type: 'gift_box',
    tags: ['gifting'],
    variants: [
      {
        label: '5 pieces',
        option: { pieces: '5' },
        mrp: p(1000),
        price: p(849),
        grams: 190,
      },
    ],
  },
  {
    id: 'demo_bold_cashew',
    slug: 'bold-cashews',
    name: 'BOLD Cashews',
    short:
      "Five flavours: Lime 'n Chilli, Wasabi & Soy, Habanero BBQ, Salt 'n Vinegar, Sriracha.",
    categoryId: 'cat_snacking',
    type: 'shelf_stable',
    brand: 'BOLD',
    tags: ['new', 'snacking'],
    variants: [
      {
        label: "Lime 'n Chilli",
        option: { flavour: "Lime 'n Chilli" },
        mrp: p(60),
        price: p(50),
        grams: 30,
      },
      {
        label: 'Wasabi & Soy Sauce',
        option: { flavour: 'Wasabi & Soy Sauce' },
        mrp: p(60),
        price: p(50),
        grams: 30,
      },
      {
        label: 'Habanero BBQ',
        option: { flavour: 'Habanero BBQ' },
        mrp: p(60),
        price: p(50),
        grams: 30,
      },
      {
        label: "Salt 'n Vinegar",
        option: { flavour: "Salt 'n Vinegar" },
        mrp: p(60),
        price: p(50),
        grams: 30,
      },
      {
        label: 'Sriracha Smokehouse',
        option: { flavour: 'Sriracha Smokehouse' },
        mrp: p(60),
        price: p(50),
        grams: 30,
      },
    ],
  },
  {
    id: 'demo_bold_almond',
    slug: 'bold-almonds',
    name: 'BOLD Almonds',
    short: 'Single-serve flavoured almonds built for impulse snacking.',
    categoryId: 'cat_snacking',
    type: 'shelf_stable',
    brand: 'BOLD',
    tags: ['new', 'snacking'],
    variants: [
      {
        label: "Lime 'n Chilli",
        option: { flavour: "Lime 'n Chilli" },
        mrp: p(60),
        price: p(50),
        grams: 30,
      },
      {
        label: 'Habanero BBQ',
        option: { flavour: 'Habanero BBQ' },
        mrp: p(60),
        price: p(50),
        grams: 30,
      },
      {
        label: 'Sriracha Smokehouse',
        option: { flavour: 'Sriracha Smokehouse' },
        mrp: p(60),
        price: p(50),
        grams: 30,
      },
    ],
  },
  {
    id: 'demo_medjool',
    slug: 'premium-dates',
    name: 'Premium Dates',
    short: 'Soft, naturally sweet dates for everyday energy.',
    categoryId: 'cat_dates',
    type: 'shelf_stable',
    tags: ['bestseller', 'featured'],
    variants: [
      {
        label: '400g',
        option: { weight: '400g' },
        mrp: p(700),
        price: p(599),
        grams: 400,
      },
      {
        label: '800g',
        option: { weight: '800g' },
        mrp: p(1300),
        price: p(1099),
        grams: 800,
      },
    ],
  },
  {
    id: 'demo_amla',
    slug: 'amla-murabba',
    name: 'Amla Murabba',
    short: 'Traditional preserve, slow-made in small batches.',
    categoryId: 'cat_pickles',
    type: 'shelf_stable',
    tags: ['traditional'],
    variants: [
      {
        label: '500g',
        option: { weight: '500g' },
        mrp: p(350),
        price: p(299),
        grams: 500,
      },
    ],
  },
  {
    id: 'demo_honey',
    slug: 'natural-honey',
    name: 'Natural Honey',
    short: 'Unprocessed honey, a natural sweetening staple.',
    categoryId: 'cat_honey',
    type: 'shelf_stable',
    tags: ['featured'],
    variants: [
      {
        label: '500g',
        option: { weight: '500g' },
        mrp: p(450),
        price: p(399),
        grams: 500,
      },
    ],
  },
  {
    id: 'demo_sunflower_oil',
    slug: 'sunflower-oil',
    name: 'Sunflower Oil',
    short: 'Light, everyday cooking oil.',
    categoryId: 'cat_oils',
    type: 'shelf_stable',
    tags: [],
    variants: [
      { label: '1L', option: { volume: '1L' }, mrp: p(220), price: p(199), grams: 910 },
    ],
  },
];

const categoryById = new Map(DEMO_CATEGORIES.map((c) => [c.categoryId, c]));

export const DEMO_PRODUCTS: Product[] = SPECS.map((spec) => {
  const category = categoryById.get(spec.categoryId)!;
  return {
    productId: spec.id,
    slug: spec.slug,
    name: spec.name,
    shortDescription: spec.short,
    description: spec.short,
    brand: spec.brand ?? 'eattables',
    categoryId: spec.categoryId,
    categorySlug: category.slug,
    categoryName: category.name,
    productType: spec.type,
    tags: spec.tags ?? [],
    images: [],
    status: 'active' as const,
    variants: spec.variants.map((v, i) => ({
      sku: `DEMO-${spec.id.replace('demo_', '').toUpperCase()}-${i + 1}`,
      variantId: `${spec.id}_v${i + 1}`,
      optionValues: v.option,
      mrp: v.mrp,
      sellingPrice: v.price,
      weightGrams: v.grams,
      isActive: true,
    })),
  };
});
