import type { CSSProperties, ReactNode } from "react";
import { isProject, type LocalizedProject, type ProjectOf } from "@/lib/projects";
import { CaseSection, DashedPill, bodyFontBold } from "@/components/case-study/CaseShell";
import { textClass, wideTitle as title, zoomHelpers } from "./wide";
import s from "./cascavel.module.css";

export const cascavelBase = "/images/projects/cascavel";
const base = cascavelBase;

/** Case do Cascavel com os textos do dicionário (o tipo de `projects.cascavel`). */
export type CascavelProject = LocalizedProject & ProjectOf<"cascavel">;

export function isCascavelProject(project: LocalizedProject): project is CascavelProject {
  return isProject(project, "cascavel");
}

/* ---------- Dados de layout (não traduzíveis) ----------
   Cada imagem é o export 2x do nó no Figma (frame 17:4049): caixa do Figma em px
   (w × h) e o tamanho do arquivo 2x (o 1x é a metade). Estas listas mandam na
   página e no lightbox; o dicionário só dá o texto de cada item. */

export type CascavelImage = { file: string; w: number; h: number; px2: number; py2: number };

const img = (file: string, w: number, h: number, px2: number, py2: number): CascavelImage => ({
  file,
  w,
  h,
  px2,
  py2,
});

/** Caixa da colagem da Imagem b (x, y, w, h em px do Figma, relativos a 17:4231). */
type CollageBox = readonly [number, number, number, number];

export const cascavelImages = {
  /** Hero (17:4156): render desfocado + selo da serpente, achatado. */
  hero: img("hero", 1354, 436, 2708, 872),
  /** Mapa de fluxo (17:4190). */
  flow: img("fluxo", 1353, 242.126, 2706, 485),
  /** Painéis de referência (17:4215), à direita de "Prototipagem". */
  panels: img("paineis", 762, 333.943, 1524, 668),
  /** Imagem a (17:4218): o quadro escuro com as 6 pranchas, achatado. */
  imageA: img("imagem-a", 1354, 1457, 2708, 2914),
  /** Imagem b (17:4231): peças da colagem, na ordem do lightbox. */
  school: img("escolinha", 775.567, 603.237, 1552, 1207),
  painting: img("pintura", 566.013, 377.342, 1133, 755),
  blender: img("blender", 566.013, 214.67, 1133, 430),
  /** 8 cartões de diálogo + o sol (17:4255…17:4418), recorte do export 2x da colagem. */
  cards: img("cartoes", 775.31, 112.48, 1551, 225),
  fruit: img("fruta", 119.834, 119.834, 240, 240),
  house: img("casarao", 362.262, 363.187, 725, 727),
  /** Quel Pipoquinhas | Supermercado Cajuzinho / Feirinha (17:4480, 17:4600, 17:4633). */
  signs: img("letreiros", 971.28, 206.47, 1943, 413),
  /** Primeiras versões (17:4665…17:4675): 3 fotos 4:3 e 6 renders 16:9. */
  firstVersions: [
    img("versao-1", 448.078, 336.225, 897, 673),
    img("versao-2", 448.3, 336.225, 897, 673),
    img("versao-3", 448.3, 336.225, 897, 673),
    ...[4, 5, 6, 7, 8, 9].map((n) => img(`versao-${n}`, 448.406, 252.228, 897, 505)),
  ],
  /** Renders finais (17:4708…17:4713), todos com 1354 de largura. */
  renders: [
    img("render-1", 1354.355, 677.178, 2709, 1355),
    img("render-2", 1354.355, 677.178, 2709, 1355),
    img("render-3", 1354.355, 677.178, 2709, 1355),
    img("render-4", 1354.355, 693.206, 2709, 1387),
    img("render-5", 1354.355, 761.825, 2709, 1524),
    img("render-6", 1354.355, 677.178, 2709, 1355),
  ],
} as const;

