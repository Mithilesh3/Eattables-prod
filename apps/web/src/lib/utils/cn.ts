/**
 * Minimal class-name joiner. Filters out false/null/undefined so conditional
 * classes read cleanly: cn('base', isActive && 'active').
 *
 * Deliberately not clsx + tailwind-merge: at this size the dependency is not
 * earned, and no component currently relies on conflicting-class resolution.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
