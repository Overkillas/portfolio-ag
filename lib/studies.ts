import type { CategoryKey } from './site';

/*
 * Galeria da página de Estudos (Figma EGDJU9UG5XmLO6zV8Howwo, frame 17:2174,
 * galeria = nó 17:2324). Só dados não traduzíveis: legenda e alt de cada imagem
 * vivem em dict.studies.items.<key>. Esta lista manda na página e no lightbox.
 *
 * Filtro por imagem: só o bolo é 3D, o resto é design gráfico. Uma linha some quando
 * todas as imagens dela saem; se sobra uma, ela fica com o tamanho do Figma, à esquerda.
 *
 * Medidas em px do Figma (coluna de 1352). A página converte com a régua
 * --u = 100cqw / 1352, então a 1728 de viewport tudo fica 1:1 com o Figma.
 */

/** Filtros da página (pílulas 17:2302 / 17:2305 / 17:2318). */
export type StudyCategory = Extract<CategoryKey, '3d' | 'grafico'>;
export type StudyFilter = 'all' | StudyCategory;
export const studyFilterOrder: readonly StudyFilter[] = ['all', '3d', 'grafico'];

export type StudyItemKey =
  | 'velhaInfancia'
  | 'portals'
  | 'chillKill'
  | 'razoes28'
  | 'florescer'
  | 'soQuiet'
  | 'gatoAzul'
  | 'gatoAmarelo'
  | 'calendario2023'
  | 'calendario2024'
  | 'calendario2025'
  | 'coelhos'
  | 'telaDeBloqueio'
  | 'quarto2andar'
  | 'quarto1andar'
  | 'tomate'
  | 'bolo'
  | 'sketchGarota'
  | 'sestudos'
  | 'retrato1'
  | 'retrato2'
  | 'retrato3'
  | 'retrato4'
  | 'twig'
  | 'chikorita'
  | 'sketchFinal';

export type StudyItem = {
  key: StudyItemKey;
  /** Área do filtro. Tudo é design gráfico, menos o bolo (3D). */
  category: StudyCategory;
  /** Largura e altura da caixa no Figma (px). */
  w: number;
  h: number;
  /** Arquivo da página (recorte do Figma quando ele recorta). */
  src: string;
  /** Arquivo do lightbox (original, sem recorte) e seu tamanho real. */
  full: string;
  fullW: number;
  fullH: number;
};

export type StudyRow = {
  /** Espaço até a linha anterior no Figma (px). */
  gapBefore: number;
  /** Espaço entre as imagens da linha (px). */
  gap: number;
  items: StudyItem[];
};

const base = '/images/estudos';

/** Item cujo arquivo da página serve também ao lightbox. */
function same(
  key: StudyItemKey,
  file: string,
  w: number,
  h: number,
  fullW: number,
  fullH: number,
  category: StudyCategory = 'grafico',
): StudyItem {
  const src = `${base}/${file}.webp`;
  return { key, category, w, h, src, full: src, fullW, fullH };
}

/** Item recortado pelo Figma: a página usa o recorte, o lightbox o original. */
function cropped(key: StudyItemKey, file: string, w: number, h: number, fullW: number, fullH: number): StudyItem {
  return { key, category: 'grafico', w, h, src: `${base}/${file}.webp`, full: `${base}/original/${file}.webp`, fullW, fullH };
}

const collageW = 433.5391845703125;
const collageH = 649.9876708984375;
const rowGap = 50.117; // Frame 100897 (17:2338)