/** Colagem da Imagem b (17:4231, 1351.69 × 1009.33): caixas do get_metadata. */
const collage = {
  school: [0, 0, 775.567, 603.237],
  painting: [785.37, 0.04, 566.013, 377.342],
  blender: [785.37, 388.49, 566.013, 214.67],
  cards: [0, 645.89, 775.31, 112.48],
  fruit: [824.35, 637.59, 119.834, 119.834],
  house: [989.43, 646.23, 362.262, 363.187],
  signs: [0, 802.87, 971.28, 206.47],
} satisfies Record<string, CollageBox>;

/** Setas azuis (vetores 17:4655–4661), rasterizadas do SVG do Figma: caixa e arquivo. */
const arrows: readonly { file: string; box: CollageBox; px2: number; py2: number }[] = [
  { file: "seta-a", box: [28.5, 591, 31, 50], px2: 62, py2: 100 },
  { file: "seta-b", box: [836.5, 380, 26.5, 35.5], px2: 53, py2: 71 },
  { file: "seta-c", box: [957.5, 674.5, 57, 32], px2: 114, py2: 64 },
];

/** Índices no lightbox (mesma ordem de `getCascavelLightbox`, em cascavel/lightbox.ts). */
export const LB = (() => {
  const firstVersions = 11;
  return {
    hero: 0,
    flow: 1,
    panels: 2,
    imageA: 3,
    school: 4,
    painting: 5,
    blender: 6,
    cards: 7,
    fruit: 8,
    house: 9,
    signs: 10,
    firstVersions,
    renders: firstVersions + cascavelImages.firstVersions.length,
  };
})();

/** Caminhos 1x/2x de uma imagem (srcSet com a largura real de cada arquivo). */
export function cascavelSrc(image: CascavelImage) {
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

/** Caixa da colagem → variáveis em px do Figma (consumidas em % no CSS). */
const boxStyle = ([x, y, w, h]: CollageBox) =>
  ({ "--x": x, "--y": y, "--w": w, "--h": h }) as CSSProperties;

/** Imagem de uma caixa do Figma: proporção do Figma e recorte `cover`. */
function Pic({
  image,
  alt,
  sizes,
  className,
}: {
  image: CascavelImage;
  alt: string;
  sizes: string;
  className?: string;
}) {
  const { src, srcSet } = cascavelSrc(image);
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

/** Capa do case (17:4156): export 1x/2x do Figma (render desfocado + selo). */
export function CascavelHero({ project }: { project: LocalizedProject }) {
  const alt = isCascavelProject(project) ? project.heroAlt : project.title;
  const { src, srcSet } = cascavelSrc(cascavelImages.hero);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes="(min-width: 1432px) 1352px, (min-width: 800px) calc(100vw - 5rem), 90vw"
      width={1354}
      height={436}
      alt={alt}
      className={s.hero}
    />
  );
}

/**
 * Parágrafos de um mesmo nó de texto do Figma. No Figma o justificado vale para
 * todas as linhas menos a última do nó, então a última linha de cada parágrafo
 * (menos o último) também é justificada (`.fill`). Dentro de um parágrafo, `\n`
 * é a quebra de linha simples do Figma (a linha antes dela também justifica).
 */
function Paras({ items }: { items: readonly ReactNode[] }) {
  return (
    <div className="flex flex-col gap-[18px]">
      {items.map((p, i) => (
        <p key={i} className={i < items.length - 1 ? `${textClass} ${s.fill}` : textClass}>
          {typeof p === "string" ? withBreaks(p) : p}
        </p>
      ))}
    </div>
  );
}

function withBreaks(text: string): ReactNode {
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ));
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

/** Perfis do Sketchfab citados (17:4717), na ordem de `credits.authors`. Dados, não texto. */
const SKETCHFAB = [
  "https://sketchfab.com/Vr-cvantorium",
  "https://sketchfab.com/henriqueart_lfv",
  "https://sketchfab.com/shonesplash3",
  "https://sketchfab.com/haensen-art",
] as const;

