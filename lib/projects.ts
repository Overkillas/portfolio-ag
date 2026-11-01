import type { Dictionary } from '@/i18n/dictionaries';
import type { CategoryKey } from './site';

// Metadados não-translatáveis (estrutura de rota, imagens, design)
export type ProjectStatus = 'concluido' | 'em-progresso' | 'em-breve';

/** Posição do card na grade bento da página de projetos (não traduzível). */
export type ProjectGrid = {
  /** Coluna da grade bento: 0 = estreita (primeira), 1 = larga (segunda), 2 = terceira, também larga */
  column: 0 | 1 | 2;
  /** Proporção do card, no formato CSS `aspect-ratio` (ex.: '459 / 590') */
  aspect: string;
  /** Ancoragem do recorte da capa, valor CSS de `object-position` */
  objectPosition: string;
  /** Linhas da descrição exibidas no hover (corte por line-clamp) */
  descLines: number;
};

export type ProjectMeta = {
  slug: string;
  status: ProjectStatus;
  categories: CategoryKey[];
  /** Data exibida na pill do card (formato dd.mm.aaaa, como no Figma) */
  date?: string;
  /** Cor de fundo do card de capa */
  accent: 'blue' | 'orange' | 'pink';
  /** Caminho da imagem de capa em /public */
  coverImage?: string;
  /** Projeto em destaque na grade (selo e frase própria do balão) */
  featured?: boolean;
  /** Dados de layout da grade bento */
  grid: ProjectGrid;
};

// Chaves do dicionário por slug (texto translatável vive em dict.projects.*)
export const slugToKey = {
  'pontos-sem-no': 'pontosSemNo',
  'batuco-tuco': 'batucoTuco',
  'pontinhas-soltas': 'pontinhasSoltas',
} as const;

export type ProjectI18nKey = (typeof slugToKey)[Slug];
export type Slug = keyof typeof slugToKey;

export type ProjectI18n = Dictionary['projects'][ProjectI18nKey];
export type ProjectSectionI18n = ProjectI18n['sections'];

/** Projeto completo: metadados + textos do dicionário no locale carregado. */
export type LocalizedProject = ProjectMeta & ProjectI18n;

// Metadados estáticos — nenhum texto aqui (tudo vem do dicionário)
const projectMeta: ProjectMeta[] = [
  {
    slug: 'pontos-sem-no',
    status: 'concluido',
    categories: ['grafico'],
    date: '08.12.2025',
    accent: 'blue',
    coverImage: '/images/projects/pontos-sem-no/cover.webp',
    featured: true,
    grid: { column: 0, aspect: '459 / 590', objectPosition: 'left center', descLines: 4 },
  },
  {
    slug: 'batuco-tuco',
    status: 'em-progresso',
    categories: ['interacao'],
    date: '04.12.2025',
    accent: 'orange',
    coverImage: '/images/projects/batuco-tuco/cover.png',
    grid: { column: 1, aspect: '612 / 344', objectPosition: 'left center', descLines: 2 },
  },
  {
    slug: 'pontinhas-soltas',
    status: 'concluido',
    categories: ['3d'],
    date: '08.12.2025',
    accent: 'pink',
    coverImage: '/images/projects/pontinhas-soltas/cover.png',
    grid: { column: 1, aspect: '612 / 230', objectPosition: 'left center', descLines: 1 },
  },
];

/** Slugs na ordem de `projectMeta` (ordem da grade e do "próximo" do modal). */
export const projectSlugs: Slug[] = projectMeta.map((p) => p.slug as Slug);

export function getLocalizedProject(
  slug: string,
  dict: Dictionary
): LocalizedProject | undefined {
  const meta = projectMeta.find((p) => p.slug === slug);
  if (!meta) return undefined;
  if (!(slug in slugToKey)) return undefined;

  const key = slugToKey[slug as Slug];
  const i18n = dict.projects[key];

  return {
    ...meta,
    ...i18n,
  };
}

export function getLocalizedProjectsByCategory(
  category: CategoryKey,
  dict: Dictionary
): LocalizedProject[] {
  return projectMeta
    .filter((p) => p.categories.includes(category))
    .map((p) => getLocalizedProject(p.slug, dict)!)
    .filter(Boolean);
}

/** Todos os projetos localizados, na ordem de `projectMeta`. */
export function getLocalizedProjects(dict: Dictionary): LocalizedProject[] {
  return projectSlugs.map((slug) => getLocalizedProject(slug, dict)!);
}

/** Próximo slug na ordem de `projectMeta`; do último volta ao primeiro. */
export function getNextSlug(slug: Slug): Slug {
  const index = projectSlugs.indexOf(slug);
  return projectSlugs[(index + 1) % projectSlugs.length];
}

// Alias para compatibilidade
export const projectsByCategory = getLocalizedProjectsByCategory;