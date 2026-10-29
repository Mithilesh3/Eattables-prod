/**
 * Shown whenever the page is rendering placeholder catalogue data.
 *
 * This is a correctness control, not decoration. The demo catalogue contains
 * invented prices, and a storefront that displays invented prices without
 * saying so is misleading. The notice is unmissable and disappears on its own
 * the moment real catalogue data is available.
 */
export function DemoDataNotice() {
  return (
    <div className="border-b border-accent-200 bg-accent-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-accent-700 sm:text-sm">
          <span className="font-semibold">Demo catalogue.</span> Product names come from
          the Eattables brand deck;{' '}
          <strong>prices are placeholders and are not real</strong>. Real products and
          pricing are pending from the business owner.
        </p>
      </div>
    </div>
  );
}
