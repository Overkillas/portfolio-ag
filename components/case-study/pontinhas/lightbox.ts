import type { Dictionary } from "@/i18n/dictionaries";
import type { LocalizedProject } from "@/lib/projects";
import type { LightboxItem } from "@/components/case-study/CaseLightbox";
import { LB, creamGroups, photos, pontinhasBase as base } from "@/components/case-study/cases/PontinhasSoltasCase";

/**
 * Itens do lightbox da página completa do Pontinhas soltas e o aria-label de cada
 * gatilho ("Ampliar: …"), na ordem de `LB` (PontinhasSoltasCase): banner, fotos
 * (originais, sem o recorte da página), card azul, grupos da prancha creme e cards
 * dos personagens. Os itens saem das mesmas listas de layout que a página usa.
 *
 * Os dois blocos com texto vivo na página (card azul e cards) usam o PNG @2x
 * exportado do Figma, com o texto em português nos dois idiomas — mesma decisão do
 * Batuco-tuco; os alts de /en avisam isso.
 *
 * As seis fotos dividem a legenda (o título da seção), então o aria-label do botão de
 * cada uma usa o alt dela: sem isso o leitor de tela ouviria seis botões iguais.
 */
export function getPontinhasLightbox(
  project: LocalizedProject,
  dict: Dictionary,
): { items: LightboxItem[]; labels: string[] } | null {
  if (!("gallery" in project)) return null;
  const { prototyping } = project.sections;
  const g = project.gallery;
  const creamText = [
    [g.flyingAlt, g.flyingCaption],
    [g.turnaroundsAlt, g.turnaroundsCaption],
    [g.headsAlt, g.headsCaption],
    [g.dancingAlt, g.dancingCaption],
  ] as const;

  const items: LightboxItem[] = [
    { src: `${base}/hero@2x.webp`, alt: project.heroAlt, caption: project.subtitle, width: 2704, height: 919 },
    ...photos.map((photo, i) => ({
      src: photo.original,
      alt: prototyping.images[i] ?? prototyping.title,
      caption: prototyping.title,
      width: photo.width,
      height: photo.height,
    })),
    { src: `${base}/lightbox/vitrine@2x.webp`, alt: g.showcaseAlt, caption: g.showcaseCaption, width: 2704, height: 1883 },
    ...creamGroups.map((group, i) => ({
      src: `${base}/prancha/${group.file}@2x.webp`,
      alt: creamText[i]?.[0] ?? "",
      caption: creamText[i]?.[1] ?? "",
      width: group.width,
      height: group.height,
    })),
    { src: `${base}/lightbox/cards@2x.webp`, alt: g.cardsAlt, caption: g.cardsCaption, width: 2722, height: 3016 },
  ];

  const isPhoto = (i: number) => i >= LB.photos && i < LB.photos + photos.length;
  const labels = items.map((item, i) =>
    dict.projectsPage.lightbox.open.replace("{caption}", isPhoto(i) ? item.alt : item.caption),
  );
  return { items, labels };
}
