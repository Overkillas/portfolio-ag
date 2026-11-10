import { isProject, type LocalizedProject } from "@/lib/projects";
import { pontinhasBase as base } from "./PontinhasSoltasCase";
import s from "./pontinhas.module.css";

/**
 * Capa do case: as cinco Pontinhas em 3D sobre o fundo azul com luzes (Figma node
 * 17:2979, 1352 × 459.2), exportada do Figma já achatada em 1x e 2x — mesmo
 * tratamento da capa do Batuco-tuco (BatucoTucoHero).
 */
export function PontinhasSoltasHero({ project }: { project: LocalizedProject }) {
  const label = isProject(project, "pontinhas-soltas") ? project.heroAlt : project.title;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${base}/hero.webp`}
      srcSet={`${base}/hero.webp 1352w, ${base}/hero@2x.webp 2704w`}
      // Coluna do container-wide: 1352px a partir de 1352 + 2 × 2.5rem; abaixo
      // disso, a viewport menos o padding (2.5rem a partir de 800px, 5vw antes).
      sizes="(min-width: 1432px) 1352px, (min-width: 800px) calc(100vw - 5rem), 90vw"
      width={1352}
      height={459}
      alt={label}
      className={s.hero}
    />
  );
}
