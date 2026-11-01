import type { CategoryKey } from './site';
import type { LocalizedProject } from './projects';

export type BentoColumn = {
  key: 0 | 1 | 2;
  /** A coluna 0 é a estreita; as demais são largas. */
  wide: boolean;
  items: { project: LocalizedProject; index: number }[];
};

/**
 * Distribui os projetos nas colunas da grade bento, respeitando `grid.column` de cada um.
 * `index` numera os cards na ordem de saída (coluna a coluna) e dá o atraso da animação de
 * entrada. Colunas sem projeto somem.
 */
export function distributeColumns(projects: LocalizedProject[]): BentoColumn[] {
  let index = 0;
  return ([0, 1, 2] as const)
    .map((key) => ({
      key,
      wide: key !== 0,
      items: projects
        .filter((project) => project.grid.column === key)
        .map((project) => ({ project, index: index++ })),
    }))
    .filter((column) => column.items.length > 0);
}

export type ProjectFilter = 'all' | CategoryKey;

/** Ordem das pílulas de filtro. */
export const filterOrder: ProjectFilter[] = ['all', 'servicos', '3d', 'interacao', 'grafico'];

/** Apara, passa para minúsculas e remove diacríticos: "  GRÁFICO " vira "grafico". */
export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/**
 * Filtra por área e por busca. A busca olha título, descrição, tags e o rótulo de cada categoria
 * do projeto (no idioma atual, o mesmo texto das pílulas).
 */
export function filterProjects(
  projects: LocalizedProject[],
  query: string,
  filter: ProjectFilter,
  categoryLabels: Record<CategoryKey, string>,
): LocalizedProject[] {
  const q = normalizeText(query);
  return projects.filter((project) => {
    if (filter !== 'all' && !project.categories.includes(filter)) return false;
    if (!q) return true;
    const haystack = [
      project.title,
      project.description,
      ...project.tags,
      ...project.categories.map((category) => categoryLabels[category]),
    ];
    return haystack.some((text) => normalizeText(text).includes(q));
  });
}

export type BubbleKey =
  | 'idle'
  | 'featured'
  | 'hover'
  | 'found'
  | 'filteredOne'
  | 'filteredMany'
  | 'empty';

/** Escolhe a frase do balão: hover, depois vazio, depois busca, depois filtro. */
export function bubbleKey({
  hovered,
  query,
  filter,
  count,
}: {
  hovered: LocalizedProject | undefined;
  query: string;
  filter: ProjectFilter;
  count: number;
}): BubbleKey {
  if (hovered) return hovered.featured ? 'featured' : 'hover';
  if (count === 0) return 'empty';
  if (normalizeText(query)) return 'found';
  if (filter !== 'all') return count === 1 ? 'filteredOne' : 'filteredMany';
  return 'idle';
}
