'use client';

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

/**
 * Minimal toast system.
 *
 * Purpose is confirmation, not decoration: when someone taps "Add", they need
 * unambiguous proof it worked, without a modal that interrupts shopping. The
 * region is aria-live so screen-reader users get the same confirmation.
 */

interface Toast {
  id: number;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

interface ToastApi {
  show: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl bg-brand-900 px-4 py-3 text-white shadow-raised"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-leaf-500 text-xs font-bold">
              ✓
            </span>
            <p className="flex-1 text-sm">{toast.message}</p>
            {toast.actionHref ? (
              <a
                href={toast.actionHref}
                className="shrink-0 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-semibold hover:bg-white/25"
              >
                {toast.actionLabel ?? 'View'}
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
