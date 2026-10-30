import type { Locale } from './config';
import ptBR from '@/dictionaries/pt-BR.json';
import en from '@/dictionaries/en.json';

// Fonte de verdade: a estrutura do dicionário é derivada de pt-BR.
// O import de en.json com `satisfies` faz o build falhar se o inglês
// estiver com estrutura divergente (chave faltando ou de outro tipo).
export type Dictionary = typeof ptBR;

const dictionaries = {
  'pt-BR': ptBR,
  en,
} satisfies Record<Locale, Dictionary>;

export type { Locale };

export const isLocale = (lang: string): lang is Locale =>
  lang === 'pt-BR' || lang === 'en';

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale];