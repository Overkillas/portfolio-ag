import type { CSSProperties, ReactNode } from "react";
import s from "./career.module.css";

/**
 * Coordenadas do Figma (frame 201:53, px de design) → variáveis lidas pelo `.a` (canvas)
 * e pelos filhos de `.island` (coordenadas relativas à ilha). Valores do get_design_context.
 */
export function at(x: number, y: number, w: number, extra?: Record<string, number | string>): CSSProperties {
  return { "--x": x, "--y": y, "--w": w, ...extra } as CSSProperties;
}

/**
 * Pill tracejado do Figma (Frame 32). `small` = 39/31; `round` = 52 × 52 com miolo de 44
 * (números da história da arte, 226:109); `strong` = texto #08488f cheio (os pills da
 * cena dos caminhos, 226:214); `min` = largura mínima (px do Figma).
 */
export function CareerPill({
  children,
  small = false,
  round = false,
  strong = false,
  min,
  className = "",
  style,
}: {
  children: ReactNode;
  small?: boolean;
  round?: boolean;
  strong?: boolean;
  min?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`${s.pill} ${small ? s.pillSm : ""} ${round ? s.pillRound : ""} ${strong ? s.pillStrong : ""} ${className}`}
      style={{ ...(min ? { "--min": min } : {}), ...style } as CSSProperties}
    >
      <span className={s.pillInner}>{children}</span>
    </span>
  );
}

/**
 * Parágrafo com negrito intercalado: as chaves `p*` são texto normal e `b*` são
 * negrito (Clother Black), na ordem do dicionário (padrão de chaves partidas do AGENTS.md).
 */
export function Rich({ parts }: { parts: Record<string, string> }) {
  return (
    <>
      {Object.entries(parts).map(([key, text]) => (key.startsWith("b") ? <b key={key}>{text}</b> : text))}
    </>
  );
}

/** <picture> de um GIF da Ágatha: WebP animado, e o 1º quadro com movimento reduzido. */
export function Loop({
  name,
  alt,
  width,
  height,
  priority = false,
}: {
  name: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}) {
  return (
    <picture>
      <source media="(prefers-reduced-motion: reduce)" srcSet={`/images/carreira/${name}-static.webp`} />
      <img
        src={`/images/carreira/${name}.webp`}
        alt={alt}
        aria-hidden={alt ? undefined : true}
        width={width}
        height={height}
        className={s.fill}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
      />
    </picture>
  );
}
