import type { CSSProperties, ReactNode } from "react";
import { isProject, type LocalizedProject, type ProjectOf } from "@/lib/projects";
import { CaseSection, DashedPill, bodyFontBold } from "@/components/case-study/CaseShell";
import { textClass, wideTitle as title, zoomHelpers } from "./wide";
import s from "./pontos-sem-no.module.css";

export const psnBase = "/images/projects/pontos-sem-no";
const base = psnBase;

/** Case do Pontos sem nó com os textos do dicionário (o tipo de `projects.pontosSemNo`). */
export type PsnProject = LocalizedProject & ProjectOf<"pontos-sem-no">;

export function isPontosSemNoProject(project: LocalizedProject): project is PsnProject {
  return isProject(project, "pontos-sem-no");
}

/* ---------- Dados de layout (não traduzíveis) ----------
   Cada imagem é o export 2x do nó no Figma (frame 17:899): caixa do Figma em px
   (w × h) e o tamanho do arquivo 2x (o 1x é a metade). Estas listas mandam na
   página e no lightbox; o dicionário só dá o texto de cada item. */

export type PsnImage = { file: string; w: number; h: number; px2: number; py2: number };

const img = (file: string, w: number, h: number, px2: number, py2: number): PsnImage => ({
  file,
  w,
  h,
  px2,
  py2,
});

export const psnImages = {
  /** Hero (17:1003, frame espelhado no Figma; o export já sai na orientação do canvas). */
  hero: img("hero", 1352, 459.2, 2704, 919),
  /** Pôster CABE (17:1138), à direita do cabeçalho. */
  posterCabe: img("poster-cabe", 587.81, 750, 1176, 1500),
  /** Construção da marca (17:1165, 17:1206, 17:1208). */
  construction: [
    img("construcao-1", 422, 275, 844, 550),
    img("construcao-2", 421, 275, 842, 550),
    img("construcao-3", 422, 275, 844, 550),
  ],
  /** Elemento de apoio (17:1283) e Elementos de apoio (17:1288). */
  support: [img("apoio-1", 257, 234, 514, 468), img("apoio-2", 400, 234, 800, 468)],
  /**
   * Evolução do mascote (17:1320): recorte da coluna do frame 17:1294 a partir de
   * x=693. Os traços passam 3.5px da coluna e 3px do frame (662.5 × 193 contra a
   * caixa de 659 × 190), como no Figma.
   */
  diagram: img("diagrama", 662.5, 193, 1325, 386),
  /** Thumbs de prototipagem (17:1407, 17:1411, 17:1414, 17:1417). */
  prototypes: [
    img("proto-paineis", 351.21, 325.77, 703, 652),
    img("proto-esbocos", 325.77, 325.77, 652, 652),
    img("proto-vetores", 325.77, 325.77, 652, 652),
    img("proto-aplicacoes", 325.77, 325.77, 652, 652),
  ],
  /** Pranchas do manual (17:1444). */
  manual: img("manual", 1354.18, 1446.12, 2709, 2893),
  /** Faixa da bailarina (17:1948). */
  ballerina: img("bailarina", 1354, 459.88, 2708, 920),
  /** Pôster Jogo do tempo (17:2026) | grade xadrez de logos (17:2070). */
  jogoDoTempo: img("jogo-do-tempo", 512.55, 586.15, 1026, 1173),
  logoGrid: img("xadrez", 823.21, 586.15, 1647, 1173),
  /** Colagem final (17:2072). */
  finalPosters: img("posters-finais", 1354.18, 1855.32, 2709, 3711),
} as const;

/** Índices no lightbox (mesma ordem de `getPontosSemNoLightbox`, em pontos-sem-no/lightbox.ts). */
export const LB = (() => {
  const construction = 2;
  const support = construction + psnImages.construction.length;
  const diagram = support + psnImages.support.length;
  const prototypes = diagram + 1;
  const manual = prototypes + psnImages.prototypes.length;
  return {
    hero: 0,
    posterCabe: 1,
    construction,
    support,
    diagram,
    prototypes,
    manual,
    ballerina: manual + 1,
    jogoDoTempo: manual + 2,
    logoGrid: manual + 3,
    finalPosters: manual + 4,
  };
})();

