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

/**
 * Links e nomes da página Minha carreira (Figma 226:56). Dados, não texto: ficam fora do
 * dicionário. `null` = link ainda não informado (o elemento aparece sem link).
 */
export type CareerDev = { slug: string; name: string; linkedin: string | null };
/** Chave em dict.career.publications.items. */
export type PublicationKey = 'ludificacao' | 'espaleira' | 'hep2' | 'cincoPlanos';
/**
 * Uma publicação do ticket. `rows`: quantas pills vão em cada fileira (as fileiras do
 * Figma, frames TCC1/Espaleira/HEP2/5 planos); em telas estreitas elas ainda quebram.
 */
export type CareerPublication = { key: PublicationKey; url: string | null; rows: readonly number[] };

export const career: {
  musicChannel: string;
  publications: readonly CareerPublication[];
  devs: readonly CareerDev[];
} = {
  /** "Meu canal de música" (anotação do Figma no 226:497: id do canal no YouTube). */
  musicChannel: 'https://www.youtube.com/channel/UCGZGlogw4iBZehMIJ6ILZfg',
  /**
   * Ticket "clique aqui para ler a publicação": a ordem é a do "próxima" (e do autoplay).
   * Depois da última, o ticket rebobina até a primeira.
   */
  publications: [
    { key: 'ludificacao', url: null, rows: [2, 3] },
    { key: 'espaleira', url: null, rows: [3, 2] },
    { key: 'hep2', url: null, rows: [3, 1] },
    { key: 'cincoPlanos', url: null, rows: [3, 2] },
  ],
  /** "sobre este site": nome, avatar (public/images/carreira/devs/<slug>.webp) e LinkedIn. */
  devs: [
    { slug: 'kaike', name: 'Kaíke Petalas', linkedin: 'https://www.linkedin.com/in/ka%C3%ADke-petalas/' },
    { slug: 'joao-vitor', name: 'João Vitor', linkedin: 'https://www.linkedin.com/in/joao-victor-barreto/' },
    { slug: 'andre', name: 'André Garcia', linkedin: 'https://www.linkedin.com/in/andre-garcia0412' },
    { slug: 'joao-pedro', name: 'João Pedro', linkedin: 'https://www.linkedin.com/in/jo%C3%A3o-pedro-lima-464398222/' },
    { slug: 'valentim', name: 'Valentim Aragão', linkedin: 'https://www.linkedin.com/in/valentimdev/' },
    { slug: 'gilberto', name: 'Gilberto Egypto', linkedin: 'https://www.linkedin.com/in/gilberto-fabio-egypto-98b080231/' },
    { slug: 'raquel', name: 'Raquel Quirino', linkedin: 'https://www.linkedin.com/in/raquel-albuquerque-93a053328/' },
  ],
};