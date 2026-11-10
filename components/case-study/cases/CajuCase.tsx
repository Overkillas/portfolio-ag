import type { CSSProperties, ReactNode } from "react";
import { isProject, type LocalizedProject, type ProjectOf } from "@/lib/projects";
import { CaseSection, DashedPill, bodyFontBold } from "@/components/case-study/CaseShell";
import { Paragraphs, textClass, wideTitle as title, zoomHelpers } from "./wide";
import { CajuStack } from "./caju/CajuStack";
import { CajuBook } from "./caju/CajuBook";
import s from "./caju.module.css";

export const cajuBase = "/images/projects/caju";
const base = cajuBase;

/** Case do Caju com os textos do dicionário (o tipo de `projects.caju`). */
export type CajuProject = LocalizedProject & ProjectOf<"caju">;

export function isCajuProject(project: LocalizedProject): project is CajuProject {
  return isProject(project, "caju");
}

/* ---------- Dados de layout (não traduzíveis) ----------
   Cada imagem é o export do nó do Figma (frame 17:5070) em 2x, com a caixa do
   Figma (w × h em px) e a largura do arquivo 2x. O arquivo 1x é a metade.
   Estas listas mandam na página e no lightbox; o dicionário só dá o texto de
   cada item pelo índice. */

export type CajuImage = { file: string; w: number; h: number; px2: number };

const img = (file: string, w: number, h: number, px2: number): CajuImage => ({ file, w, h, px2 });

export const cajuImages = {
  /** Hero (17:5177): duas páginas do livro, 1354 × 461. */
  hero: img("hero", 1354, 461, 2708),
  /** Quadro de planejamento (17:5216), à direita do cabeçalho. */
  board: img("quadro", 631, 568.46, 1262),
  /** Brainstorming (17:5353, 17:5354 | 17:5355). */
  brainstorm: [
    img("brainstorm-1", 316.83, 212.04, 634),
    img("brainstorm-2", 316.8, 322.8, 634),
    img("brainstorm-3", 404.04, 538.72, 809),
  ],
  /** Painel visual - Imagem a (17:5358): colagem de referências. */
  panel: img("painel-visual", 626.13, 538.72, 1253),
  /** Teste de cores e storyboard (17:5404) | Design de personagens (17:5416). */
  colorTests: img("teste-cores", 733.63, 349.89, 1468),
  characters: img("design-personagens", 608.15, 349.79, 1217),
  /** Rafes das páginas (17:5431, 17:5432). */
  roughs: [img("rafe-1", 668.88, 366.84, 1338), img("rafe-2", 668.88, 366.63, 1338)],
  /** Pintura das páginas e diagramação: coluna esquerda (17:5438, 17:5439) e direita (17:5441, 17:5442). */
  painting: [
    img("pintura-1", 665.54, 364.43, 1332),
    img("pintura-2", 665.54, 386.67, 1332),
    img("diagramacao-1", 665.54, 296.76, 1332),
    img("diagramacao-2", 665.54, 451.4, 1332),
  ],
  /** Mídia impressa (17:5469..5471). */
  printed: [
    img("impresso-1", 520.78, 390.58, 1042),
    img("impresso-2", 520.78, 390.58, 1042),
    img("impresso-3", 292.94, 390.58, 586),
  ],
} as const;

/** Índices no lightbox (mesma ordem de `getCajuLightbox`, em caju/lightbox.ts). */
export const LB = (() => {
  const brainstorm = 2;
  const panel = brainstorm + cajuImages.brainstorm.length;
  const colorTests = panel + 1;
  const characters = colorTests + 1;
  const roughs = characters + 1;
  const painting = roughs + cajuImages.roughs.length;
  const printed = painting + cajuImages.painting.length;
  return { hero: 0, board: 1, brainstorm, panel, colorTests, characters, roughs, painting, printed };
})();

/** Páginas da pilha (17:5475/5476/5477 | 17:5479/5480/5481), em 2x do arquivo original. */
const STACK_PAGES = 6;
/** Faces do livro: capa, 30 páginas e contracapa (as do canvas do Claude Design). */
const BOOK_FACES = 32;

/** Caminhos 1x/2x de uma imagem (srcSet com a largura real de cada arquivo). */
export function cajuSrc(image: CajuImage) {
  const w1 = Math.round(image.px2 / 2);
  return {
    src: `${base}/${image.file}.webp`,
    src2x: `${base}/${image.file}@2x.webp`,
    srcSet: `${base}/${image.file}.webp ${w1}w, ${base}/${image.file}@2x.webp ${image.px2}w`,
  };
}

/** Imagem de uma caixa do Figma: proporção do Figma e recorte `cover`. */
function Pic({ image, alt, sizes, eager }: { image: CajuImage; alt: string; sizes: string; eager?: boolean }) {
  const { src, srcSet } = cajuSrc(image);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={Math.round(image.w)}
      height={Math.round(image.h)}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={s.pic}
      style={{ "--ar": `${image.w} / ${image.h}` } as CSSProperties}
    />
  );
}

