import type { CSSProperties, ReactNode } from "react";
import { isProject, type LocalizedProject, type ProjectOf } from "@/lib/projects";
import { CaseSection, DashedPill, bodyFontBold } from "@/components/case-study/CaseShell";
import { Paragraphs, textClass, wideTitle as title, zoomHelpers } from "./wide";
import s from "./identidade.module.css";

const base = "/images/projects/identidade-evento-15-anos";

/** Case com os textos do dicionário (o tipo de `projects.identidadeEvento15Anos`). */
export type IdentidadeEventoProject = LocalizedProject & ProjectOf<"identidade-evento-15-anos">;

export function isIdentidadeEventoProject(project: LocalizedProject): project is IdentidadeEventoProject {
  return isProject(project, "identidade-evento-15-anos");
}

/* ---------- Dados de layout (não traduzíveis) ----------
   Cada imagem é o export do nó do Figma (frame 17:4752) em 2x, com a caixa do
   Figma (w × h em px) e a largura do arquivo 2x. O arquivo 1x é a metade.
   Estas listas mandam na página e no lightbox; o dicionário só dá o texto de
   cada item pelo índice. */

export type EventoImage = { file: string; w: number; h: number; px2: number };

const img = (file: string, w: number, h: number, px2: number): EventoImage => ({ file, w, h, px2 });

export const eventoImages = {
  /** Hero (17:4857): frame branco 1354 × 674 com a arte final. */
  hero: img("hero", 1354, 674, 2708),
  /** Painéis de referências - Versão 1 (17:4897) e 2 (17:4907), cada colagem achatada. */
  panels: [img("painel-1", 673.01, 487.36, 1347), img("painel-2", 673.01, 487.36, 1347)],
  /** Miniaturas de Prototipagem (17:4951, 4954, 4957, 4960, 4963). */
  thumbs: [1, 2, 3, 4, 5].map((n) => img(`proto-${n}`, 261.975, 358.464, 524)),
  /** Desenvolvimento da identidade final para o convite (17:4969..4972). */
  invitation: [
    img("convite-1", 337.662, 450.216, 676),
    img("convite-2", 328.865, 449.99, 658),
    img("convite-3", 328.865, 449.99, 658),
    img("convite-4", 328.865, 449.99, 658),
  ],
  /** Banners (17:5003, 17:5004 empilhados | 17:5005). */
  banners: [
    img("banner-1", 674.93, 168.732, 1350),
    img("banner-2", 674.93, 168.732, 1350),
    img("banner-3", 679.149, 339.575, 1359),
  ],
  /** Arte para painel de Led (17:5010, 17:5011). */
  led: [img("led-1", 674.93, 337.465, 1350), img("led-2", 674.93, 337.465, 1350)],
  /** Menu (17:5016, 17:5017), tags de sandálias (17:5020..5022), adesivo (17:5024) e tag (17:5025). */
  menuTags: [
    img("menu-1", 357.029, 728.338, 715),
    img("menu-2", 357.174, 728.338, 715),
    img("tag-1", 200.429, 343.853, 401),
    img("tag-2", 200.429, 343.853, 401),
    img("tag-3", 200.429, 343.853, 401),
    img("adesivo", 274.112, 376.601, 549),
    img("tag-bem-vividos", 235.906, 236.21, 472),
  ],
  /** Aplicações no evento: duas fileiras de três fotos (17:5031..5033 | 17:5035..5037). */
  event: [
    img("evento-1", 445.637, 594.182, 892),
    img("evento-2", 445.637, 594.182, 892),
    img("evento-3", 445.637, 594.182, 892),
    img("evento-4", 445.637, 594.182, 892),
    img("evento-5", 445.575, 594.1, 892),
    img("evento-6", 445.575, 594.1, 892),
  ],
} as const;

/** Índices no lightbox (mesma ordem de `getIdentidadeEventoLightbox`). */
export const LB = (() => {
  const panels = 1;
  const thumbs = panels + eventoImages.panels.length;
  const invitation = thumbs + eventoImages.thumbs.length;
  const banners = invitation + eventoImages.invitation.length;
  const led = banners + eventoImages.banners.length;
  const menuTags = led + eventoImages.led.length;
  const event = menuTags + eventoImages.menuTags.length;
  return { hero: 0, panels, thumbs, invitation, banners, led, menuTags, event };
})();

/** Caminhos 1x/2x de uma imagem (srcSet com a largura real de cada arquivo). */
export function eventoSrc(image: EventoImage) {
  const w1 = Math.round(image.px2 / 2);
  return {
    src: `${base}/${image.file}.webp`,
    src2x: `${base}/${image.file}@2x.webp`,
    srcSet: `${base}/${image.file}.webp ${w1}w, ${base}/${image.file}@2x.webp ${image.px2}w`,
  };
}

