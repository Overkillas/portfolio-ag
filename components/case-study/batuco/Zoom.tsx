import type { ReactNode } from "react";
import s from "../cases/batuco.module.css";

/**
 * Imagem clicável (guia §2/§6): o <button> não cresce, só a <img> filha direta dá zoom;
 * o clique abre o lightbox no item `index` (delegação em `BatucoMotion`). Sem estilo
 * visível em repouso: a imagem fica exatamente como no Figma.
 */
export function ZoomButton({
  index,
  label,
  className,
  children,
}: {
  index: number;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className ? `${s.ph} ${className}` : s.ph}
      data-lightbox={index}
      aria-label={label}
    >
      {children}
    </button>
  );
}

/**
 * Bloco de HTML vivo clicável (diagrama, Interface/Assets, Personagens, "Música é
 * saber"): o conteúdo não vai dentro de um <button> (o aria-label esconderia o texto
 * dos leitores de tela e títulos não podem ficar num botão). Um <button> transparente
 * cobre o bloco e o hover escala só o miolo. `board` = quadro grande (zoom 1.015, 1.4s).
 */
export function ZoomFrame({
  index,
  label,
  board = false,
  className,
  children,
}: {
  index: number;
  label: string;
  board?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={[s.zoomFrame, board && s.board, className].filter(Boolean).join(" ")}>
      <div className={s.zoomInner}>{children}</div>
      <button type="button" className={s.zoomBtn} data-lightbox={index} aria-label={label} />
    </div>
  );
}
