import { CategoryGrid } from '@/components/home/CategoryGrid';
import { GiftingBanner } from '@/components/home/GiftingBanner';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ProductRail } from '@/components/home/ProductRail';
import { ValueProps } from '@/components/home/ValueProps';
import { DemoDataNotice } from '@/components/layout/DemoDataNotice';
import {
  getBestsellers,
  getCategories,
  getFeaturedProducts,
  isDemoCatalog,
} from '@/lib/catalog/source';

/**
 * Homepage — a server component.
 *
 * Catalogue data is fetched on the server so the page is server-rendered for
 * SEO, which the go-to-market plan depends on. Each section renders its own
 * empty state, so an unpublished catalogue degrades gracefully instead of
 * leaving holes in the layout.
 */
export default async function HomePage() {
  const [categories, featured, bestsellers] = await Promise.all([
    getCategories(),
    getFeaturedProducts(4),
    getBestsellers(4),
  ]);

  const usingDemoData =
    isDemoCatalog(categories.source) || isDemoCatalog(featured.source);

  return (
    <>
      {usingDemoData ? <DemoDataNotice /> : null}

      <Hero />

      {/* Categories come first after the hero: browsing by category is the
          easiest path for someone who does not know what to search for. */}
      <CategoryGrid categories={categories.items} />

      <ProductRail
        title="Bestsellers"
        description="The staples our customers reorder most."
        items={bestsellers.items}
        viewAllHref="/products?tag=bestseller"
        className="bg-cream-100"
      />

      <HowItWorks />

      <ProductRail
        title="Featured this season"
        description="A curated selection from across the Eattables range."
        items={featured.items}
        viewAllHref="/products"
      />

      <GiftingBanner />

      <ValueProps />
    </>
  );
}