/** `sizes` para uma imagem que ocupa `w` px de 1354 na coluna do case. */
const sizesFor = (w: number, sm = "92vw") =>
  `(min-width: 1434px) ${Math.round(w)}px, (min-width: 48rem) ${((w / 1354) * 100).toFixed(1)}vw, ${sm}`;

/** Imagem de uma caixa do Figma: proporção do Figma e recorte `cover`. */
function Pic({ image, alt, sm }: { image: EventoImage; alt: string; sm?: string }) {
  const { src, srcSet } = eventoSrc(image);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizesFor(image.w, sm)}
      alt={alt}
      width={Math.round(image.w)}
      height={Math.round(image.h)}
      loading="lazy"
      decoding="async"
      className={s.pic}
      style={{ "--ar": `${image.w} / ${image.h}` } as CSSProperties}
    />
  );
}

/** Pesos de uma fileira flex = larguras do Figma. */
const grow = (w: number) => ({ "--grow": w }) as CSSProperties;

/** Capa do case (17:4857): export 1x/2x do Figma. */
export function IdentidadeEventoHero({ project }: { project: LocalizedProject }) {
  const alt = isIdentidadeEventoProject(project) ? project.heroAlt : project.title;
  const { src, srcSet } = eventoSrc(eventoImages.hero);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes="(min-width: 1434px) 1354px, (min-width: 800px) calc(100vw - 5rem), 90vw"
      width={1354}
      height={674}
      alt={alt}
      className={s.hero}
    />
  );
}

/**
 * Pills tracejadas. `fullRow`: com a coluna cheia (≥ 1434px) a linha não quebra.
 * As ferramentas somam 680px numa caixa de 641 no Figma e passam por cima da sobra
 * à direita; quebrando, a coluna cresceria e o título da esquerda (17:4975) desceria.
 */
function Pills({ items, gap, fullRow }: { items: string[]; gap: string; fullRow?: boolean }) {
  return (
    <ul className={`flex flex-wrap ${gap} ${fullRow ? "min-[1434px]:flex-nowrap" : ""}`}>
      {items.map((item) => (
        <li key={item}>
          <DashedPill>{item}</DashedPill>
        </li>
      ))}
    </ul>
  );
}

/**
 * Corpo do case "Identidade de evento: 15 anos" (Figma 17:4752), reutilizado pela
 * página e pelo modal.
 *
 * `zoom` (só a página completa passa): aria-label de cada item do lightbox. Com
 * ele as imagens viram gatilhos com zoom no hover e os blocos ganham o reveal ao
 * rolar, como nos outros cases 'wide'.
 */
