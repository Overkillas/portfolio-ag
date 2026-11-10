import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import s from "./cases/batuco.module.css";

/**
 * Botão pontilhado redondo do Figma novo (casca Azul gelo 48px + miolo tracejado
 * 40px), o mesmo do voltar do CaseTopBar. Usado pelo fechar/setas do lightbox e
 * pelas setas do livro do Caju: um componente só, para as setas serem idênticas.
 *
 * `glyph` = conteúdo do miolo (texto em AM Novecento, como "<", ">" e "×", ou um
 * ícone). O botão não tem texto visível: passe `aria-label`.
 */
export function DottedButton({
  glyph,
  className,
  ref,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  glyph: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <button ref={ref} type="button" className={className ? `${s.lbBtn} ${className}` : s.lbBtn} {...props}>
      <span aria-hidden className={s.lbBtnInner}>
        <span className={s.lbGlyph}>{glyph}</span>
      </span>
    </button>
  );
}
