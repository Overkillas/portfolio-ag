'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { HomeHeader } from './HomeHeader';
import type { Dictionary, Locale } from '@/i18n/dictionaries';

/**
 * Alterna entre o Header antigo (sticky, 6 links + category tabs) e o
 * HomeHeader novo (Figma "Pontossemno", spec v2 §4.1) conforme a rota:
 * a home v2 usa o header limpo; TODAS as outras páginas (contato, categorias,
 * projetos) continuam no Header antigo, que é renderizado no layout.
 *
 * Client wrapper porque determinar a rota exige usePathname() — leitura de URL
 * em Server Component não é suportada no App Router por design (o layout é
 * preservado entre navegações). Home = exatamente /{locale} (com ou sem barra
 * final; usePathname não devolve barra final, mas normalizamos por segurança).
 */
export function HeaderRouter({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname();
  const isHome = pathname.replace(/\/$/, '') === `/${locale}`;

  return isHome ? (
    <HomeHeader locale={locale} dict={dict} />
  ) : (
    <Header locale={locale} dict={dict} />
  );
}