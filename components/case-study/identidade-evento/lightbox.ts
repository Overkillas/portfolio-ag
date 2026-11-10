import type { Dictionary } from "@/i18n/dictionaries";
import type { LocalizedProject } from "@/lib/projects";
import type { LightboxItem } from "@/components/case-study/CaseLightbox";
import {
  type EventoImage,
  eventoImages,
  eventoSrc,
  isIdentidadeEventoProject,
} from "@/components/case-study/cases/IdentidadeEventoCase";

/**
 * Itens do lightbox da página completa do case "Identidade de evento: 15 anos" e o
 * aria-label de cada gatilho ("Ampliar: …"), na ordem de `LB`
 * (IdentidadeEventoCase): hero, painéis de referências (2), miniaturas de
 * Prototipagem (5), convite (4), banners (3), painel de Led (2), menu/tags/adesivos
 * (7) e aplicações no evento (6) — 30 itens.
 *
 * Cada item usa o export 2x do Figma. Cada painel de referências é uma colagem
 * achatada e abre inteiro. As peças têm textos em português dentro da arte nos dois
 * idiomas (é o material entregue à cliente).
 *
 * A legenda de cada grupo é um texto que já está na página. Quando vários itens
 * dividem a legenda, o aria-label do botão usa o alt de cada um: sem isso o leitor
 * de tela ouviria botões iguais.
 */
export function getIdentidadeEventoLightbox(
  project: LocalizedProject,
  dict: Dictionary,
): { items: LightboxItem[]; labels: string[] } | null {
  if (!isIdentidadeEventoProject(project)) return null;
  const { creationProcess: cp, prototyping: proto, finalProject: fp } = project.sections;

  const item = (image: EventoImage, alt: string, caption: string): LightboxItem => ({
    src: eventoSrc(image).src2x,
    alt,
    caption,
    width: image.px2,
    height: Math.round((image.px2 * image.h) / image.w),
  });
  const im = eventoImages;

  const items: LightboxItem[] = [
    item(im.hero, project.heroAlt, project.subtitle),
    ...im.panels.map((x, i) => item(x, cp.images[i] ?? "", cp.captions[i] ?? cp.title)),
    ...im.thumbs.map((x, i) => item(x, proto.images[i] ?? "", proto.thumbs.captions[i] ?? proto.title)),
    ...im.invitation.map((x, i) => item(x, proto.invitation.images[i] ?? "", proto.invitation.label)),
    ...im.banners.map((x, i) => item(x, fp.images[i] ?? "", fp.title)),
    ...im.led.map((x, i) => item(x, fp.ledPanel.images[i] ?? "", fp.ledPanel.label)),
    ...im.menuTags.map((x, i) => item(x, fp.menuTags.images[i] ?? "", fp.menuTags.label)),
    ...im.event.map((x, i) => item(x, fp.event.images[i] ?? "", fp.event.label)),
  ];

  const shared = (caption: string) => items.filter((it) => it.caption === caption).length > 1;
  const labels = items.map((it) =>
    dict.projectsPage.lightbox.open.replace("{caption}", shared(it.caption) ? it.alt : it.caption),
  );
  return { items, labels };
}
