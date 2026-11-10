import type { CSSProperties } from "react";
import { isProject, type LocalizedProject } from "@/lib/projects";
import { CaseSection, DashedPill, bodyFontBold } from "@/components/case-study/CaseShell";
import { type Box, Paragraphs, boxVars, textClass, wideTitle as title, zoomHelpers } from "./wide";
import s from "./pontinhas.module.css";

export const pontinhasBase = "/images/projects/pontinhas-soltas";
const base = pontinhasBase;

/* ---------- Dados de layout (não traduzíveis) ----------
   Estas listas mandam na página e no lightbox; o dicionário só dá o texto de cada
   item pelo índice. Assim uma tradução com itens a mais ou a menos não desalinha
   o lightbox nem derruba a página. */

/**
 * Fotos de Prototipagem (nodes 17:3044–17:3050), na ordem de `prototyping.images`.
 * Na página entra o export do nó (o recorte do Figma, 446.9 × 251.13 em 2x); no
 * lightbox, a foto original, no tamanho real.
 */
export const photos = [
  { width: 1600, height: 1200 },
  { width: 1920, height: 1080 },
  { width: 1600, height: 1200 },
  { width: 1600, height: 1200 },
  { width: 1600, height: 1200 },
  { width: 1200, height: 1600 },
].map((size, i) => ({
  crop: `${base}/prototipagem/recorte-${i + 1}@2x.jpg`,
  original: `${base}/prototipagem/foto-${i + 1}.jpg`,
  ...size,
}));

/** Nomes no card azul (nodes 17:3119/3163/3186/3210/3240), na ordem de `showcase.names`. */
const showcaseNames: readonly (readonly [number, number])[] = [
  [160.45, 863.61],
  [428.33, 861.71],
  [672.24, 862.13],
  [953.26, 861.97],
  [1201.81, 862.08],
];

/** Grupos da prancha creme (relativos ao frame 17:3247), na ordem do lightbox. */
export const creamGroups: { file: string; box: Box; width: number; height: number }[] = [
  { file: "voadores", box: [113.225, 83.432, 1123.74, 517.879], width: 2248, height: 1036 },
  { file: "turnarounds", box: [91.986, 675.458, 1168.025, 1177.864], width: 2337, height: 2356 },
  { file: "cabecas", box: [99.066, 1939.357, 1151.011, 565.297], width: 2303, height: 1131 },
  { file: "danca", box: [102.683, 2505.051, 1162.599, 534.841], width: 2326, height: 1070 },
];

/**
 * Cards dos personagens (node 17:3989), na ordem de `characterCards.list`
 * (Ali, Jemmy, Lac, Nina, Haggy). Coordenadas relativas ao grupo (1360.95 × 1507.54):
 * nome e frase (posição, corpo e largura da caixa), cores do Figma e, para o
 * card empilhado do mobile, o recorte da arte (do topo do retângulo até o nome).
 */
const cards: {
  name: readonly [number, number, number];
  text: readonly [number, number, number, number];
  fg: string;
  bg: string;
  crop: Box;
}[] = [
  { name: [36.97, 598.22, 87.875], text: [233, 616.81, 16.899, 192.648], fg: "#f4aecc", bg: "#1b2949", crop: [6.55, 15.21, 449.994, 583.01] },
  { name: [482.19, 624.94, 63.987], text: [733.88, 648.41, 13.519, 149.304], fg: "#0e488f", bg: "#faf3eb", crop: [456.55, 15.21, 449.994, 609.73] },
  { name: [937.69, 604.62, 87.875], text: [1133.72, 618.94, 16.899, 192.648], fg: "#6f95ce", bg: "#fadae7", crop: [906.54, 15.21, 449.994, 589.41] },
  { name: [124.85, 1368.42, 87.875], text: [386.78, 1403.91, 16.899, 192.648], fg: "#e0ecef", bg: "#6f95ce", crop: [7.15, 761.6, 690.89, 606.82] },
  { name: [739.89, 1368.42, 87.875], text: [1092.21, 1387.77, 16.899, 243.152], fg: "#fadae7", bg: "#0e488f", crop: [698.02, 761.6, 659.18, 606.82] },
];

