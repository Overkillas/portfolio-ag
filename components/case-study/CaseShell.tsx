import type { CSSProperties, ReactNode } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { LocalizedProject, ProjectStatus } from "@/lib/projects";

// 'em-progresso' (slug, kebab) → 'emProgresso' (chave do dicionário, camelCase)
const statusKey: Record<ProjectStatus, keyof Dictionary["status"]> = {
  concluido: "concluido",
  "em-progresso": "emProgresso",
  "em-breve": "emBreve",
};

/** Fonte do corpo (Clother) — sobrescreve a regra global que joga h1-h4 pra display. */
export const bodyFont = { fontFamily: "var(--font-body)" } as const;
/**
 * Clother Bold nos títulos dos cases 'wide'. Inline pelo mesmo motivo do
 * bodyFont: a regra global de h1–h4 (peso 400) não fica em layer e ganha do
 * utilitário `font-bold`.
 */
export const bodyFontBold = { ...bodyFont, fontWeight: 700 } as const;

/**
 * Pill do Figma. tag = Azul gelo (#bacceb), sem sombra.
 * status = azul clarinho (#e6eefa) + sombra "botoes" (2,4,8,2 @16%).
 */
function Pill({
  children,
  variant = "tag",
}: {
  children: ReactNode;
  variant?: "tag" | "status";
}) {
  // font-normal: Figma usa Clother Regular (400) nas pills; o peso global é 300.
  const base =
    "inline-flex items-center rounded-full px-3.5 py-1 text-[1rem] font-normal leading-none text-[color:var(--color-blue)] whitespace-nowrap";
  const skin =
    variant === "status"
      ? "bg-[color:var(--color-blue-pale)] shadow-[2px_4px_8px_2px_rgba(111,150,206,0.16)]"
      : "bg-[color:var(--color-blue-soft)]";
  return <span className={`${base} ${skin}`}>{children}</span>;
}

/**
 * Pill tracejada do Figma novo (cases com layout 'wide'): casca Azul gelo
 * (#bacceb) com 4px de respiro + miolo #eaeef4 com borda 2px tracejada #527fb0.
 * Clother Regular 16px. Usada nas tags, abas de Prototipagem e Ferramentas.
 */
export function DashedPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-[color:var(--color-blue-soft)] p-1">
      <span className="inline-flex h-6 items-center whitespace-nowrap rounded-full border-2 border-dashed border-[#527fb0] bg-[#eaeef4] px-1.5 text-[1rem] font-normal leading-none text-[color:var(--color-blue)]">
        {children}
      </span>
    </span>
  );
}

/** Balão rosa do Figma novo: fundo #ffe9f2, rabinho no canto inferior direito, sombra interna rosa. */
const bubbleSkin =
  "flex h-[98px] items-center justify-center rounded-[60px_60px_0_60px] bg-[#ffe9f2] pl-5 pr-6 text-center text-[0.875rem] font-normal leading-[1.1875] text-[color:var(--color-blue-darkest)] shadow-[inset_-3px_-4px_9.5px_1px_#f4aecc]";

/**
 * Balão + avatar da Ágatha do Figma novo. O avatar é PNG @2x exportado do Figma
 * já girado (10.99°), na caixa de 138.74 × 132.09 do Figma: o SVG tinha grão
 * (feTurbulence), que o Chrome desenha bem mais grosso que o Figma.
 *
 * - `size="md"` (padrão): agradecimento dos cases 'wide' (node 17:2842, 160 × 98),
 *   alinhado à direita, 28px abaixo do corpo.
 * - `size="sm"`: balão do topo da página de Estudos (node 17:2282, 104 × 98,
 *   padding 32/24/26/20). O texto ocupa 73px, mais que os 60 de miolo: fica
 *   centrado e transborda igual para os dois lados, como no Figma. O wrapper fica
 *   por conta de quem chama (`className`).
 */
