import type { CSSProperties, ReactNode } from "react";
import { ZoomButton, ZoomFrame } from "@/components/case-study/batuco/Zoom";
import s from "./batuco.module.css";

/*
 * Peças comuns aos cases de layout 'wide' do Figma novo (Batuco-tuco, Pontinhas
 * soltas): texto corrido, títulos, régua em px do Figma e os gatilhos de zoom do
 * lightbox. Server Component puro — a interação fica no BatucoMotion.
 */

/** Texto corrido do Figma novo: Clother Regular 15px/18px, justificado a partir do md. */
export const textClass =
  "font-normal text-[0.9375rem] leading-[18px] text-[color:var(--color-blue)] md:text-justify";

/** Títulos (Clother Bold 32px) com as caixas do Figma — ver .title* em batuco.module.css. */
export const wideTitle = {
  base: s.title,
  box30: `${s.title} ${s.titleBox30}`,
  line18: `${s.title} ${s.titleLine18}`,
};

/** Caixa em px do Figma: x, y, largura, altura. */
export type Box = readonly [number, number, number, number];

/** Caixa → variáveis --x/--y/--w/--h (px do Figma), consumidas com a régua --u. */
export function boxVars([x, y, w, h]: Box, extra?: Record<string, string | number>) {
  return { "--x": x, "--y": y, "--w": w, "--h": h, ...extra } as CSSProperties;
}

export function Paragraphs({ items, className }: { items: string[]; className?: string }) {
  return (
    <div className={`flex flex-col gap-[18px] ${className ?? ""}`}>
      {items.map((p, i) => (
        <p key={i} className={textClass}>
          {p}
        </p>
      ))}
    </div>
  );
}

/**
 * Gatilhos do lightbox de um case. `zoom` = aria-label de cada item ("Ampliar: …"),
 * passado só pela página completa; sem ele (modal) os helpers devolvem o conteúdo
 * intacto, sem zoom nem reveal.
 *
 * - `frame`: bloco de HTML vivo → moldura com zoom + reveal (`board` = quadro grande).
 * - `image`: imagem → botão com zoom.
 * - `reveal`: classe do reveal ao rolar ("" sem `zoom`).
 */
export function zoomHelpers(zoom?: readonly string[]) {
  const frame = (index: number, node: ReactNode, board = false, className?: string) =>
    zoom ? (
      <ZoomFrame index={index} label={zoom[index]} board={board} className={[s.rv, className].filter(Boolean).join(" ")}>
        {node}
      </ZoomFrame>
    ) : (
      node
    );
  const image = (index: number, node: ReactNode) =>
    zoom ? (
      <ZoomButton index={index} label={zoom[index]}>
        {node}
      </ZoomButton>
    ) : (
      node
    );
  return { frame, image, reveal: zoom ? s.rv : "" };
}
