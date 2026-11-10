import type { Dictionary } from "@/i18n/dictionaries";
import type { LocalizedProject } from "@/lib/projects";
import type { LightboxItem } from "@/components/case-study/CaseLightbox";
import {
  type PsnImage,
  isPontosSemNoProject,
  psnImages,
  psnSrc,
} from "@/components/case-study/cases/PontosSemNoCase";

/**
 * Itens do lightbox da página completa do Pontos sem nó e o aria-label de cada
 * gatilho ("Ampliar: …"), na ordem de `LB` (PontosSemNoCase): hero, pôster CABE,
 * construção da marca (3), elementos de apoio (2), evolução do mascote, thumbs de
 * prototipagem (4), manual, bailarina, jogo do tempo, grade de logos e colagem
 * final. Um item por nó do Figma (17:899).
 *
 * Cada item usa o export 2x do nó. Manual e pôsteres têm o texto da arte em
 * português nos dois idiomas; os alts em inglês avisam isso.
 *
 * Os três quadros da construção dividem a legenda: o aria-label do botão de cada
 * um usa o alt dele, para o leitor de tela não ouvir botões iguais.
 */
export function getPontosSemNoLightbox(
  project: LocalizedProject,
  dict: Dictionary,
): { items: LightboxItem[]; labels: string[] } | null {
  if (!isPontosSemNoProject(project)) return null;
  const g = project.sections.gallery;

  const item = (image: PsnImage, alt: string, caption: string): LightboxItem => ({
    src: psnSrc(image).src2x,
    alt,
    caption,
    width: image.px2,
    height: image.py2,
  });

  const items: LightboxItem[] = [
    item(psnImages.hero, project.heroAlt, project.subtitle),
    item(psnImages.posterCabe, g.posterCabeAlt, g.posterCabe),
    ...psnImages.construction.map((im, i) => item(im, g.constructionAlts[i] ?? "", g.construction)),
    ...psnImages.support.map((im, i) =>
      item(im, g.supportAlts[i] ?? "", i === 0 ? g.support : g.supportPlural),
    ),
    item(psnImages.diagram, g.mascotEvolutionAlt, g.mascotEvolution),
    ...psnImages.prototypes.map((im, i) => item(im, g.prototypeAlts[i] ?? "", g.prototypes[i] ?? "")),
    item(psnImages.manual, g.manualAlt, g.manual),
    item(psnImages.ballerina, g.ballerinaAlt, g.ballerina),
    item(psnImages.jogoDoTempo, g.jogoDoTempoAlt, g.jogoDoTempo),
    item(psnImages.logoGrid, g.logoGridAlt, g.logoGrid),
    item(psnImages.finalPosters, g.finalPostersAlt, g.finalPosters),
  ];

  const shared = (caption: string) => items.filter((it) => it.caption === caption).length > 1;
  const labels = items.map((it) =>
    dict.projectsPage.lightbox.open.replace("{caption}", shared(it.caption) ? it.alt : it.caption),
  );
  return { items, labels };
}
