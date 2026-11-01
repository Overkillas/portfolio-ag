'use client';

import { useSyncExternalStore } from 'react';

/**
 * Assina uma media query sem estado local nem efeito: o snapshot de servidor é
 * sempre `false`, então o HTML inicial é o mesmo para todo mundo e o valor real
 * entra na hidratação.
 */
function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** Mouse/trackpad de verdade: hover disponível e ponteiro fino. */
export function useFinePointer(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}