/** `sizes` para uma imagem que ocupa `w` px de 1352 na coluna do case. */
const sizesFor = (w: number) =>
  `(min-width: 1432px) ${Math.round(w)}px, (min-width: 48rem) ${((w / 1352) * 100).toFixed(1)}vw, 92vw`;

/** Pesos de uma fileira flex = larguras do Figma. */
const grow = (w: number) => ({ "--grow": w }) as CSSProperties;

/** Capa do case (17:5177): duas páginas do livro, export 1x/2x do Figma. */
export function CajuHero({ project }: { project: LocalizedProject }) {
  const alt = isCajuProject(project) ? project.heroAlt : project.title;
  const { src, srcSet } = cajuSrc(cajuImages.hero);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes="(min-width: 1432px) 1352px, (min-width: 800px) calc(100vw - 5rem), 90vw"
      width={1354}
      height={461}
      alt={alt}
      className={s.hero}
    />
  );
}

/**
 * Corpo do case Caju (Figma 17:5070), reutilizado pela página e pelo modal.
 *
 * `zoom` (só a página completa passa): aria-label de cada item do lightbox. Com
 * ele as imagens viram gatilhos com zoom no hover e as fileiras ganham o reveal ao
 * rolar, como no Batuco-tuco e no Pontinhas soltas. A pilha de páginas e o livro
 * são do livro: não abrem o lightbox.
 */
