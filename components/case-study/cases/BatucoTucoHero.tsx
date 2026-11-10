import { isProject, type LocalizedProject } from "@/lib/projects";
import s from "./batuco.module.css";

const base = "/images/projects/batuco-tuco";

/**
 * Capa do case: a banda no palco (Figma node 17:2475, 1352 × 467), exportada
 * do Figma já achatada em 1x e 2x.
 *
 * Por que PNG e não as camadas em SVG: holofotes e palco usam textura de grão
 * (feTurbulence), que o Chrome rasteriza bem mais grossa que o Figma — mesmo
 * motivo de components/home/Illustration.tsx. A composição só escala por
 * inteiro, então uma imagem responsiva (srcSet 1x/2x) mantém o comportamento.
 */
export function BatucoTucoHero({ project }: { project: LocalizedProject }) {
  const label = isProject(project, "batuco-tuco") ? project.heroAlt : project.title;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${base}/hero.png`}
      srcSet={`${base}/hero.png 1352w, ${base}/hero@2x.png 2704w`}
      // Coluna do container-wide: 1352px a partir de 1352 + 2 × 2.5rem; abaixo
      // disso, a viewport menos o padding (2.5rem a partir de 800px, 5vw antes).
      sizes="(min-width: 1432px) 1352px, (min-width: 800px) calc(100vw - 5rem), 90vw"
      width={1352}
      height={467}
      alt={label}
      className={s.hero}
    />
  );
}