/**
 * Painel das 6 etapas (17:1063), na ordem de `steps`, em px do Figma relativos à
 * etapa: posição (lx, ly) e largura (lw) do rótulo, topo dos chips (cy) e
 * largura do grupo de chips (cw, decide onde as linhas quebram).
 */
const stepBoxes: readonly { lx: number; ly: number; lw: number; cy: number; cw: number }[] = [
  { lx: 56.87, ly: 10.08, lw: 123.829, cy: 65.09, cw: 180.698 },
  { lx: 66.04, ly: 10.09, lw: 126.581, cy: 63.26, cw: 221.866 },
  { lx: 65.12, ly: 10.08, lw: 90.808, cy: 63.26, cw: 155.931 },
  { lx: 66.04, ly: 8.25, lw: 90.808, cy: 63.26, cw: 212.282 },
  { lx: 66.04, ly: 10.09, lw: 90.808, cy: 63.26, cw: 156.85 },
  { lx: 64.21, ly: 10.09, lw: 113.739, cy: 63.26, cw: 188.265 },
];

/** Caminhos 1x/2x de uma imagem (srcSet com a largura real de cada arquivo). */
export function psnSrc(image: PsnImage) {
  const w1 = Math.round(image.px2 / 2);
  return {
    src: `${base}/${image.file}.webp`,
    src2x: `${base}/${image.file}@2x.webp`,
    srcSet: `${base}/${image.file}.webp ${w1}w, ${base}/${image.file}@2x.webp ${image.px2}w`,
  };
}

/** `sizes` para uma imagem que ocupa `w` px de 1352 na coluna do case. */
const sizesFor = (w: number) =>
  `(min-width: 1432px) ${Math.round(w)}px, (min-width: 48rem) ${((w / 1352) * 100).toFixed(1)}vw, 92vw`;

/** Pesos de uma fileira flex = larguras do Figma. */
const grow = (w: number) => ({ "--grow": w }) as CSSProperties;

/** Imagem de uma caixa do Figma: proporção do Figma e recorte `cover`. */
function Pic({
  image,
  alt,
  sizes,
  className,
}: {
  image: PsnImage;
  alt: string;
  sizes: string;
  className?: string;
}) {
  const { src, srcSet } = psnSrc(image);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={Math.round(image.w)}
      height={Math.round(image.h)}
      loading="lazy"
      decoding="async"
      className={className ? `${s.pic} ${className}` : s.pic}
      style={{ "--ar": `${image.w} / ${image.h}` } as CSSProperties}
    />
  );
}

/** Capa do case (17:1003): export 1x/2x do Figma. */
export function PontosSemNoHero({ project }: { project: LocalizedProject }) {
  const alt = isPontosSemNoProject(project) ? project.heroAlt : project.title;
  const { src, srcSet } = psnSrc(psnImages.hero);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes="(min-width: 1432px) 1352px, (min-width: 800px) calc(100vw - 5rem), 90vw"
      width={1352}
      height={459}
      alt={alt}
      className={s.hero}
    />
  );
}

type Step = PsnProject["sections"]["creationProcess"]["steps"][number];