export function CajuCase({ project, zoom }: { project: LocalizedProject; zoom?: readonly string[] }) {
  if (!isCajuProject(project)) return null;

  const { creationProcess: cp, gallery: g, prototyping, finalProject, tools, stack, readingSim, book } =
    project.sections;
  const { image, reveal } = zoomHelpers(zoom);
  const zoomed = (index: number, node: ReactNode) => image(index, node);

  const faces = Array.from({ length: BOOK_FACES }, (_, i) => ({
    src: `${base}/livro/face-${String(i).padStart(2, "0")}.webp`,
    alt: book.faces[i] ?? "",
  }));

  return (
    <>
      {/* 1. Cabeçalho | quadro de planejamento (17:5181): 688 | 32 | 631 */}
      <div className={s.top}>
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-6">
            <h1
              className={`text-[1.75rem] text-[color:var(--color-blue)] md:text-[2rem] ${title.box30}`}
              style={bodyFontBold}
            >
              {project.subtitle}
            </h1>
            {/* No Figma as cinco tags cabem nos 685px; no Chrome a Clother sai uns px
                mais larga por pill. Com a coluna cheia (≥ 1432px) a linha não quebra,
                como as pills do Batuco-tuco e do Pontinhas soltas. */}
            <ul className="flex flex-wrap gap-2 min-[1432px]:flex-nowrap">
              {project.tags.map((tag) => (
                <li key={tag}>
                  <DashedPill>{tag}</DashedPill>
                </li>
              ))}
            </ul>
          </section>
          <Paragraphs items={project.intro.split("\n\n")} />
          <CaseSection title={cp.title} size="lg" titleClassName={title.box30}>
            <div className="flex flex-col gap-[18px]">
              <p className={textClass}>
                {cp.leadBefore}
                <strong className="font-bold">{cp.leadAna}</strong>
                {cp.leadBetween}
                <strong className="font-bold">{cp.leadThays}</strong>
                {cp.leadAfter}
              </p>
              {cp.paragraphs.map((p, i) => (
                <p key={i} className={textClass}>
                  {p}
                </p>
              ))}
            </div>
          </CaseSection>
        </div>
        <div className={reveal}>
          {zoomed(LB.board, <Pic image={cajuImages.board} alt={g.boardAlt} sizes={sizesFor(631)} />)}
        </div>
      </div>

      {/* 2. Brainstorming (17:5349) | Painel visual - Imagem a (17:5357) */}
      <div className={`${s.row} ${s.gapBrain} ${reveal}`}>
        <figure className={s.fig} style={grow(724.84)}>
          <div className={s.brainGrid}>
            <div className={s.brainCol}>
              {cajuImages.brainstorm.slice(0, 2).map((im, i) => (
                <div key={im.file}>
                  {zoomed(LB.brainstorm + i, <Pic image={im} alt={g.brainstormingAlts[i] ?? ""} sizes={sizesFor(im.w)} />)}
                </div>
              ))}
            </div>
            <div>
              {zoomed(
                LB.brainstorm + 2,
                <Pic image={cajuImages.brainstorm[2]} alt={g.brainstormingAlts[2] ?? ""} sizes={sizesFor(404)} />,
              )}
            </div>
          </div>
          <figcaption className={`${s.cap} ${s.capBrain}`}>{g.brainstorming}</figcaption>
        </figure>
        <figure className={s.fig} style={grow(626.13)}>
          {zoomed(LB.panel, <Pic image={cajuImages.panel} alt={g.visualPanelAlt} sizes={sizesFor(626)} />)}
          <figcaption className={s.cap}>{g.visualPanel}</figcaption>
        </figure>
      </div>

      {/* 3. Prototipagem (17:5370) */}
      <CaseSection title={prototyping.title} size="lg" titleClassName={title.base}>
        <ul className="mb-6 flex flex-wrap gap-2.5">
          {prototyping.tabs.map((tab) => (
            <li key={tab}>
              <DashedPill>{tab}</DashedPill>
            </li>
          ))}
        </ul>
        <Paragraphs items={prototyping.paragraphs} />
      </CaseSection>

      {/* 4. Teste de cores e storyboard | Design de personagens (17:5402): 733.63 | 16 | 608.15 */}
      <div className={`${s.row} ${s.gap16} ${reveal}`}>
        <figure className={s.fig} style={grow(733.63)}>
          {zoomed(LB.colorTests, <Pic image={cajuImages.colorTests} alt={g.colorTestsAlt} sizes={sizesFor(734)} />)}
          <figcaption className={s.cap}>{g.colorTests}</figcaption>
        </figure>
        <figure className={s.fig} style={grow(608.15)}>
          {zoomed(LB.characters, <Pic image={cajuImages.characters} alt={g.charactersAlt} sizes={sizesFor(608)} />)}
          <figcaption className={s.cap}>{g.characters}</figcaption>
        </figure>
      </div>

      {/* 5. Rafes das páginas (17:5426): legenda centralizada + 2 × 668.88, vão 16.51 */}
      <figure className={`${s.block} ${reveal}`}>
        <figcaption className={`${s.cap} ${s.capCenter}`}>{g.roughs}</figcaption>
        <div className={`${s.row} ${s.gap16}`}>
          {cajuImages.roughs.map((im, i) => (
            <div key={im.file} className={s.cell} style={grow(im.w)}>
              {zoomed(LB.roughs + i, <Pic image={im} alt={g.roughsAlts[i] ?? ""} sizes={sizesFor(im.w)} />)}
            </div>
          ))}
        </div>
      </figure>

      {/* 6. Pintura das páginas e diagramação (17:5433): duas colunas de 665.54, vão 17 */}
      <figure className={`${s.block} ${reveal}`}>
        <figcaption className={`${s.cap} ${s.capCenter}`}>{g.painting}</figcaption>
        <div className={`${s.row} ${s.gap17}`}>
          {[
            [0, 1],
            [2, 3],
          ].map((col, c) => (
            <div key={c} className={`${s.cell} ${s.col} ${c === 0 ? s.gapPaintL : s.gapPaintR}`} style={grow(665.54)}>
              {col.map((i) => (
                <div key={cajuImages.painting[i].file}>
                  {zoomed(
                    LB.painting + i,
                    <Pic image={cajuImages.painting[i]} alt={g.paintingAlts[i] ?? ""} sizes={sizesFor(666)} />,
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </figure>

      {/* 7. Projeto final | Ferramentas utilizadas (17:5443): 667 | 22 | 641 */}
      <div className={s.two}>
        <CaseSection title={finalProject.title} size="lg" titleClassName={title.line18}>
          <Paragraphs items={finalProject.paragraphs} />
        </CaseSection>
        <CaseSection title={tools.title} size="lg" titleClassName={title.base}>
          <ul className="flex flex-wrap gap-2.5">
            {tools.items.map((tool) => (
              <li key={tool}>
                <DashedPill>{tool}</DashedPill>
              </li>
            ))}
          </ul>
        </CaseSection>
      </div>

      {/* 8. Mídia impressa (17:5466): legenda + 520.78 | 520.78 | 292.94, vão 13 */}
      <figure className={`${s.block} ${s.printed} ${reveal}`}>
        <figcaption className={`${s.cap} ${s.capCenter}`}>{g.printed}</figcaption>
        <div className={`${s.row} ${s.gap13}`}>
          {cajuImages.printed.map((im, i) => (
            <div key={im.file} className={s.cell} style={grow(im.w)}>
              {zoomed(LB.printed + i, <Pic image={im} alt={g.printedAlts[i] ?? ""} sizes={sizesFor(im.w)} />)}
            </div>
          ))}
        </div>
      </figure>

      {/* 9. Pilha de páginas em leque (17:5473): empilha com o scroll, sem lightbox */}
      <CajuStack label={stack.label}>
        {Array.from({ length: STACK_PAGES }, (_, i) => {
          const col = i < 3 ? s.sCol0 : s.sCol1;
          const row = i % 3 === 0 ? s.sRow0 : i % 3 === 1 ? s.sRow1 : s.sRow2;
          return (
            <div key={i} className={`${s.sCard} ${col} ${row}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${base}/pilha/pagina-${i + 1}.webp`}
                alt={stack.alts[i] ?? ""}
                width={1103}
                height={1103}
                loading="lazy"
                decoding="async"
              />
            </div>
          );
        })}
      </CajuStack>

      {/* 10. Simulação de leitura: o livro do canvas do Claude Design */}
      <CajuBook
        faces={faces}
        texts={{
          title: readingSim.title,
          label: book.label,
          counter: book.counter,
          hint: book.hint,
          nav: book.nav,
        }}
      />

      {/* 11. Nota sobre IA (17:5488), 32px acima do balão de agradecimento */}
      <p className={`${textClass} ${s.note} italic`}>{project.aiNote}</p>
    </>
  );
}