/**
 * Índices no lightbox, derivados das listas acima (mesma ordem de
 * `getPontinhasLightbox`, em pontinhas/lightbox.ts): 0 banner, fotos, card azul,
 * grupos da prancha creme, cards dos personagens.
 */
export const LB = (() => {
  const photosAt = 1;
  const showcase = photosAt + photos.length;
  const cream = showcase + 1;
  return { photos: photosAt, showcase, cream, cards: cream + creamGroups.length };
})();

/**
 * Corpo do case (tudo entre `<CaseShell>` e `</CaseShell>`), reutilizado pela página e pelo modal.
 *
 * `zoom` (só a página completa passa): aria-label de cada item do lightbox ("Ampliar: …").
 * Com ele, imagens e pranchas viram gatilhos com zoom no hover e ganham o reveal ao
 * rolar — o mesmo comportamento do Batuco-tuco. Sem ele (modal), o HTML fica sem isso.
 */
export function PontinhasSoltasCase({
  project,
  zoom,
}: {
  project: LocalizedProject;
  zoom?: readonly string[];
}) {
  // Estreita o tipo para as chaves do Pontinhas soltas.
  if (!isProject(project, "pontinhas-soltas")) return null;

  const { creationProcess: cp, prototyping, finalProject, tools, showcase, characterCards } =
    project.sections;
  const gallery = project.gallery;
  const creamAlts = [gallery.flyingAlt, gallery.turnaroundsAlt, gallery.headsAlt, gallery.dancingAlt];
  const { frame, image, reveal } = zoomHelpers(zoom);

  return (
    <>
      {/* 1. Título, tags e intro (node 17:2992) */}
      <section className="flex flex-col gap-6">
        <h1
          className={`text-[1.75rem] text-[color:var(--color-blue)] md:text-[2rem] ${title.box30}`}
          style={bodyFontBold}
        >
          {project.subtitle}
        </h1>
        <ul className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag}>
              <DashedPill>{tag}</DashedPill>
            </li>
          ))}
        </ul>
        <Paragraphs items={project.intro.split("\n\n")} />
      </section>

      {/* 2. Processo de criação (node 17:3014) */}
      <CaseSection title={cp.title} size="lg" titleClassName={title.box30}>
        <Paragraphs items={cp.paragraphs} />
      </CaseSection>

      {/* 3. Prototipagem + 6 fotos (node 17:3019) */}
      <div className="flex flex-col gap-[33px]">
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

        {/* Figma: 3 × 446.9 com 6px entre as fotos e 28px entre as fileiras. */}
        <ul className={`grid grid-cols-1 gap-x-[6px] gap-y-[28px] sm:grid-cols-2 lg:grid-cols-3 ${reveal}`}>
          {photos.map((photo, i) => (
            <li key={photo.crop}>
              {image(
                LB.photos + i,
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.crop}
                  alt={prototyping.images[i] ?? ""}
                  width={894}
                  height={503}
                  loading="lazy"
                  className={s.photo}
                />,
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* 4. Projeto final + Ferramentas (node 17:3051) */}
      {/* minmax(0, …): a linha de pills sem quebra (≥ 1432px) não alarga a trilha. */}
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,669fr)_minmax(0,641fr)] lg:gap-[41px]">
        <CaseSection title={finalProject.title} size="lg" titleClassName={title.line18}>
          <Paragraphs items={finalProject.paragraphs} />
        </CaseSection>
        <CaseSection title={tools.title} size="lg" titleClassName={title.base}>
          {/* No Figma as cinco pills ocupam os 641px exatos; no Chrome a Clother sai ~3px
              mais larga por pill. Com a coluna cheia (≥ 1432px), a linha passa um pouco
              da coluna sem quebrar, como as tags do Batuco-tuco. */}
          <ul className="flex flex-wrap gap-2.5 min-[1432px]:flex-nowrap">
            {tools.items.map((tool) => (
              <li key={tool}>
                <DashedPill>{tool}</DashedPill>
              </li>
            ))}
          </ul>
        </CaseSection>
      </div>

      {/* 5. Pranchas (node 17:3079): 28px entre elas, como no Figma */}
      <div className="flex flex-col gap-7">
        {/* Card azul: arte do Figma sem os nomes + nomes vivos (node 17:3082) */}
        {frame(
          LB.showcase,
          <section className={s.showcase} aria-label={showcase.label}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${base}/vitrine/arte.webp`}
              srcSet={`${base}/vitrine/arte.webp 1352w, ${base}/vitrine/arte@2x.webp 2704w`}
              sizes="(min-width: 1432px) 1352px, (min-width: 800px) calc(100vw - 5rem), 90vw"
              alt={gallery.showcaseAlt}
              width={1352}
              height={941}
              loading="lazy"
              className={s.fill}
            />
            {/* Os nomes já estão no alt da arte. */}
            <ul className={s.showcaseNames} aria-hidden>
              {showcaseNames.map(([x, y], i) => (
                <li
                  key={i}
                  className={s.showcaseName}
                  style={{ "--x": x, "--y": y } as CSSProperties}
                >
                  {showcase.names[i]}
                </li>
              ))}
            </ul>
          </section>,
          true,
        )}

        {/* Prancha creme: quatro grupos, cada um ampliável (node 17:3247) */}
        <div className={`${s.cream} ${reveal}`}>
          {creamGroups.map((g, i) => {
            // Arquivo 1x = metade do @2x, arredondada (o srcset só aceita `w` inteiro).
            const w1 = Math.round(g.width / 2);
            const h1 = Math.round(g.height / 2);
            return (
              <div key={g.file} className={s.place} style={boxVars(g.box)}>
                {image(
                  LB.cream + i,
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${base}/prancha/${g.file}.webp`}
                    srcSet={`${base}/prancha/${g.file}.webp ${w1}w, ${base}/prancha/${g.file}@2x.webp ${g.width}w`}
                    sizes="(min-width: 1432px) 1170px, 87vw"
                    alt={creamAlts[i]}
                    width={w1}
                    height={h1}
                    loading="lazy"
                    className={s.fill}
                  />,
                )}
              </div>
            );
          })}
        </div>

        {/* Cards dos personagens: arte sem o texto + nomes e frases vivos (node 17:3989).
            Abaixo do lg os cards ficam empilhados e o bloco não abre o lightbox
            (.cardsZoom): seriam ~2800px de botão sobre texto que dá para ler. */}
        <div className={s.cardsOuter}>
          {frame(
            LB.cards,
            <section className={s.cards} aria-label={characterCards.label}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${base}/cards/arte.webp`}
                srcSet={`${base}/cards/arte.webp 1361w, ${base}/cards/arte@2x.webp 2722w`}
                sizes="(min-width: 1432px) 1361px, calc(100vw - 5rem)"
                alt=""
                aria-hidden
                width={1361}
                height={1508}
                loading="lazy"
                className={`${s.fill} ${s.cardsArt}`}
              />
              <ul className={s.cardList}>
                {cards.map((c, i) => {
                  const member = characterCards.list[i];
                  if (!member) return null;
                  const [cx, cy, cw, ch] = c.crop;
                  return (
                    <li
                      key={member.name}
                      className={s.card}
                      style={{ "--fg": c.fg, "--bg": c.bg } as CSSProperties}
                    >
                      <span
                        className={s.cardCrop}
                        style={{ "--cx": cx, "--cy": cy, "--cw": cw, "--ch": ch } as CSSProperties}
                        aria-hidden
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${base}/cards/arte.webp`}
                          srcSet={`${base}/cards/arte.webp 1361w, ${base}/cards/arte@2x.webp 2722w`}
                          sizes="(min-width: 40rem) 100vw, 200vw"
                          alt=""
                          loading="lazy"
                        />
                      </span>
                      <h3
                        className={s.cardName}
                        style={{ "--x": c.name[0], "--y": c.name[1], "--fs": c.name[2] } as CSSProperties}
                      >
                        {member.name}
                      </h3>
                      <p
                        className={s.cardText}
                        style={{ "--x": c.text[0], "--y": c.text[1], "--fs": c.text[2], "--w": c.text[3] } as CSSProperties}
                      >
                        {member.lines.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>,
            true,
            s.cardsZoom,
          )}
        </div>

        {/* Nota sobre IA (node 17:4018) */}
        <p className={`${textClass} ml-auto max-w-[445px] italic`}>{project.aiNote}</p>
      </div>
    </>
  );
}
