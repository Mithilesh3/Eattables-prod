'use client';

import { type ReactNode, createContext, useContext, useMemo } from 'react';

/**
 * Client-side search index.
 *
 * The compact index is fetched once on the server and handed to the client, which
 * is exactly what the approved architecture's `catalogIndex` design is for: a
 * small catalogue searches faster in the browser than over a network round-trip,
 * costs no Firestore reads per keystroke, and needs no search service.
 *
 * Matching is deliberately forgiving — a first-time shopper typing "badam" or
 * "kaju" should still find almonds and cashews, so entries carry alias keywords.
 */

export interface SearchEntry {
  slug: string;
  name: string;
  categoryName: string;
  categorySlug: string;
  /** Lowercased tokens: name, category, tags and common Hindi aliases. */
  keywords: string[];
}

const SearchContext = createContext<SearchEntry[]>([]);

export function SearchProvider({
  entries,
  children,
}: {
  entries: SearchEntry[];
  children: ReactNode;
}) {
  return <SearchContext.Provider value={entries}>{children}</SearchContext.Provider>;
}

export function useSearchSuggestions(query: string, limit = 6): SearchEntry[] {
  const entries = useContext(SearchContext);

  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const scored = entries
      .map((entry) => {
        const name = entry.name.toLowerCase();
        let score = 0;
        if (name.startsWith(q)) score = 100;
        else if (name.includes(q)) score = 70;
        else if (entry.keywords.some((k) => k.startsWith(q))) score = 50;
        else if (entry.keywords.some((k) => k.includes(q))) score = 30;
        return { entry, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name));

    return scored.slice(0, limit).map((s) => s.entry);
  }, [entries, query, limit]);
}
