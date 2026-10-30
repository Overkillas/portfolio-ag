export type CategoryKey = 'grafico' | 'interacao' | 'servicos' | '3d';

// Keys only — labels come from dictionary (dict.nav.*)
export const navLinks = [
  { key: 'about', href: '/' },
  { key: 'contact', href: '/contato' },
] as const;

export const categoryTabs = [
  { key: 'grafico', href: '/grafico' },
  { key: 'interacao', href: '/interacao' },
  { key: 'servicos', href: '/servicos' },
  { key: '3d', href: '/3d' },
] as const;

// Non-translatable site data
export const site = {
  email: 'agatha@example.com',
  social: {
    instagram: { handle: '@aggy_colon', url: 'https://instagram.com/aggy_colon' },
    linkedin: { handle: 'Ágatha Ferreira', url: 'https://www.linkedin.com/in/agatha-ferreira-sales' },
  },
} as const;