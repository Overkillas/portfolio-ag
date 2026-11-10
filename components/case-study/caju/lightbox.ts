import type { Dictionary } from "@/i18n/dictionaries";
import type { LocalizedProject } from "@/lib/projects";
import type { LightboxItem } from "@/components/case-study/CaseLightbox";
import {
  type CajuImage,
  cajuImages,
  cajuSrc,
  isCajuProject,
} from "@/components/case-study/cases/CajuCase";

/**
 * Itens do lightbox da página completa do Caju e o aria-label de cada gatilho
 * ("Ampliar: …"), na ordem de `LB` (CajuCase): hero, quadro de planejamento,
 * brainstorming (3), painel visual, teste de cores, design de personagens, rafes
 * (2), pintura e diagramação (4) e mídia impressa (3). A pilha de páginas e o
 * livro não entram: fazem parte do livro.
 *
 * Cada item usa o export 2x do Figma. O quadro de planejamento tem texto em
 * português dentro da arte nos dois idiomas; o alt em inglês avisa isso.
 *
 * Quando vários itens dividem a legenda (brainstorming, rafes, pintura, mídia
 * impressa), o aria-label do botão usa o alt de cada um: sem isso o leitor de
 * tela ouviria botões iguais.
 */
export function getCajuLightbox(
  project: LocalizedProject,
  dict: Dictionary,
): { items: LightboxItem[]; labels: string[] } | null {
  if (!isCajuProject(project)) return null;
  const g = project.sections.gallery;

  const item = (image: CajuImage, alt: string, caption: string): LightboxItem => ({
    src: cajuSrc(image).src2x,
    alt,
    caption,
    width: image.px2,
    height: Math.round((image.px2 * image.h) / image.w),
  });

  const items: LightboxItem[] = [
    item(cajuImages.hero, project.heroAlt, project.subtitle),
    item(cajuImages.board, g.boardAlt, g.boardCaption),
    ...cajuImages.brainstorm.map((im, i) => item(im, g.brainstormingAlts[i] ?? "", g.brainstorming)),
    item(cajuImages.panel, g.visualPanelAlt, g.visualPanel),
    item(cajuImages.colorTests, g.colorTestsAlt, g.colorTests),
    item(cajuImages.characters, g.charactersAlt, g.characters),
    ...cajuImages.roughs.map((im, i) => item(im, g.roughsAlts[i] ?? "", g.roughs)),
    ...cajuImages.painting.map((im, i) => item(im, g.paintingAlts[i] ?? "", g.painting)),
    ...cajuImages.printed.map((im, i) => item(im, g.printedAlts[i] ?? "", g.printed)),
  ];

  const shared = (caption: string) => items.filter((it) => it.caption === caption).length > 1;
  const labels = items.map((it) =>
    dict.projectsPage.lightbox.open.replace("{caption}", shared(it.caption) ? it.alt : it.caption),
  );
  return { items, labels };
}
