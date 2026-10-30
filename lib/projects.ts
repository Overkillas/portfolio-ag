import type { Dictionary } from '@/i18n/dictionaries';
import type { CategoryKey } from './site';

// Metadados não-translatáveis (estrutura de rota, imagens, design)
export type ProjectStatus = 'concluido' | 'em-progresso' | 'em-breve';

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
  },
  {
    slug: 'batuco-tuco',
    status: 'em-progresso',
    categories: ['interacao'],
    date: '04.12.2025',
    accent: 'orange',
    coverImage: '/images/projects/batuco-tuco/cover.png',
  },
  {
    slug: 'pontinhas-soltas',
    status: 'concluido',
    categories: ['3d'],
    date: '08.12.2025',
    accent: 'pink',
    coverImage: '/images/projects/pontinhas-soltas/cover.png',
  },
];

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

// Alias para compatibilidade
export const projectsByCategory = getLocalizedProjectsByCategory;