export const studyRows: StudyRow[] = [
  // Frame 100894 (17:2326): duas linhas de colagens, 24.407 entre elas.
  {
    gapBefore: 0,
    gap: 25.691,
    items: [
      same('velhaInfancia', 'velha-infancia', collageW, collageH, 675, 1012),
      same('portals', 'portals', collageW, collageH, 675, 1012),
      same('chillKill', 'chill-kill', collageW, collageH, 675, 1012),
    ],
  },
  {
    gapBefore: 24.407,
    gap: 25.691,
    items: [
      same('razoes28', '28-razoes', collageW, collageH, 675, 1012),
      same('florescer', 'florescer', collageW, collageH, 675, 1012),
      same('soQuiet', 'so-quiet', collageW, collageH, 675, 1012),
    ],
  },
  // Frame 100895 (17:2335): 49 abaixo das colagens (gap do Frame 100896).
  {
    gapBefore: 49,
    gap: 24.582,
    items: [
      same('gatoAzul', 'gato-azul', 663.7091064453125, 663.7091064453125, 1080, 1080),
      same('gatoAmarelo', 'gato-amarelo', 663.7091064453125, 663.7091064453125, 1080, 1080),
    ],
  },
  // Frame 100897 (17:2338): 28 abaixo do Frame 100896, 50.117 entre os filhos.
  { gapBefore: 28, gap: 0, items: [same('calendario2023', 'calendario-2023', 1352, 760.5, 1920, 1080)] },
  { gapBefore: rowGap, gap: 0, items: [same('calendario2024', 'calendario-2024', 1352, 760.5, 1920, 1080)] },
  {
    gapBefore: rowGap,
    gap: 0,
    items: [same('calendario2025', 'calendario-2025', 1352, 955.7344970703125, 2245, 1587)],
  },
  { gapBefore: rowGap, gap: 0, items: [same('coelhos', 'coelhos', 1352, 436.693359375, 2704, 873)] },
  {
    gapBefore: rowGap,
    gap: 0,
    items: [same('telaDeBloqueio', 'tela-de-bloqueio', 1352, 760.5, 2704, 1521)],
  },
  // Group 100837 (17:2344): 2andar recortado (a imagem ocupa 177.72% da largura).
  {
    gapBefore: rowGap,
    gap: 0,
    items: [
      cropped('quarto2andar', 'quarto-2andar', 486.8232727050781, 516.5233764648438, 1340, 800),
      same('quarto1andar', 'quarto-1andar', 865.1766357421875, 516.5233764648438, 1340, 800),
    ],
  },
  // Frame 100902 (17:2348): tomate em x=0, bolo em x=520 → 24 entre eles.
  {
    gapBefore: rowGap,
    gap: 24,
    items: [
      same('tomate', 'tomate', 496, 744, 736, 1104),
      // bolo7: o arquivo do Figma (1024 × 576) é um render esticado na horizontal, que o
      // Figma estica de volta na caixa de 832 × 744. O bolo.webp já vem nessa proporção
      // (1024 × 916), então página e lightbox mostram o bolo sem distorção.
      same('bolo', 'bolo', 832.030517578125, 744, 1024, 916, '3d'),
    ],
  },
  // Frame 100910 (17:2353): 1347.87 de largura, 12 entre as duas.
  {
    gapBefore: rowGap,
    gap: 12,
    items: [
      cropped('sketchGarota', 'sketch-garota', 667.9343872070312, 654.069580078125, 2080, 2440),
      cropped('sestudos', 'sestudos', 667.9343872070312, 654.069580078125, 2080, 2440),
    ],
  },
  // Frame 100926 (17:2356): três linhas de 1347.82, 19.821 entre elas e entre as imagens.
  {
    gapBefore: rowGap,
    gap: 19.821,
    items: [
      same('retrato1', 'retrato-1', 664, 445.97015380859375, 1328, 892),
      same('retrato2', 'retrato-2', 664, 445.97015380859375, 1328, 892),
    ],
  },
  {
    gapBefore: 19.821,
    gap: 19.821,
    items: [
      same('retrato3', 'retrato-3', 664, 445.97015380859375, 1328, 892),
      same('retrato4', 'retrato-4', 664, 445.97015380859375, 1328, 892),
    ],
  },
  {
    gapBefore: 19.821,
    gap: 19.821,
    items: [
      same('twig', 'twig', 664, 396.41790771484375, 1328, 793),
      same('chikorita', 'chikorita', 664, 396.41790771484375, 1328, 793),
    ],
  },
  // 17:2366: 1348 × 852, recortado.
  { gapBefore: rowGap, gap: 0, items: [cropped('sketchFinal', 'sketch-final', 1348, 852, 2704, 1939)] },
];

/**
 * Largura da linha no Figma (soma das caixas + vãos); < 1352 nas linhas de sketches.
 * Com filtro, só conta as imagens visíveis (o tomate e o bolo dividem a linha).
 */
export function rowWidth(row: StudyRow, items: StudyItem[] = row.items): number {
  return items.reduce((sum, item) => sum + item.w, 0) + row.gap * Math.max(0, items.length - 1);
}

export function matchesFilter(item: StudyItem, filter: StudyFilter): boolean {
  return filter === 'all' || item.category === filter;
}