export function ThanksBubble({
  text,
  size = "md",
  className,
  bubbleClassName,
  faceClassName,
}: {
  text: string;
  size?: "md" | "sm";
  className?: string;
  /** Animações da página completa (balão que "estoura", bonequinha balançando). */
  bubbleClassName?: string;
  faceClassName?: string;
}) {
  const wrapper = size === "sm" ? "flex items-center gap-2" : "mt-7 flex items-center justify-end gap-2";
  return (
    <div className={withMotion(wrapper, className)}>
      {size === "sm" ? (
        <p className={withMotion(`${bubbleSkin} w-[104px] shrink-0 overflow-hidden`, bubbleClassName)} style={bodyFont}>
          <span className="w-[73px] shrink-0">{text}</span>
        </p>
      ) : (
        <p className={withMotion(`${bubbleSkin} w-[160px]`, bubbleClassName)} style={bodyFont}>
          {text}
        </p>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/avatar-agatha.png"
        alt=""
        aria-hidden
        width={139}
        height={132}
        className={withMotion("h-auto w-[138.74px] shrink-0", faceClassName)}
      />
    </div>
  );
}

/** Acrescenta classes de animação; sem elas devolve `base` intacto (mesmo HTML de antes). */
function withMotion(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}

/**
 * Proporção das duas colunas do topo quando há `aside`, em px do frame do Figma
 * (coluna do cabeçalho | coluna do aside | vão entre elas). Ex.: Pontos sem nó
 * 660 | 588 | 104; Caju 688 | 631 | 32.
 */
export type CaseAsideLayout = { main: number; aside: number; gap: number };

export function CaseShell({
  project,
  dict,
  cover,
  motion,
  aside,
  asideLayout = { main: 660, aside: 588, gap: 104 },
  headerExtra,
  top,
  bottom,
  thanksMotion,
  children,
}: {
  project: LocalizedProject;
  dict: Dictionary;
  cover?: ReactNode;
  /** Classes de animação de entrada (usadas pelo modal): capa, cabeçalho e corpo. */
  motion?: { cover: string; header: string; body: string };
  /**
   * Coluna à direita do cabeçalho (título, tags, intro), como nos frames em que
   * o topo do case é dividido em dois. Sem `aside` o cabeçalho ocupa a largura toda.
   * Ignorado no layout 'wide' (o corpo desenha o próprio cabeçalho).
   */
  aside?: ReactNode;
  asideLayout?: CaseAsideLayout;
  /** Conteúdo extra na coluna do cabeçalho, logo abaixo da intro. */
  headerExtra?: ReactNode;
  /**
   * Só no layout 'wide': conteúdo acima da capa e depois do balão de
   * agradecimento, dentro da coluna de 1352px. A página completa passa a barra
   * de voltar e o "Talvez você goste..."; o modal não passa (tem controles próprios).
   */
  top?: ReactNode;
  bottom?: ReactNode;
  /** Só no layout 'wide' da página completa: animações do balão e da bonequinha. */
  thanksMotion?: { bubble: string; face: string };
  children: ReactNode;
}) {
  const intro = project.intro ?? project.description;

  // Layout 'wide' (Figma novo, coluna de 1352px): o corpo do case desenha o
  // próprio cabeçalho (título, tags e intro ficam ao lado do diagrama), então
  // aqui só entram a capa, o corpo e o balão de agradecimento.
  if (project.layout === "wide") {
    return (
      // Com a barra do topo (página completa, sem header): ela fica em y=40, como no Figma.
      <article className={top ? "container-wide pb-12 pt-10" : "container-wide py-12"}>
        <div className="mx-auto max-w-[1352px]">
          {top}
          {cover ? (
            <div className={motion?.cover}>{cover}</div>
          ) : (
            project.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.coverImage}
                alt={dict.projects.coverAlt.replace("{title}", project.title)}
                className={withMotion("block w-full", motion?.cover)}
              />
            )
          )}

          {/* Figma: hero de 467 e corpo em y=500 (33px); seções a cada 32px. */}
          <div className={withMotion("mt-[33px] flex flex-col gap-8", motion?.body)}>
            {children}
          </div>

          <ThanksBubble
            text={project.thanks}
            className={motion?.body}
            bubbleClassName={thanksMotion?.bubble}
            faceClassName={thanksMotion?.face}
          />
          {bottom}
        </div>
      </article>
    );
  }

  const header = (
    <>
      {/* Subtítulo (Clother Bold 26px) + status */}
      <div
        className={withMotion(
          "mt-8 flex items-center justify-between gap-3",
          motion?.header,
        )}
      >
        <h1
          className="font-bold text-[1.625rem] leading-tight text-[color:var(--color-blue)]"
          style={bodyFont}
        >
          {project.subtitle}
        </h1>
        <Pill variant="status">{dict.status[statusKey[project.status]]}</Pill>
      </div>

      {/* Tags (esquerda) + data (direita) */}
      <div
        className={withMotion(
          "mt-3 flex flex-wrap items-center gap-2",
          motion?.header,
        )}
      >
        {project.tags.map((tag) => (
          <Pill key={tag}>{tag}</Pill>
        ))}
        {project.date && (
          <span className="ml-auto">
            <Pill>{project.date}</Pill>
          </span>
        )}
      </div>

      {/* Intro — Clother Light 16px, parágrafos preservando as quebras do Figma */}
      {intro && (
        <div
          className={withMotion(
            "mt-6 flex flex-col gap-4 font-light text-[1rem] leading-relaxed text-[color:var(--color-blue)]",
            motion?.header,
          )}
        >
          {intro.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      {headerExtra && (
        <div className={withMotion("mt-8", motion?.header)}>{headerExtra}</div>
      )}
    </>
  );

  return (
    <article className="container-case pt-16 pb-12">
      {/* Coluna do Figma (`.container-case`): 66px entre o header e a capa,
          32px entre os blocos. */}
      {cover ??
        (project.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.coverImage}
            alt={dict.projects.coverAlt.replace("{title}", project.title)}
            className={withMotion("shadow-card block w-full rounded-[8px]", motion?.cover)}
          />
        ))}

      {aside ? (
        // Duas colunas a partir de md; o vão é proporcional à coluna do Figma (1352px).
        <div
          className="grid grid-cols-1 gap-y-8 md:items-start md:gap-y-0 md:[grid-template-columns:var(--case-cols)] md:[column-gap:var(--case-gap)]"
          style={
            {
              "--case-cols": `minmax(0, ${asideLayout.main}fr) minmax(0, ${asideLayout.aside}fr)`,
              "--case-gap": `${((asideLayout.gap / 1352) * 100).toFixed(3)}%`,
            } as CSSProperties
          }
        >
          <div>{header}</div>
          <div className={withMotion("md:mt-8", motion?.header)}>{aside}</div>
        </div>
      ) : (
        header
      )}

      <div className={withMotion("mt-8 flex flex-col gap-8", motion?.body)}>
        {children}
      </div>

      {/* Figma: Clother Regular (400); o peso global é 300, fixo o 400. */}
      <p
        className={withMotion(
          "mt-16 font-normal text-[2rem] leading-tight text-[color:var(--color-blue)]",
          motion?.body,
        )}
        style={{ fontFamily: "var(--font-body)" }}
      >
        {project.thanks}
      </p>
    </article>
  );
}

/** Título de seção do case — Clother Bold 26px (NÃO é a fonte display). */
export function CaseSection({
  title,
  size,
  className,
  titleClassName,
  children,
}: {
  title: string;
  /** 'lg' = 32px com 24px até o conteúdo (Figma dos cases 'wide'). */
  size?: "lg";
  className?: string;
  /**
   * Classes extras do título (ex.: line-height/letter-spacing do case). Precisam
   * ser unlayered (CSS Module): a regra global de h1–h4 ganha dos utilitários.
   */
  titleClassName?: string;
  children?: ReactNode;
}) {
  return (
    <section className={className}>
      <h2
        className={withMotion(
          size === "lg"
            ? "mb-6 font-bold text-[1.75rem] text-[color:var(--color-blue)] md:text-[2rem]"
            : "mb-5 font-bold text-[1.625rem] leading-tight text-[color:var(--color-blue)]",
          titleClassName,
        )}
        style={size === "lg" ? bodyFontBold : bodyFont}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Bloco visual achatado do Figma.
 *
 * Não aplica sombra/rounded externos — os screenshots dos frames do Figma já
 * trazem o card (bg+rounded+shadow) embutido. Adicionar wrapper aqui cria
 * "caixa em volta de caixa".
 */
export function CaseImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`block w-full ${className ?? ""}`} />
  );
}