/** Painel das 6 etapas (17:1063): grade 3 × 2, numeral + rótulo, chips. */
function Steps({ steps, label }: { steps: readonly Step[]; label: string }) {
  return (
    <div className={s.stepsWrap}>
      <ol className={s.steps} aria-label={label}>
        {steps.map((st, i) => {
          const box = stepBoxes[i];
          return (
            <li
              key={st.n}
              className={s.st}
              style={
                box
                  ? ({ "--lx": box.lx, "--ly": box.ly, "--lw": box.lw, "--cy": box.cy, "--cw": box.cw } as CSSProperties)
                  : undefined
              }
            >
              <div className={s.stHead}>
                <span className={s.stN} aria-hidden="true">
                  {st.n}
                </span>
                <span className={s.stLabel}>{st.title}</span>
              </div>
              <ul className={s.chips}>
                {st.chips.map((chip) => (
                  <li key={chip} className={s.chip}>
                    {chip}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Parágrafos de um mesmo nó de texto do Figma, 18px entre eles. No Figma o
 * justificado vale para todas as linhas menos a última do nó, então a última
 * linha de cada parágrafo (menos o último) também é justificada (`.fill`).
 */
function Paras({ items, last }: { items: readonly string[]; last?: ReactNode }) {
  const all: ReactNode[] = [...items, ...(last === undefined ? [] : [last])];
  return (
    <div className="flex flex-col gap-[18px]">
      {all.map((p, i) => (
        <p key={i} className={i < all.length - 1 ? `${textClass} ${s.fill}` : textClass}>
          {p}
        </p>
      ))}
    </div>
  );
}

function Pills({ items, className }: { items: readonly string[]; className: string }) {
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item}>
          <DashedPill>{item}</DashedPill>
        </li>
      ))}
    </ul>
  );
}

/**
 * Corpo do case Pontos sem nó (Figma 17:899), reutilizado pela página e pelo modal.
 *
 * `zoom` (só a página completa passa): aria-label de cada item do lightbox. Com
 * ele as imagens viram gatilhos com zoom no hover e as fileiras ganham o reveal ao
 * rolar, como no Batuco-tuco, no Pontinhas soltas e no Caju.
 */
export function PontosSemNoCase({
  project,
  zoom,
}: {
  project: LocalizedProject;
  zoom?: readonly string[];
}) {
  if (!isPontosSemNoProject(project)) return null;

  const { creationProcess: cp, gallery: g, prototyping, finalProject, tools } = project.sections;
  const { image, reveal } = zoomHelpers(zoom);
  const zoomed = (index: number, node: ReactNode) => image(index, node);
  const [finalLead, ...finalRest] = finalProject.paragraphs;
  const intro = project.intro.split("\n\n");

  return (
    <>
      {/* 1. Cabeçalho + painel das etapas | pôster CABE (17:1040): 660 | 104 | 588 */}
      <div className={s.top}>
        <div className={s.headCol}>
          <section className="flex flex-col gap-6">
            <h1
              className={`text-[1.75rem] text-[color:var(--color-blue)] md:text-[2rem] ${title.box30}`}
              style={bodyFontBold}
            >
              {project.subtitle}
            </h1>
            <Pills items={project.tags} className={s.tags} />
            <Paras
              items={intro}
              last={
                <>
                  {cp.stepsLeadBefore}
                  <strong className="font-bold">{cp.stepsLeadBold}</strong>
                  {cp.stepsLeadAfter}
                </>
              }
            />
          </section>
          <Steps steps={cp.steps} label={cp.stepsLabel} />
        </div>
        <div className={`${s.posterCol} ${reveal}`}>
          {zoomed(
            LB.posterCabe,
            <Pic image={psnImages.posterCabe} alt={g.posterCabeAlt} sizes={sizesFor(588)} />,
          )}
        </div>
      </div>

      {/* 2. Construção da marca (17:1164): 3.5 | 422 | 40 | 421 | 40 | 422 | 3.5 */}
      <div className={`${s.row} ${s.construction} ${reveal}`}>
        {psnImages.construction.map((im, i) => (
          <div key={im.file} className={s.cell} style={grow(im.w)}>
            {zoomed(
              LB.construction + i,
              <Pic image={im} alt={g.constructionAlts[i] ?? ""} sizes={sizesFor(im.w)} />,
            )}
          </div>
        ))}
      </div>

      {/* 3. Elementos de apoio (257 | 10 | 400) | 25 | Processo de criação 660 (17:1280) */}
      <div className={s.two}>
        <div className={`${s.row} ${s.gap10} ${reveal}`}>
          {psnImages.support.map((im, i) => (
            <figure key={im.file} className={`${s.fig} ${s.figSupport}`} style={grow(im.w)}>
              {zoomed(LB.support + i, <Pic image={im} alt={g.supportAlts[i] ?? ""} sizes={sizesFor(im.w)} />)}
              <figcaption className={s.cap}>{i === 0 ? g.support : g.supportPlural}</figcaption>
            </figure>
          ))}
        </div>
        <CaseSection title={cp.title} size="lg" titleClassName={title.box30}>
          <Paras items={cp.paragraphs} />
        </CaseSection>
      </div>

      {/* 4. Prototipagem 641 | 52 | Evolução do mascote 659 (17:1294) */}
      <div className={s.proto}>
        <div className={s.protoRow}>
          <CaseSection title={prototyping.title} size="lg" titleClassName={title.base}>
            <Pills items={prototyping.tabs} className={`mb-6 ${s.pills} ${s.nowrap}`} />
            <Paras items={prototyping.paragraphs} />
          </CaseSection>
          <div className={`${s.diagram} ${reveal}`}>
            {zoomed(
              LB.diagram,
              <Pic image={psnImages.diagram} alt={g.mascotEvolutionAlt} sizes={sizesFor(663)} />,
            )}
          </div>
        </div>

        {/* 4 thumbs com legenda (17:1405): 351.21 | 325.77 × 3, vão 7.826 */}
        <div className={`${s.row} ${s.thumbs} ${reveal}`}>
          {psnImages.prototypes.map((im, i) => (
            <figure key={im.file} className={s.fig} style={grow(im.w)}>
              {zoomed(
                LB.prototypes + i,
                <Pic image={im} alt={g.prototypeAlts[i] ?? ""} sizes={sizesFor(im.w)} />,
              )}
              <figcaption className={s.cap}>{g.prototypes[i]}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* 5. Projeto final 669 | 41 | Ferramentas utilizadas 641 (17:1419) */}
      <div className={`${s.two} ${s.final}`}>
        <CaseSection title={finalProject.title} size="lg" titleClassName={title.line18}>
          <div className="flex flex-col gap-[18px]">
            <p className={finalRest.length ? `${textClass} ${s.fill}` : textClass}>{finalLead}</p>
            {finalRest.map((p, i) => (
              <p key={i} className={`${textClass} italic`}>
                {p}
              </p>
            ))}
          </div>
        </CaseSection>
        <CaseSection title={tools.title} size="lg" titleClassName={title.base}>
          <Pills items={tools.items} className={s.pills} />
        </CaseSection>
      </div>

      {/* 6. Manual, bailarina, jogo do tempo | xadrez, colagem final (17:1443): 28px entre eles */}
      <div className={s.arts}>
        <div className={reveal}>
          {zoomed(LB.manual, <Pic image={psnImages.manual} alt={g.manualAlt} sizes={sizesFor(1354)} />)}
        </div>
        <div className={reveal}>
          {zoomed(
            LB.ballerina,
            <Pic image={psnImages.ballerina} alt={g.ballerinaAlt} sizes={sizesFor(1354)} />,
          )}
        </div>
        {/* 512.55 | 18.24 | 823.21 (17:2025) */}
        <div className={`${s.row} ${s.jogo} ${reveal}`}>
          <div className={s.cell} style={grow(psnImages.jogoDoTempo.w)}>
            {zoomed(
              LB.jogoDoTempo,
              <Pic image={psnImages.jogoDoTempo} alt={g.jogoDoTempoAlt} sizes={sizesFor(513)} />,
            )}
          </div>
          <div className={s.cell} style={grow(psnImages.logoGrid.w)}>
            {/* No mobile a grade 4 × 2 fica ilegível: vira as duas metades 2 × 2,
                uma embaixo da outra (mesmo item do lightbox). */}
            {zoomed(
              LB.logoGrid,
              <>
                <Pic
                  image={psnImages.logoGrid}
                  alt={g.logoGridAlt}
                  sizes={sizesFor(823)}
                  className={s.gridFull}
                />
                <span className={s.gridHalves} aria-hidden="true">
                  {(["xadrez-m1", "xadrez-m2"] as const).map((file) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={file}
                      src={`${base}/${file}.webp`}
                      srcSet={`${base}/${file}.webp 412w, ${base}/${file}@2x.webp 824w`}
                      sizes="92vw"
                      alt=""
                      width={412}
                      height={587}
                      loading="lazy"
                      decoding="async"
                    />
                  ))}
                </span>
              </>,
            )}
          </div>
        </div>
        <div className={reveal}>
          {zoomed(
            LB.finalPosters,
            <Pic image={psnImages.finalPosters} alt={g.finalPostersAlt} sizes={sizesFor(1354)} />,
          )}
        </div>
      </div>

      {/* 7. Nota sobre IA (17:2143): 445px à direita, 28px abaixo da colagem */}
      <p className={`${textClass} ${s.note} italic`}>{project.aiNote}</p>
    </>
  );
}
