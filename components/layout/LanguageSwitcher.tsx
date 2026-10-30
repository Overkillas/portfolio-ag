'use client';

import { usePathname, useRouter } from 'next/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

export function LanguageSwitcher({
  currentLocale,
  dict,
}: {
  currentLocale: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: Locale) => {
    // Persist preference (1 year). document.cookie é a única API síncrona de
    // cookies no cliente; atribuição legítima num click handler, não uma
    // mutação de estado do React.
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Swap locale prefix: /pt-BR/contato → /en/contato
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');

    router.push(newPath);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1 rounded-full bg-[color:var(--color-blue-soft)]/30 p-1">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          aria-label={dict.nav.switchLocale.replace('{name}', localeNames[locale])}
          aria-pressed={locale === currentLocale}
          className={`rounded-full px-3 py-1 text-sm transition-all ${
            locale === currentLocale
              ? 'bg-[color:var(--color-blue)] text-[color:var(--color-cream)] font-bold'
              : 'text-[color:var(--color-blue)] hover:bg-[color:var(--color-blue-soft)]/50 font-normal'
          }`}
        >
          {localeNames[locale]}
        </button>
      ))}
    </div>
  );
}