export function IdentidadeEventoCase({ project, zoom }: { project: LocalizedProject; zoom?: readonly string[] }) {
  if (!isIdentidadeEventoProject(project)) return null;

  const { creationProcess: cp, prototyping: proto, finalProject: fp } = project.sections;
  const { image, reveal } = zoomHelpers(zoom);
  const zoomed = (index: number, node: ReactNode) => image(index, node);
  const im = eventoImages;

  return (
    <div className={s.body}>
      {/* 1. Cabeçalho (17:4861): título, tags e intro, a 24px um do outro */}
      <section className="flex flex-col gap-6">
        <h1
          className={`text-[1.75rem] text-[color:var(--color-blue)] md:text-[2rem] ${title.box30}`}
          style={bodyFontBold}
        >
          {project.subtitle}
        </h1>
        <Pills items={project.tags} gap="gap-2" />
        <Paragraphs items={project.intro.split("\n\n")} />
      </section>

      {/* 2. Processo de criação (17:4892), 1352 de largura */}
      <CaseSection title={cp.title} size="lg" titleClassName={title.box30} className={s.w1352}>
        <Paragraphs items={cp.paragraphs} />
      </CaseSection>

      {/* 3. Painéis de referências (17:4895): 673.01 | 8 | 673.01 */}
      <div className={`${s.row} ${s.gap8} ${reveal}`}>
        {im.panels.map((panel, i) => (
          <figure key={panel.file} className={s.fig} style={grow(panel.w)}>
            {zoomed(LB.panels + i, <Pic image={panel} alt={cp.images[i] ?? ""} />)}
            <figcaption className={s.capBold}>{cp.captions[i]}</figcaption>
          </figure>
        ))}
      </div>

      {/* 4. Prototipagem (17:4919): 1350, 2px para dentro; o parágrafo tem uma quebra de linha */}
      <CaseSection title={proto.title} size="lg" titleClassName={title.base} className={s.w1350}>
        <div className="mb-6">
          <Pills items={proto.tabs} gap="gap-2.5" />
        </div>
        <p className={textClass}>
          {proto.paragraphs.map((p, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {p}
            </span>
          ))}
        </p>
      </CaseSection>

      {/* 5. Miniaturas (17:4949): 5 × 261.975, vão 11 */}
      <div className={`${s.row} ${s.sm2} ${s.gap11} ${reveal}`}>
        {im.thumbs.map((thumb, i) => (
          <figure key={thumb.file} className={s.fig} style={grow(thumb.w)}>
            {zoomed(LB.thumbs + i, <Pic image={thumb} alt={proto.images[i] ?? ""} sm="46vw" />)}
            <figcaption className={s.capThumb}>{proto.thumbs.captions[i]}</figcaption>
          </figure>
        ))}
      </div>

      {/* 6. Desenvolvimento da identidade final para o convite (17:4965) */}
      <figure className={`${s.block} ${s.invite} ${reveal}`}>
        <figcaption className={s.label}>{proto.invitation.label}</figcaption>
        <div className={`${s.row} ${s.sm2} ${s.gap8}`}>
          {im.invitation.map((inv, i) => (
            <div key={inv.file} className={s.cell} style={grow(inv.w)}>
              {zoomed(LB.invitation + i, <Pic image={inv} alt={proto.invitation.images[i] ?? ""} sm="46vw" />)}
            </div>
          ))}
        </div>
      </figure>

      {/* 7. Projeto final 572 | 98 | Ferramentas utilizadas 641 (17:4973) */}
      <div className={s.two}>
        <CaseSection title={fp.title} size="lg" titleClassName={title.line18}>
          <Paragraphs items={fp.paragraphs} />
        </CaseSection>
        <CaseSection title={fp.toolsTitle} size="lg" titleClassName={title.base}>
          <Pills items={fp.tools} gap="gap-2.5" fullRow />
        </CaseSection>
      </div>

      {/* 8. Banners (17:5001): dois empilhados (674.93) | 4.141 | 679.15 */}
      <div className={`${s.row} ${s.gap4} ${s.banners} ${reveal}`}>
        <div className={`${s.cell} ${s.stack}`} style={grow(674.93)}>
          {im.banners.slice(0, 2).map((banner, i) => (
            <div key={banner.file}>{zoomed(LB.banners + i, <Pic image={banner} alt={fp.images[i] ?? ""} />)}</div>
          ))}
        </div>
        <div className={s.cell} style={grow(im.banners[2].w)}>
          {zoomed(LB.banners + 2, <Pic image={im.banners[2]} alt={fp.images[2] ?? ""} />)}
        </div>
      </div>

      {/* 9. Arte para painel de Led (17:5006): 2 × 674.93, vão 4.141 */}
      <figure className={`${s.block} ${reveal}`}>
        <figcaption className={s.label}>{fp.ledPanel.label}</figcaption>
        <div className={`${s.row} ${s.gap4}`}>
          {im.led.map((led, i) => (
            <div key={led.file} className={s.cell} style={grow(led.w)}>
              {zoomed(LB.led + i, <Pic image={led} alt={fp.ledPanel.images[i] ?? ""} />)}
            </div>
          ))}
        </div>
      </figure>

      {/* 10. Menu, tags e adesivos (17:5012) + Aplicações no evento (17:5026), 8px abaixo */}
      <div className={s.block}>
        <figure className={`${s.block} ${reveal}`}>
          <figcaption className={s.label}>{fp.menuTags.label}</figcaption>
          <div className={s.menuRow}>
            <div className={s.menus} style={grow(724.815)}>
              {im.menuTags.slice(0, 2).map((menu, i) => (
                <div key={menu.file} style={grow(menu.w)}>
                  {zoomed(LB.menuTags + i, <Pic image={menu} alt={fp.menuTags.images[i] ?? ""} sm="46vw" />)}
                </div>
              ))}
            </div>
            <div className={s.tagsCol} style={grow(618.269)}>
              <div className={s.tags}>
                {im.menuTags.slice(2, 5).map((tag, i) => (
                  <div key={tag.file}>
                    {zoomed(LB.menuTags + 2 + i, <Pic image={tag} alt={fp.menuTags.images[2 + i] ?? ""} sm="30vw" />)}
                  </div>
                ))}
              </div>
              <div className={s.stickers}>
                {im.menuTags.slice(5).map((sticker, i) => (
                  <div key={sticker.file} style={grow(sticker.w)}>
                    {zoomed(
                      LB.menuTags + 5 + i,
                      <Pic image={sticker} alt={fp.menuTags.images[5 + i] ?? ""} sm="46vw" />,
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </figure>

        <figure className={`${s.block} ${s.event} ${reveal}`}>
          <figcaption className={s.label}>{fp.event.label}</figcaption>
          <div className={s.eventGrid}>
            {im.event.map((photo, i) => (
              <div key={photo.file} className={s.cell}>
                {zoomed(LB.event + i, <Pic image={photo} alt={fp.event.images[i] ?? ""} sm="46vw" />)}
              </div>
            ))}
          </div>
        </figure>
      </div>

      {/* 11. Nota sobre IA (17:5038), 32px acima do balão de agradecimento */}
      <p className={`${textClass} ${s.note} italic`}>{fp.aiNote}</p>
    </div>
  );
}
