'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';
import { HomeFooter } from './HomeFooter';
import type { Dictionary, Locale } from '@/i18n/dictionaries';

/**
 * Alterna entre o Footer antigo (bg-band, outras páginas) e o HomeFooter novo
 * (Figma "Pontossemno", spec v2 §4.9 — "visite também" gigante transbordando
 * acima da banda) conforme a rota. Espelha o HeaderRouter do Plan 1: o footer
 * vive no layout, e a rota só é conhecível no cliente via usePathname().
 * Home = exatamente /{locale} (com ou sem barra final; usePathname não devolve
 * barra final, mas normalizamos por segurança).
 */
export function FooterRouter({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname();
  const isHome = pathname.replace(/\/$/, '') === `/${locale}`;

  return isHome ? <HomeFooter dict={dict} /> : <Footer dict={dict} />;
}
