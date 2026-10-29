import {
  type CatalogItem,
  type CatalogResult,
  type Category,
  type Product,
  toCatalogItem,
} from '@eattables/shared';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from '@/content/demo-catalog';
import type { SearchEntry } from '@/lib/catalog/SearchProvider';
import { isFirebaseConfigured } from '@/lib/firebase/client';

/**
 * The catalogue data source.
 *
 * Resolution order:
 *   1. Firestore, once a project is configured and the catalogue is populated.
 *   2. Demo placeholder data — ONLY outside production, and always reported as
 *      `source: 'demo'` so the UI can label it.
 *   3. Empty, which the UI renders as a proper empty state.
 *
 * Why the production guard matters: the demo file contains invented prices. If
 * it were ever to render on a live site, customers would see prices the business
 * never set. The guard makes that impossible rather than merely unlikely.
 *
 * Firestore reads land in Phase 3 together with the admin product editor; the
 * seam is here so that switching over touches this file only.
 */

const DEMO_ALLOWED = process.env.NODE_ENV !== 'production';

export function isDemoCatalog(source: CatalogResult<unknown>['source']): boolean {
  return source === 'demo';
}

async function loadProducts(): Promise<CatalogResult<Product>> {
  if (isFirebaseConfigured()) {
    // Phase 3: read catalogIndex / products from Firestore here.
    // Until then a configured project with no catalogue still yields nothing,
    // which is the correct, honest result.
  }

  if (DEMO_ALLOWED) {
    return { items: DEMO_PRODUCTS, source: 'demo' };
  }

  return { items: [], source: 'empty' };
}

async function loadCategories(): Promise<CatalogResult<Category>> {
  if (DEMO_ALLOWED) {
    return { items: DEMO_CATEGORIES, source: 'demo' };
  }
  return { items: [], source: 'empty' };
}

export async function getCategories(): Promise<CatalogResult<Category>> {
  const { items, source } = await loadCategories();
  return {
    items: [...items].filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    source,
  };
}

export async function getCatalogItems(): Promise<CatalogResult<CatalogItem>> {
  const { items, source } = await loadProducts();
  return {
    items: items.filter((p) => p.status === 'active').map(toCatalogItem),
    source,
  };
}

/** Products tagged for the homepage rail. Falls back to the first N items. */
export async function getFeaturedProducts(
  limit = 8
): Promise<CatalogResult<CatalogItem>> {
  const { items, source } = await getCatalogItems();
  const tagged = items.filter((i) => i.tags.includes('featured'));
  const pool = tagged.length >= 4 ? tagged : items;
  return { items: pool.slice(0, limit), source };
}

export async function getBestsellers(limit = 8): Promise<CatalogResult<CatalogItem>> {
  const { items, source } = await getCatalogItems();
  const tagged = items.filter((i) => i.tags.includes('bestseller'));
  const pool = tagged.length >= 4 ? tagged : items;
  return { items: pool.slice(0, limit), source };
}

/**
 * Common Hindi/colloquial names for staples, so that someone typing what they
 * actually call the product still finds it. Keyed by product slug fragment.
 */
const SEARCH_ALIASES: Record<string, string[]> = {
  almond: ['badam'],
  cashew: ['kaju'],
  raisin: ['kishmish', 'dry fruit'],
  date: ['khajoor', 'khajur'],
  honey: ['shahad'],
  oil: ['tel'],
  gift: ['gift box', 'tohfa'],
  spice: ['masala'],
  pickle: ['achar'],
};

/** Builds the compact index handed to the browser for instant search. */
export async function getSearchEntries(): Promise<SearchEntry[]> {
  const { items } = await getCatalogItems();

  return items.map((item) => {
    // The category must be part of the haystack, not just the product name.
    // Aliases are keyed on general words ("pickle", "spice"), while products
    // are named specifically ("Amla Murabba") — matching on the name alone
    // meant "achar" found nothing even though a pickle product existed.
    const haystack =
      `${item.slug} ${item.name} ${item.categorySlug} ${item.categoryName}`.toLowerCase();
    const aliases = Object.entries(SEARCH_ALIASES)
      .filter(([key]) => haystack.includes(key))
      .flatMap(([, values]) => values);

    return {
      slug: item.slug,
      name: item.name,
      categoryName: item.categoryName,
      categorySlug: item.categorySlug,
      keywords: [
        ...item.name.toLowerCase().split(/\s+/),
        item.categoryName.toLowerCase(),
        item.brand.toLowerCase(),
        ...item.tags,
        ...aliases,
      ].filter(Boolean),
    };
  });
}

export async function getProductsByCategory(
  categorySlug: string
): Promise<CatalogResult<CatalogItem>> {
  const { items, source } = await getCatalogItems();
  return { items: items.filter((i) => i.categorySlug === categorySlug), source };
}