/**
 * Corpo do case Cascavel (Figma 17:4049), reutilizado pela página e pelo modal.
 *
 * `zoom` (só a página completa passa): aria-label de cada item do lightbox. Com
 * ele as imagens viram gatilhos com zoom no hover e os blocos ganham o reveal ao
 * rolar, como nos outros cases 'wide'.
 */
export function CascavelCase({
  project,
  zoom,
}: {
  project: LocalizedProject;
  zoom?: readonly string[];
}) {
  if (!isCascavelProject(project)) return null;

  const { creationProcess: cp, prototyping, gallery: g, finalProject, tools, credits, execution } =
    project.sections;
  const { frame, image, reveal } = zoomHelpers(zoom);
  const intro = project.intro.split("\n\n");

  /** Peça absoluta da colagem da Imagem b (zoom + lightbox). */
  const piece = (box: CollageBox, index: number, im: CascavelImage, alt: string) => (
    <div className={s.piece} style={boxStyle(box)}>
      {image(index, <Pic image={im} alt={alt} sizes={sizesFor(im.w)} />)}
    </div>
  );

  return (
    // Frame de 1354px do Figma (17:4155) dentro da coluna de 1352 do CaseShell.
    <div className={s.body}>
      {/* 1. Cabeçalho (17:4163): título, tags e intro, 24px entre eles */}
      <section className="flex flex-col gap-6">
        <h1
          className={`text-[1.75rem] text-[color:var(--color-blue)] md:text-[2rem] ${title.box30}`}
          style={bodyFontBold}
        >
          {project.subtitle}
        </h1>
        <Pills items={project.tags} className={s.tags} />
        <Paras items={intro} />
      </section>

      {/* 2. Processo de criação + mapa de fluxo (17:4185): 32px entre eles */}
      <div className="flex flex-col gap-8">
        <CaseSection title={cp.title} size="lg" titleClassName={title.box30} className={s.w1352}>
          <p className={textClass}>
            {cp.leadBefore}
            <strong className="font-bold">{cp.nameAmanda}</strong>
            {cp.sep1}
            <strong className="font-bold">{cp.nameRaquel}</strong>
            {cp.sep2}
            <strong className="font-bold">{cp.nameFelipe}</strong>
            {cp.leadAfter}
          </p>
        </CaseSection>
        <div className={[s.w1353, reveal].filter(Boolean).join(" ")}>
          {image(LB.flow, <Pic image={cascavelImages.flow} alt={g.flowAlt} sizes={sizesFor(1353)} />)}
        </div>
      </div>

      {/* 3. Prototipagem 557 | 33 | painéis 762 (17:4192), centralizados na vertical;
          Imagem a 33px abaixo (17:4216) */}
      <div className={s.proto}>
        <div className={s.protoRow}>
          <CaseSection title={prototyping.title} size="lg" titleClassName={title.base}>
            <Pills items={prototyping.tabs} className={`mb-6 ${s.pills} ${s.nowrap}`} />
            <Paras items={prototyping.paragraphs} />
          </CaseSection>
          <div className={reveal}>
            {image(LB.panels, <Pic image={cascavelImages.panels} alt={g.panelsAlt} sizes={sizesFor(762)} />)}
          </div>
        </div>

        <figure className={s.block}>
          <figcaption className={s.cap}>{g.imageA}</figcaption>
          {frame(
            LB.imageA,
            <Pic image={cascavelImages.imageA} alt={g.imageAAlt} sizes={sizesFor(1354)} />,
            true,
          )}
        </figure>
      </div>

      {/* 4. Imagem b (17:4229): colagem com as caixas do Figma (x = 2.31) */}
      <figure className={s.block}>
        <figcaption className={s.cap}>{g.imageB}</figcaption>
        <div className={`${s.collage} ${reveal}`}>
          {piece(collage.school, LB.school, cascavelImages.school, g.schoolAlt)}
          {piece(collage.painting, LB.painting, cascavelImages.painting, g.paintingAlt)}
          {piece(collage.blender, LB.blender, cascavelImages.blender, g.blenderAlt)}
          {piece(collage.cards, LB.cards, cascavelImages.cards, g.cardsAlt)}
          {piece(collage.fruit, LB.fruit, cascavelImages.fruit, g.fruitAlt)}
          {piece(collage.house, LB.house, cascavelImages.house, g.houseAlt)}
          {piece(collage.signs, LB.signs, cascavelImages.signs, g.signsAlt)}
          {arrows.map((a) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={a.file}
              src={`${base}/${a.file}@2x.webp`}
              alt=""
              aria-hidden="true"
              width={a.px2 / 2}
              height={a.py2 / 2}
              loading="lazy"
              decoding="async"
              className={s.arrow}
              style={boxStyle(a.box)}
            />
          ))}
        </div>
      </figure>

      {/* 5. Primeiras versões e renderizações (17:4662): 3 × 4:3, depois 2 × 3 × 16:9 */}
      <figure className={s.block}>
        <figcaption className={s.cap}>{g.firstVersions}</figcaption>
        <div className={`${s.versions} ${reveal}`}>
          {cascavelImages.firstVersions.map((im, i) => (
            <div key={im.file}>
              {image(
                LB.firstVersions + i,
                <Pic image={im} alt={g.firstVersionsAlts[i] ?? ""} sizes={sizesFor(448)} />,
              )}
            </div>
          ))}
        </div>
      </figure>

      {/* 6. Projeto final 572 | 98 | Ferramentas utilizadas 641 (17:4676) */}
      <div className={`${s.two} ${s.final}`}>
        <CaseSection title={finalProject.title} size="lg" titleClassName={title.line18}>
          <Paras items={finalProject.paragraphs} />
        </CaseSection>
        <CaseSection title={tools.title} size="lg" titleClassName={title.base}>
          <Pills items={tools.items} className={`${s.pills} ${s.nowrap}`} />
        </CaseSection>
      </div>

      {/* 7. Renders finais (17:4707, 32px entre eles) e, 28px abaixo, Citação | Execução (17:4714) */}
      <div className={s.end}>
        <div className={s.renders}>
          {cascavelImages.renders.map((im, i) => (
            <div key={im.file} className={reveal}>
              {image(LB.renders + i, <Pic image={im} alt={g.rendersAlts[i] ?? ""} sizes={sizesFor(1354)} />)}
            </div>
          ))}
        </div>

        {/* Citação 641 | 56 | Execução 669 (passa 12px da coluna, como no Figma) */}
        <div className={`${s.two} ${s.credits}`}>
          <CaseSection title={credits.title} size="lg" titleClassName={title.line18}>
            {/* Figma: um só nó; a 1ª frase acaba numa quebra de linha (justificada) */}
            <p className={`${textClass} ${s.fill}`}>{credits.fonts}</p>
            <p className={textClass}>
              {credits.models.map((segment, i) => {
                const author = credits.authors[i];
                const href = SKETCHFAB[i];
                return (
                  <span key={i}>
                    {segment}
                    {author && href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={s.link}
                        aria-label={credits.authorLink.replace("{name}", author.trim())}
                      >
                        {author}
                      </a>
                    )}
                  </span>
                );
              })}
            </p>
          </CaseSection>
          <CaseSection title={execution.title} size="lg" titleClassName={title.line18}>
            <div className="flex flex-col gap-6">
              <p className={textClass}>
                <strong className="font-bold">{execution.lead}</strong>
                {execution.body}
              </p>
              <p className={`${textClass} ${s.note} italic`}>{project.aiNote}</p>
            </div>
          </CaseSection>
        </div>
      </div>
    </div>
  );
}
