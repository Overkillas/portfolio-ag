import type { Dictionary } from "@/i18n/dictionaries";
import type { LocalizedProject } from "@/lib/projects";
import type { LightboxItem } from "@/components/case-study/CaseLightbox";
import {
  type CascavelImage,
  cascavelImages,
  cascavelSrc,
  isCascavelProject,
} from "@/components/case-study/cases/CascavelCase";

/**
 * Itens do lightbox da página completa do Cascavel e o aria-label de cada gatilho
 * ("Ampliar: …"), na ordem de `LB` (CascavelCase): hero, mapa de fluxo, painéis,
 * Imagem a, as 7 peças da Imagem b (escolinha, pintura, Blender, cartões, fruta,
 * casarão, letreiros), 9 primeiras versões e 6 renders finais. Um item por nó do
 * Figma (17:4049); os cartões e os letreiros são recortes achatados da colagem.
 *
 * Cada item usa o export 2x. Mapa de fluxo, cartões e letreiros têm texto em
 * português dentro da arte nos dois idiomas; os alts em inglês avisam isso.
 *
 * Quando vários itens dividem a legenda (Imagem b, primeiras versões, renders), o
 * aria-label do botão usa o alt de cada um: sem isso o leitor de tela ouviria
 * botões iguais.
 */
export function getCascavelLightbox(
  project: LocalizedProject,
  dict: Dictionary,
): { items: LightboxItem[]; labels: string[] } | null {
  if (!isCascavelProject(project)) return null;
  const { gallery: g, creationProcess, prototyping, finalProject } = project.sections;
  const im = cascavelImages;

  const item = (image: CascavelImage, alt: string, caption: string): LightboxItem => ({
    src: cascavelSrc(image).src2x,
    alt,
    caption,
    width: image.px2,
    height: image.py2,
  });

  const items: LightboxItem[] = [
    item(im.hero, project.heroAlt, project.subtitle),
    item(im.flow, g.flowAlt, creationProcess.title),
    item(im.panels, g.panelsAlt, prototyping.title),
    item(im.imageA, g.imageAAlt, g.imageA),
    item(im.school, g.schoolAlt, g.imageB),
    item(im.painting, g.paintingAlt, g.imageB),
    item(im.blender, g.blenderAlt, g.imageB),
    item(im.cards, g.cardsAlt, g.imageB),
    item(im.fruit, g.fruitAlt, g.imageB),
    item(im.house, g.houseAlt, g.imageB),
    item(im.signs, g.signsAlt, g.imageB),
    ...im.firstVersions.map((v, i) => item(v, g.firstVersionsAlts[i] ?? "", g.firstVersions)),
    ...im.renders.map((r, i) => item(r, g.rendersAlts[i] ?? "", finalProject.title)),
  ];

  const shared = (caption: string) => items.filter((it) => it.caption === caption).length > 1;
  const labels = items.map((it) =>
    dict.projectsPage.lightbox.open.replace("{caption}", shared(it.caption) ? it.alt : it.caption),
  );
  return { items, labels };
}
