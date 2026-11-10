import type { Dictionary } from "@/i18n/dictionaries";
import type { LocalizedProject } from "@/lib/projects";
import type { LightboxItem } from "@/components/case-study/CaseLightbox";
import { batucoBase as base, sketchFiles } from "@/components/case-study/cases/BatucoTucoCase";

/** Tamanho real dos arquivos (reserva a proporção da <img> do lightbox). */
const sketchSizes = [
  { width: 1024, height: 768 },
  { width: 1024, height: 768 },
  { width: 1024, height: 697 },
  { width: 1024, height: 732 },
] as const;

/**
 * Itens do lightbox da página completa do Batuco-tuco e o aria-label de cada gatilho
 * ("Ampliar: …"). Os quatro blocos que na página são HTML vivo (diagrama, Interface e
 * assets, Personagens, "Música é saber") usam o PNG @2x exportado do Figma (texto em
 * português nos dois idiomas, decisão do usuário; os alts de /en avisam isso).
 */
export function getBatucoLightbox(
  project: LocalizedProject,
  dict: Dictionary,
): { items: LightboxItem[]; labels: string[] } | null {
  // `footnote` só existe no Batuco-tuco (o Cascavel também tem `lightbox`).
  if (!("footnote" in project)) return null;
  const { creationProcess: cp, sketches, characters, brand } = project.sections;
  const lb = project.lightbox;

  const items: LightboxItem[] = [
    { src: `${base}/hero@2x.png`, alt: project.heroAlt, caption: project.subtitle, width: 2704, height: 934 },
    { src: `${base}/lightbox/etapas@2x.png`, alt: lb.processAlt, caption: lb.processCaption, width: 1316, height: 651 },
    {
      src: `${base}/paineis-planejamento.png`,
      alt: cp.images[0] ?? cp.planningCaption,
      caption: cp.planningCaption,
      width: 1745,
      height: 1031,
    },
    ...sketches.map((sketch, i) => ({
      src: `${base}/${sketchFiles[i]}.png`,
      alt: sketch.alt,
      caption: sketch.caption,
      ...sketchSizes[i],
    })),
    { src: `${base}/lightbox/interface@2x.png`, alt: lb.interfaceAlt, caption: lb.interfaceCaption, width: 2704, height: 2893 },
    { src: `${base}/lightbox/personagens@2x.png`, alt: lb.charactersAlt, caption: characters.label, width: 2704, height: 1712 },
    { src: `${base}/lightbox/apresentacao@2x.png`, alt: lb.finalAlt, caption: brand.heading, width: 2704, height: 1712 },
  ];

  const labels = items.map((item) => dict.projectsPage.lightbox.open.replace("{caption}", item.caption));
  return { items, labels };
}
