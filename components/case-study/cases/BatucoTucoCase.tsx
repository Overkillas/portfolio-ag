import type { CSSProperties, ReactNode } from "react";
import type { LocalizedProject } from "@/lib/projects";
import { CaseSection, DashedPill, bodyFont, bodyFontBold } from "@/components/case-study/CaseShell";
import { type Box, Paragraphs, boxVars, textClass, wideTitle, zoomHelpers } from "./wide";
import s from "./batuco.module.css";

const base = "/images/projects/batuco-tuco";
export const batucoBase = base;

/** Fotos dos esboços, na ordem de `sections.sketches` (dado, não texto). */
export const sketchFiles = [
  "esboco-personagens",
  "rabisco-home-perfil",
  "rabisco-home-atividades",
  "rabisco-entrada",
] as const;

/** Índices no lightbox (mesma ordem de `getBatucoLightbox`, em batuco/lightbox.ts). */
const LB_PROCESS = 1;
const LB_PLANNING = 2;
const LB_SKETCH = 3;
const LB_INTERFACE = 7;
const LB_CHARACTERS = 8;
const LB_FINAL = 9;

/**
 * Legenda das imagens: Clother Bold 16px. Caixa de 19px no Figma ("normal" da
 * Clother lá = 1.1875; no Chrome "normal" daria 23px).
 */
const captionClass = "font-bold text-[1rem] leading-[1.1875] text-[color:var(--color-blue)]";

const title = wideTitle;

/** Cards do diagrama com fonte menor no Figma: "etapa-item" (dado de layout, não texto). */
const smallStepItems = new Set(["2-1"]);

/** Recorte de sprite: largura, altura, left e top da <img> dentro da janela (CSS). */
type Crop = readonly [string, string, string, string];

function cropVars([iw, ih, il, it]: Crop) {
  return { "--iw": iw, "--ih": ih, "--il": il, "--it": it } as CSSProperties;
}

