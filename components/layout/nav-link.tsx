/**
 * Estilo dos links de navegação em fonte display (HomeHeader e CaseHeader).
 * AM Novecento, lowercase, 22/24/32px; hover com o micro-movimento do design
 * (sobe, inclina, cresce), desligado com reduced motion.
 */
export const navLinkClass =
  'font-display text-[22px] lowercase leading-none transition-[opacity,translate,rotate,scale] duration-[350ms] ease-[cubic-bezier(.2,.9,.3,1.4)] hover:opacity-70 motion-safe:hover:-translate-y-[3px] motion-safe:hover:-rotate-2 motion-safe:hover:scale-[1.04] motion-reduce:transition-none sm:text-[24px] md:text-[32px]';

/** Cor dos links inativos (inline: a regra global `a { color: inherit }` vence as utilities). */
export const navLinkStyle = { color: 'var(--color-blue-soft)' } as const;

/** Link ativo (design da aba Projetos): azul forte e sombra suave abaixo das letras. */
export const activeNavStyle = {
  color: 'var(--color-blue-strong)',
  textShadow: '0.03em 0.09em 0.06em rgba(120, 110, 95, 0.35)',
} as const;

/**
 * Mirtilo do link ativo. Escala com a fonte (≈1.4em no desktop, 1.2em abaixo do
 * md para caber no padding lateral de 24px) e fica FORA do fluxo, pendurado ao
 * lado do texto (`side`, direita por padrão): não alarga o link. A posição vem
 * do `left`/`right` absoluto, não da ordem no JSX. O link precisa de
 * `position: relative`.
 *
 * Asset: SVG vetorial do Figma (node 17:191, "Group 100810" da Landing page),
 * com o viewBox recortado no desenho e a precisão dos paths em 1 casa decimal —
 * nítido em telas retina (o PNG de 43×52 antigo borrava).
 */
export function NavBerry({ side = 'right' }: { side?: 'left' | 'right' }) {
  const position = side === 'left' ? 'right-[calc(100%+0.03em)]' : 'left-[calc(100%+0.03em)]';
  return (
    // eslint-disable-next-line @next/next/no-img-element -- ícone decorativo minúsculo
    <img
      src="/images/projetos/mirtilo.svg"
      alt=""
      aria-hidden="true"
      className={`pointer-events-none absolute ${position} top-[calc(50%-0.1em)] h-[1.2em] w-auto max-w-none -translate-y-1/2 sm:h-[1.1em] md:h-[1.4em]`}
    />
  );
}
