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
  /**
   * Layout da página do case. 'wide' = coluna de 1352px do Figma novo, com o
   * cabeçalho (título, tags, intro) desenhado pelo próprio corpo do case.
   * Sem valor = coluna estreita padrão do CaseShell.
   */
  layout?: 'wide';
  /**
   * Abre como página completa a partir de /projetos (card e "próximo" do modal fazem
   * navegação de página inteira), em vez do modal interceptado. Usado quando a página
   * do case tem coisas que o modal não tem (Batuco-tuco e Pontinhas soltas: animações,
   * lightbox, barra e footer do Figma). Também tira o header do site (`isFullPageCase`).
   */
  opensAsPage?: boolean;
};

// Chaves do dicionário por slug (texto translatável vive em dict.projects.*)
export const slugToKey = {
  'pontos-sem-no': 'pontosSemNo',
  'batuco-tuco': 'batucoTuco',
  'pontinhas-soltas': 'pontinhasSoltas',
  'identidade-evento-15-anos': 'identidadeEvento15Anos',
  caju: 'caju',
  cascavel: 'cascavel',
} as const;

export type ProjectI18nKey = (typeof slugToKey)[Slug];
export type Slug = keyof typeof slugToKey;

export type ProjectI18n = Dictionary['projects'][ProjectI18nKey];
export type ProjectSectionI18n = ProjectI18n['sections'];

/** Projeto completo: metadados + textos do dicionário no locale carregado. */
export type LocalizedProject = ProjectMeta & ProjectI18n;

/** Projeto de um slug, com os textos do dicionário daquele projeto. */
export type ProjectOf<S extends Slug> = ProjectMeta & Dictionary['projects'][(typeof slugToKey)[S]];

/**
 * Estreita um `LocalizedProject` para o projeto de um slug. Cada case tem chaves
 * próprias no dicionário; checar o slug não depende de nenhuma chave ser única.
 */
export function isProject<S extends Slug>(
  project: LocalizedProject,
  slug: S
): project is LocalizedProject & ProjectOf<S> {
  return project.slug === slug;
}

// Metadados estáticos — nenhum texto aqui (tudo vem do dicionário)
//
// Grade bento de /projetos: coluna 0 estreita (459) e colunas 1 e 2 largas (612),
// flex 3 : 4 — a escala das duas é a mesma, então o 2º número do `aspect` é a
// altura do card em px de design. Cada coluna soma 890 + 1 vão (590 + 300 ou
// 445 + 445) e as três terminam na mesma altura em qualquer largura acima de 900px.
// Piso: a 1180px (escala 0,6845) o texto do hover precisa de ~186px num card
// estreito e ~150px num largo, então nenhum card fica abaixo de 300 de design.
// Dentro de cada coluna os cards seguem a ordem desta lista.
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
    layout: 'wide',
    opensAsPage: true,
  },
  {
    slug: 'batuco-tuco',
    status: 'em-progresso',
    categories: ['interacao'],
    date: '04.12.2025',
    accent: 'orange',
    coverImage: '/images/projects/batuco-tuco/cover.png',
    grid: { column: 2, aspect: '612 / 445', objectPosition: 'left center', descLines: 2 },
    layout: 'wide',
    opensAsPage: true,
  },
  {
    slug: 'identidade-evento-15-anos',
    status: 'concluido',
    categories: ['grafico'],
    date: '28.10.2026',
    accent: 'pink',
    // Capa = imagem principal do case (Figma 17:4857, 1354 × 674).
    coverImage: '/images/projects/identidade-evento-15-anos/hero.webp',
    grid: { column: 1, aspect: '612 / 590', objectPosition: 'center', descLines: 3 },
    layout: 'wide',
    opensAsPage: true,
  },
  {
    slug: 'pontinhas-soltas',
    status: 'concluido',
    categories: ['3d'],
    date: '08.12.2025',
    accent: 'pink',
    // Capa = imagem principal do case (1352 × 459). Centralizada: no card da grade
    // (612 / 300) e no 16:9 do "Talvez você goste…" o recorte fica nas três centrais
    // (Lac, Haggy e Nina); nos cards largos de /3d aparecem as cinco.
    coverImage: '/images/projects/pontinhas-soltas/hero.webp',
    grid: { column: 1, aspect: '612 / 300', objectPosition: 'center', descLines: 1 },
    layout: 'wide',
    opensAsPage: true,
  },
  {
    slug: 'caju',
    status: 'concluido',
    categories: ['grafico'],
    date: '12.04.2025',
    accent: 'pink',
    // Capa = imagem principal do case (Figma 17:5177, 1354 × 461). No card estreito
    // (459 / 300) a janela é ~52% da largura: 20% deixa a Caju e o monstrinho à vista.
    coverImage: '/images/projects/caju/hero.webp',
    grid: { column: 0, aspect: '459 / 300', objectPosition: '20% center', descLines: 1 },
    layout: 'wide',
    opensAsPage: true,
  },
  {
    slug: 'cascavel',
    status: 'concluido',
    categories: ['interacao'],
    accent: 'orange',
    // Capa = imagem principal do case (Figma 17:4156, 1354 × 436).
    coverImage: '/images/projects/cascavel/hero.webp',
    grid: { column: 2, aspect: '612 / 445', objectPosition: 'center', descLines: 2 },
    layout: 'wide',
    opensAsPage: true,
  },
];

/** Slugs na ordem de `projectMeta` (ordem da grade e do "próximo" do modal). */
export const projectSlugs: Slug[] = projectMeta.map((p) => p.slug as Slug);

/**
 * Cases que abrem como página completa (`opensAsPage`): o frame do Figma não tem o
 * header do site (a barra de voltar é do próprio case) e usa o footer "visite também".
 * HeaderRouter e FooterRouter consultam isto.
 */
export function isFullPageCase(slug: string): boolean {
  return projectMeta.some((p) => p.slug === slug && p.opensAsPage === true);
}

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

/**
 * Até `count` slugs diferentes de `slug`, sorteados (Fisher–Yates) — "Talvez
 * você goste..." no fim dos cases. `random` é injetável para dar determinismo.
 */
export function getRandomOtherSlugs(
  slug: Slug,
  count: number,
  random: () => number = Math.random
): Slug[] {
  const others = projectSlugs.filter((s) => s !== slug);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  return others.slice(0, count);
}

// Alias para compatibilidade
export const projectsByCategory = getLocalizedProjectsByCategory;