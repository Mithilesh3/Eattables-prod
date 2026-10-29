'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { SearchIcon } from '@/components/ui/icons';
import { useSearchSuggestions } from '@/lib/catalog/SearchProvider';
import { cn } from '@/lib/utils/cn';

/**
 * Search with live suggestions.
 *
 * Usability decisions, aimed at someone shopping online for the first time:
 *   - Suggestions appear from two characters, so results come without effort.
 *   - Each suggestion shows the product name AND its category, so the person
 *     can tell "Premium Almonds" from "BOLD Almonds" before tapping.
 *   - Arrow keys + Enter work, but nothing REQUIRES the keyboard: every row is
 *     a full-width tap target.
 *   - Pressing Enter without choosing a suggestion still searches, so the
 *     familiar "type and hit enter" habit is never punished.
 *
 * Implemented as a combobox per the WAI-ARIA pattern so screen readers announce
 * the suggestion count and the active option.
 */
export function SearchBar({
  className,
  autoFocus = false,
  placeholder = 'Search for almonds, dates, gift boxes…',
  onNavigate,
}: {
  className?: string;
  autoFocus?: boolean;
  placeholder?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const listId = useId();
  // Unique per instance: the header renders this component twice (a desktop
  // copy and a mobile copy). A hard-coded id produced DUPLICATE DOM ids, so
  // the <label for> bound only to the first — leaving the visible mobile
  // input with no accessible name.
  const inputId = useId();
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions = useSearchSuggestions(value);

  // Close when tapping outside — expected behaviour for any dropdown.
  useEffect(() => {
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, []);

  function goTo(href: string) {
    setOpen(false);
    setActiveIndex(-1);
    router.push(href);
    onNavigate?.();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const chosen = suggestions[activeIndex];
    if (chosen) {
      goTo(`/products/${chosen.slug}`);
      return;
    }
    const query = value.trim();
    goTo(query ? `/products?q=${encodeURIComponent(query)}` : '/products');
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const showList = open && suggestions.length > 0;

  return (
    <div ref={wrapperRef} className={cn('relative w-full', className)}>
      <form role="search" onSubmit={handleSubmit}>
        <label htmlFor={inputId} className="sr-only">
          Search for products
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-brand-400" />
          <input
            id={inputId}
            type="search"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
            }
            value={value}
            autoFocus={autoFocus}
            autoComplete="off"
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="h-12 w-full rounded-xl border border-brand-200 bg-white pl-12 pr-4 text-base text-brand-900 placeholder:text-brand-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
          />
        </div>
      </form>

      {showList ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Product suggestions"
          className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-brand-100 bg-white py-1 shadow-raised"
        >
          {suggestions.map((item, index) => (
            <li key={item.slug} role="none">
              <Link
                id={`${listId}-opt-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                href={`/products/${item.slug}`}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-left',
                  index === activeIndex ? 'bg-brand-50' : 'hover:bg-brand-50'
                )}
              >
                <SearchIcon className="size-4 shrink-0 text-brand-300" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-brand-900">
                    {item.name}
                  </span>
                  <span className="block truncate text-xs text-brand-400">
                    in {item.categoryName}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
