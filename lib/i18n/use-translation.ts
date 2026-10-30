'use client';

import { useI18n } from './provider';
import type { Dictionary } from '@/i18n/dictionaries';

// Chaves em notação de pontos ("contact.form.submitAriaLabel"), derivadas da
// estrutura do Dictionary — chaves inválidas viram erro de compilação.
type Path<T, P extends string = ''> = T extends string
  ? P
  : T extends object
    ? { [K in keyof T & string]: Path<T[K], P extends '' ? K : `${P}.${K}`> }[keyof T & string]
    : never;

export type TranslationKey = Path<Dictionary>;

function resolve(dict: Dictionary, key: string, locale: string): string {
  const value = key.split('.').reduce<unknown>((obj, k) => {
    if (obj && typeof obj === 'object' && k in obj) {
      return (obj as Record<string, unknown>)[k];
    }
    return undefined;
  }, dict);

  if (typeof value !== 'string') {
    console.warn(`Missing translation: ${key} (locale: ${locale})`);
    return key;
  }
  return value;
}

export function useTranslations() {
  const { dict, locale } = useI18n();
  return { t: (key: TranslationKey) => resolve(dict, key, locale), locale, dict };
}

export function createTranslator(dict: Dictionary, locale: string) {
  return (key: TranslationKey) => resolve(dict, key, locale);
}