/** Janela sobre um sprite, com o mesmo recorte do Figma. */
function Sprite({
  src,
  crop,
  className,
  style,
  alt = "",
}: {
  src: string;
  crop: Crop;
  className?: string;
  style?: CSSProperties;
  alt?: string;
}) {
  return (
    <span className={`${s.crop} ${className ?? ""}`} style={{ ...cropVars(crop), ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} aria-hidden={alt ? undefined : true} />
    </span>
  );
}

/* ---------- Dados de layout (não traduzíveis) ---------- */

/** Fileiras do diagrama: a raposa ocupa a primeira célula. */
const diagramSlots = ["head", 0, 1, 2, 3, 4] as const;

/** Pontos de cada asset, na ordem de `interface.assets` (dado, não texto). */
const assets: {
  points: number;
  locked: boolean;
  /** Cadeado por cima do item (só nas Flores o Figma desenha o item antes). */
  lockOnTop?: boolean;
  sprite: "itens" | "acessorios";
  art: Box;
  radius?: number;
  rotate?: string;
  crop: Crop;
}[] = [
  { points: 204, locked: false, sprite: "itens", art: [10.87, 6.73, 107.67, 113.05], radius: 24.44, crop: ["323.27%", "543.94%", "-185.56%", "-225.28%"] },
  { points: 800, locked: true, sprite: "itens", art: [6.73, -1.35, 110.82, 117.09], radius: 14.49, crop: ["302.54%", "509.07%", "-29.65%", "-145.43%"] },
  { points: 506, locked: true, sprite: "itens", art: [0.55, 4.33, 119.21, 125.77], radius: 13.26, rotate: "4.33deg", crop: ["302.54%", "509.07%", "-44.87%", "-222.28%"] },
  { points: 300, locked: false, sprite: "acessorios", art: [8.15, 2.86, 126, 110], crop: ["604.96%", "1231.91%", "-138.13%", "-741.1%"] },
  { points: 204, locked: true, lockOnTop: true, sprite: "acessorios", art: [12.12, 16.15, 109.35, 86.13], crop: ["544.59%", "1229.1%", "-250.36%", "-712.06%"] },
  { points: 110, locked: true, sprite: "acessorios", art: [18.85, 14.81, 102.52, 80.75], crop: ["544.59%", "1229.1%", "-246.79%", "-834.45%"] },
];

const spriteSrc = {
  itens: `${base}/interface/itens.png`,
  acessorios: `${base}/acessorios.png`,
};

/** Hanni, Cybele e Pepo na faixa da Interface (node 17:2790–2792). */
const showcaseCast: { src: string; box: Box; crop: Crop; rotate?: string }[] = [
  { src: "hanni", box: [771.68, 473.61, 253.474, 278.118], crop: ["107.87%", "174.78%", "-5.56%", "-29.58%"] },
  { src: "cybele", box: [961.37, 471.55, 204.216, 264.535], crop: ["100%", "137.24%", "0", "-13.72%"], rotate: "2.52deg" },
  { src: "pepo", box: [1118.24, 467.19, 220.858, 273.526], crop: ["121.48%", "174.39%", "-10.35%", "-37.97%"] },
];

/** Personagens, na ordem de `characters.list` (Yopi, Pepo, Hanni, Cybele, Gunter). */
const cast: { src: string; art: Box; crop: Crop; contour: Box; text: readonly [number, number]; rotated?: boolean }[] = [
  { src: "yopi", art: [-10.7, 56.62, 382.314, 326.559], crop: ["100%", "208.13%", "0", "-56.54%"], contour: [16.04, 24.6, 697.392, 377.576], text: [349.76, 65.41] },
  { src: "pepo", art: [1026.84, 42.78, 284.582, 352.446], crop: ["121.48%", "174.39%", "-10.35%", "-37.97%"], contour: [736.97, 28.88, 587.221, 379.715], text: [774.41, 64.18] },
  { src: "hanni", art: [379.67, 262.8, 326.609, 358.362], crop: ["107.87%", "174.78%", "-5.56%", "-29.58%"], contour: [402.18, 286.66, 554.063, 316.608], text: [658.89, 421.43] },
  { src: "cybele", art: [43.03, 464.88, 263.137, 340.86], crop: ["100%", "137.24%", "0", "-13.72%"], contour: [11.77, 417.15, 709.158, 419.291], text: [297.01, 654.97], rotated: true },
  { src: "gunter", art: [927.24, 459.94, 424.279, 369.673], crop: ["100%", "204.04%", "0", "-53.45%"], contour: [749.8, 429.99, 582.943, 410.734], text: [822.31, 654.97] },
];

/**
 * Corpo do case (tudo entre `<CaseShell>` e `</CaseShell>`), reutilizado pela página e pelo modal.
 *
 * `zoom` (só a página completa passa): aria-label de cada item do lightbox ("Ampliar: …").
 * Com ele, imagens e blocos viram gatilhos com zoom no hover e os blocos ganham o reveal
 * ao rolar. Sem ele (modal), o HTML é exatamente o de antes.
 */
export function BatucoTucoCase({
  project,
  zoom,
}: {
  project: LocalizedProject;
  zoom?: readonly string[];
}) {
  // As chaves abaixo só existem no Batuco-tuco; isso também estreita o tipo.
  if (!("footnote" in project)) return null;

  const { creationProcess: cp, sketches, prototyping, interface: ui, characters, brand, finalProject, tools } =
    project.sections;
  const steps = cp.diagram.steps;
  const tucoLetters = Array.from(brand.logoBottom);

  const { frame, image, reveal } = zoomHelpers(zoom);

  return (
    <>
      {/* 1. Título, tags e intro + diagrama do processo (node 17:2524) */}
      <section className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_658px] xl:gap-[41px]">
        <div className="flex min-w-0 flex-col gap-6">
          <h1
            className={`text-[1.75rem] text-[color:var(--color-blue)] md:text-[2rem] ${title.box30}`}
            style={bodyFontBold}
          >
            {project.subtitle}
          </h1>
          {/* Como no Figma, com a coluna nos 653px (viewport ≥ 1432px) a linha de tags (660px) passa um pouco dela sem quebrar. */}
          <ul className="flex flex-wrap gap-2 min-[1432px]:flex-nowrap">
            {project.tags.map((tag) => (
              <li key={tag}>
                <DashedPill>{tag}</DashedPill>
              </li>
            ))}
          </ul>
          <Paragraphs items={project.intro.split("\n\n")} />
        </div>

        {frame(LB_PROCESS, <ol className={s.diagram} aria-label={cp.diagram.label}>
          {diagramSlots.map((slot) =>
            slot === "head" ? (
              <li key="head" className={s.diagramHead} aria-hidden>
                <Sprite
                  src={`${base}/raposa-cabeca.png`}
                  crop={["186.53%", "395.88%", "-39.9%", "-87.01%"]}
                  style={{ position: "absolute", left: 0, top: 0, width: 181.874, height: 152.347 }}
                />
                <Sprite
                  src={`${base}/acessorios.png`}
                  crop={["544.59%", "1229.1%", "-114.68%", "-739.26%"]}
                  style={{ position: "absolute", left: 142.06, top: 103.3, width: 57.865, height: 45.579, rotate: "34.16deg" }}
                />
              </li>
            ) : (
              <li key={slot}>
                <p className={s.stepTitle}>
                  <span className={`${s.stepNum} ${s.futurismo}`} aria-hidden>
                    {String(slot + 1).padStart(2, "0")}
                  </span>
                  <span className={s.stepLabel}>{steps[slot].label}</span>
                </p>
                <ul className={s.stepItems}>
                  {steps[slot].items.map((item, i) => (
                    <li
                      key={item}
                      className={`${s.stepItem} ${smallStepItems.has(`${slot}-${i}`) ? s.stepItemSmall : ""}`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ),
          )}
        </ol>, false, "xl:self-start")}
      </section>

      {/* 2. Painéis de planejamento + Processo de criação (node 17:2639) */}
      <div className="grid items-start gap-8 lg:grid-cols-[665fr_660fr] lg:gap-[25px]">
        <figure className={`flex flex-col gap-2.5 ${reveal}`}>
          {image(
            LB_PLANNING,
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${base}/paineis-planejamento.png`}
              alt={cp.images[0] ?? ""}
              width={1745}
              height={1031}
              className="block aspect-[1745/1031] w-full"
            />,
          )}
          <figcaption className={captionClass} style={bodyFont}>
            {cp.planningCaption}
          </figcaption>
        </figure>
        <CaseSection title={cp.title} size="lg" titleClassName={title.box30}>
          <Paragraphs items={cp.paragraphs} />
        </CaseSection>
      </div>

      {/* 3. Esboços e rabiscoframes + Prototipagem (node 17:2648) */}
      <div className="flex flex-col gap-[33px]">
        <ul className={`grid grid-cols-1 gap-x-[7.4px] gap-y-6 sm:grid-cols-2 lg:grid-cols-4 ${reveal}`}>
          {sketches.map((sketch, i) => (
            <li key={sketch.caption}>
              <figure className="flex flex-col gap-[7.6px]">
                {/* O Figma estica cada foto até a caixa de ~333 × 309 (sem recorte). */}
                {image(
                  LB_SKETCH + i,
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${base}/${sketchFiles[i]}.png`}
                    alt={sketch.alt}
                    className="block aspect-[333/309] w-full object-fill"
                  />,
                )}
                <figcaption className={captionClass} style={bodyFont}>
                  {sketch.caption}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

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
      </div>

      {/* 4. Projeto final + Ferramentas (node 17:2684) */}
      <div className="grid items-start gap-8 lg:grid-cols-[669fr_641fr] lg:gap-[41px]">
        <CaseSection title={finalProject.title} size="lg" titleClassName={title.line18}>
          <Paragraphs items={finalProject.paragraphs} />
          <p className={`${textClass} mt-[18px] italic`}>{finalProject.fontsNote}</p>
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

      {/* 5. Apresentação: Interface/Assets, Personagens e Marca (node 17:2704) */}
      <div className="flex flex-col gap-7">
        {frame(LB_INTERFACE, <section className={s.showcase} aria-labelledby="batuco-interface">
          <div className={s.showcaseIntro}>
            <h2 id="batuco-interface" className={`${s.showcaseTitle} ${s.futurismo}`}>
              {ui.title}
            </h2>
            <p className={s.showcaseText}>
              {ui.textBefore}
              <strong>{ui.bold1}</strong>
              {ui.textMid}
              <strong>{ui.bold2}</strong>
              {ui.textAfter}
            </p>
            <div className={s.showcaseCast} role="img" aria-label={ui.charactersAlt}>
              {showcaseCast.map((c) => (
                <Sprite
                  key={c.src}
                  src={`${base}/personagens/${c.src}.png`}
                  crop={c.crop}
                  className={s.layer}
                  style={boxVars(c.box, c.rotate ? { rotate: c.rotate } : undefined)}
                />
              ))}
            </div>
          </div>

          <ul className={s.screens}>
            {prototyping.images.map((alt, i) => (
              <li key={alt}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${base}/interface/tela-${i + 1}.png`}
                  alt={alt}
                  width={1295}
                  height={1257}
                  className={s.screen}
                />
              </li>
            ))}
          </ul>

          <div className={s.assetsBlock}>
            <h3 className={`${s.showcaseTitle} ${s.assetsTitle} ${s.futurismo}`}>{ui.assetsTitle}</h3>
            <ul className={s.assets}>
              {assets.map((a, i) => {
                const art = (
                  <Sprite
                    src={spriteSrc[a.sprite]}
                    crop={a.crop}
                    className={s.assetArt}
                    style={boxVars(a.art, {
                      ...(a.radius ? { "--r": a.radius } : {}),
                      ...(a.rotate ? { "--rot": a.rotate } : {}),
                    })}
                  />
                );
                const lock = a.locked ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`${base}/interface/cadeado.svg`} alt={ui.lockedLabel} className={s.lock} />
                ) : null;
                return (
                  <li key={ui.assets[i]} className={s.asset}>
                    <span className={s.assetName}>{ui.assets[i]}</span>
                    <span className={s.assetPrice}>
                      {ui.pointsLabel.replace("{points}", String(a.points))}
                    </span>
                    <span className={s.assetFrame} aria-hidden />
                    {a.lockOnTop ? (
                      <>
                        {art}
                        {lock}
                      </>
                    ) : (
                      <>
                        {lock}
                        {art}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>, true)}

        {frame(LB_CHARACTERS, <section className={s.castWrap} aria-label={characters.label}>
          <ul className={s.cast}>
            {cast.map((c, i) => {
              const member = characters.list[i];
              return (
                <li key={member.name} className={s.member}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${base}/personagens/contorno-${c.src}.svg`}
                    alt=""
                    aria-hidden
                    className={s.contour}
                    style={boxVars(c.contour)}
                  />
                  <Sprite
                    src={`${base}/personagens/${c.src}.png`}
                    crop={c.crop}
                    className={`${s.memberArt} ${c.rotated ? s.rotated : ""}`}
                    style={boxVars(c.art, { "--ar": `${c.art[2]} / ${c.art[3]}` })}
                  />
                  <div className={s.memberText} style={boxVars([c.text[0], c.text[1], 0, 0])}>
                    <h3 className={s.memberName}>{member.name}</h3>
                    <p className={s.memberRole}>{member.role}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>, true)}

        {frame(LB_FINAL, <section className={s.brand} aria-labelledby="batuco-brand">
          <div className={s.brandBand}>
            <p className={`${s.logo} ${s.futurismo}`} role="img" aria-label={brand.logoLabel}>
              <span className={s.logoTop} aria-hidden>
                {brand.logoTop}
              </span>
              <span className={s.logoBottom} aria-hidden>
                {tucoLetters.flatMap((letter, i) => {
                  const nodes: ReactNode[] = [<span key={`l${i}`}>{letter}</span>];
                  if (i < tucoLetters.length - 1) {
                    nodes.push(
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={`s${i}`} src={`${base}/estrela-logo.svg`} alt="" className={s.logoStar} />,
                    );
                  }
                  return nodes;
                })}
              </span>
            </p>
            <p className={s.tagline}>
              {brand.taglineLine1}
              <br />
              {brand.taglineBefore}
              <strong>{brand.taglineBold}</strong>
              {brand.taglineAfter}
            </p>
          </div>
          <div className={s.brandBody}>
            <h2 id="batuco-brand" className={s.brandHeading}>
              {brand.heading}
            </h2>
            <ul className={s.brandPills}>
              {brand.pills.map((pill) => (
                <li key={pill} className={s.brandPill}>
                  {pill}
                </li>
              ))}
            </ul>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${base}/iphone-15-pro.png`}
              alt={brand.mockupAlt}
              width={1500}
              height={1125}
              className={s.brandPhones}
            />
          </div>
        </section>, true)}

        {/* Nota sobre IA (node 17:2841) */}
        <p className={`${textClass} ml-auto max-w-[445px] italic`}>{project.footnote}</p>
      </div>
    </>
  );
}
