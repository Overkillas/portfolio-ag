import Link from "next/link";
import type { Dictionary, Locale } from "@/i18n/dictionaries";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

/** Mola dos hovers da guia do Batuco-tuco (mesma do header da home). */
const spring = "transition-[translate,rotate,scale] duration-[350ms] ease-[cubic-bezier(.2,.9,.3,1.4)] motion-reduce:transition-none";
const focusRing = "focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#0e488b]";

/**
 * Geometria do texto da direita e do sininho, por variante (valores do Figma).
 *
 * - projects: cases 'wide' (node 17:2460). A caixa do texto (178 × 44) termina
 *   1px depois da barra de 1354, que já passa 2px da coluna de 1352 → -3px à
 *   direita. Sininho (node 17:2466) girado 57.5° em torno do canto superior
 *   esquerdo — o x/y do Figma de um nó girado é esse canto (1347.30, 33), ou seja,
 *   17.70px antes e 9px acima da caixa do texto (1177, 2). Conferido contra o
 *   render 1:1 do Figma (MAE 1.2/255).
 * - about: página de Estudos (barra 17:2264, 1379 × 48). O texto (caixa de 120 em
 *   x=1259) termina 27px depois da coluna de 1352 — só a partir do lg, onde o
 *   respiro do .container-wide (40px) comporta isso sem scroll horizontal.
 *   Sininho (node 17:2270, mesmo SVG) girado 57.39°, canto em (1430.30, 33) →
 *   16.70px antes e 9px acima da caixa do texto (1447, 42); o SVG tem 0.42px de
 *   respiro no topo (inset -0.85% do Figma), que girado vira +0.35 / -0.22.
 */
const variants = {
  projects: {
    text: "-mr-[3px]",
    bell: "left-[-17.7px] top-[-9px] rotate-[57.5deg]",
  },
  about: {
    text: "lg:-mr-[27px]",
    bell: "left-[-16.35px] top-[-9.22px] rotate-[57.39deg]",
  },
} as const;

/**
 * Barra acima da capa dos cases 'wide' (Figma node 17:2460, 1354 × 48): voltar
 * para o índice de projetos à esquerda, "projects" à direita, com o sininho
 * (node 17:2466) ao lado da palavra, e o seletor de idioma no centro (esta página
 * não tem o header do site — ver HeaderRouter). Só na página completa — o modal
 * tem os próprios controles (voltar/próximo).
 *
 * Hovers (guia do Claude Design): a seta desliza e gira "apontando pra trás"; o
 * "projetos" é link para o índice com o mesmo hover do header da home.
 *
 * `variant="about"` (página de Estudos, Figma 17:2264): voltar e "sobre" levam
 * para a home (Sobre mim), com a mesma barra.
 */
export function CaseTopBar({
  locale,
  dict,
  variant = "projects",
}: {
  locale: Locale;
  dict: Dictionary;
  variant?: keyof typeof variants;
}) {
  const href = variant === "about" ? `/${locale}` : `/${locale}/projetos`;
  const label = variant === "about" ? dict.nav.homeAbout : dict.nav.homeProjects;
  const backLabel = variant === "about" ? dict.studies.back : dict.projectsPage.back;
  const geometry = variants[variant];

  return (
    // Figma: barra em y=40 e capa em y=154 → 66px entre a barra (48) e a capa.
    // Grid 1fr auto 1fr (como o HomeHeader): o seletor fica no centro exato. Abaixo
    // do sm as colunas iguais não cabem "projetos" → flex com espaço entre os três.
    <div className="mb-[66px] flex h-12 items-center justify-between gap-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-6">
      {/* Casca Azul gelo 48px (4px de respiro) + miolo 40px #eaeef4 com borda
          2px tracejada #527fb0; "<" em AM Novecento 32px, recortado como no Figma
          (padding 6/16/8 + overflow). */}
      <Link
        href={href}
        aria-label={backLabel}
        className={`inline-flex size-12 shrink-0 justify-self-start rounded-full bg-[color:var(--color-blue-soft)] p-1 ${spring} motion-safe:hover:-translate-x-1 motion-safe:hover:-rotate-[10deg] ${focusRing}`}
      >
        <span className="flex size-10 items-center justify-center overflow-hidden rounded-[60px] border-2 border-dashed border-[#527fb0] bg-[#eaeef4] px-4 pb-2 pt-1.5">
          <span
            aria-hidden
            className="whitespace-nowrap text-[2rem] leading-[normal] text-[#527fb0]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            {"<"}
          </span>
        </span>
      </Link>

      <LanguageSwitcher currentLocale={locale} dict={dict} />

      {/* Margem à direita e sininho: ver `variants`. */}
      <Link
        href={href}
        className={`relative ${geometry.text} inline-block justify-self-end whitespace-nowrap text-[1.5rem] sm:text-[2rem] lowercase leading-[normal] ${spring} motion-safe:hover:-translate-y-[3px] motion-safe:hover:-rotate-2 motion-safe:hover:scale-[1.04] ${focusRing}`}
        // Cor inline: o `a { color: inherit }` de globals.css (fora de layer) ganha dos utilitários.
        style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "#0855ab" }}
      >
        {label}
        {/* Sininho: SVG no tamanho do Figma (46.69 × 50.12), girado em torno do
            canto superior esquerdo (ver `variants`). Fica à esquerda da palavra.
            Some abaixo do sm: em 375px ele cobriria o seletor de idioma. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/projects/batuco-tuco/sininho-projetos.svg"
          alt=""
          aria-hidden
          width={46.6886}
          height={50.1209}
          className={`pointer-events-none absolute hidden max-w-none sm:block origin-top-left ${geometry.bell}`}
        />
      </Link>
    </div>
  );
}
