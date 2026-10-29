import type { Paise, ProductStatus } from './common.js';

/**
 * Catalogue display types.
 *
 * These mirror the Firestore documents described in docs/DATA_MODEL and are the
 * contract between the catalogue data source and every UI that renders it.
 * Keeping them here means the storefront, the admin panel and (later) mobile all
 * agree on the shape of a product.
 */

export interface ProductVariant {
  sku: string;
  variantId: string;
  /** e.g. { weight: '500g' } or { flavour: "Lime 'n Chilli" } */
  optionValues: Record<string, string>;
  /** Maximum Retail Price, in paise. */
  mrp: Paise;
  /** What the customer actually pays, in paise. */
  sellingPrice: Paise;
  weightGrams: number;
  isActive: boolean;
}

export interface ProductImage {
  url: string;
  alt: string;
}

export type ProductType = 'shelf_stable' | 'cut_fresh' | 'gift_box' | 'combo';

export interface Product {
  productId: string;
  slug: string;
  name: string;
  shortDescription: string;
  description?: string;
  brand: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  productType: ProductType;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  status: ProductStatus;
}

export interface Category {
  categoryId: string;
  slug: string;
  name: string;
  description: string;
  /** Short label used on the homepage tile. */
  tagline?: string;
  sortOrder: number;
  isActive: boolean;
}

/** Compact card shape — what listing pages and rails actually need. */
export interface CatalogItem {
  productId: string;
  slug: string;
  name: string;
  shortDescription: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  productType: ProductType;
  tags: string[];
  image: ProductImage | null;
  priceMin: Paise;
  priceMax: Paise;
  mrpMax: Paise;
  inStock: boolean;
  variantCount: number;
}

/**
 * Where catalogue data came from. The UI uses this to make demo data obvious:
 * a storefront must never present placeholder pricing as if it were real.
 */
export type CatalogSource = 'firestore' | 'demo' | 'empty';

export interface CatalogResult<T> {
  items: T[];
  source: CatalogSource;
}

/** Derives the card-shaped projection from a full product document. */
export function toCatalogItem(product: Product): CatalogItem {
  const active = product.variants.filter((v) => v.isActive);
  const prices = active.map((v) => v.sellingPrice);
  const mrps = active.map((v) => v.mrp);

  return {
    productId: product.productId,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    brand: product.brand,
    categorySlug: product.categorySlug,
    categoryName: product.categoryName,
    productType: product.productType,
    tags: product.tags,
    image: product.images[0] ?? null,
    priceMin: prices.length ? Math.min(...prices) : 0,
    priceMax: prices.length ? Math.max(...prices) : 0,
    mrpMax: mrps.length ? Math.max(...mrps) : 0,
    inStock: active.length > 0,
    variantCount: active.length,
  };
}

/** Percentage off MRP, rounded down. Returns 0 when there is no discount. */
export function discountPercent(sellingPrice: Paise, mrp: Paise): number {
  if (mrp <= 0 || sellingPrice >= mrp) return 0;
  return Math.floor(((mrp - sellingPrice) / mrp) * 100);
}
