"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/use-media-query";

/**
 * Hero display no topo de cada página — banda full-width com gradiente azul e o
 * título em creme.
 *
 * No Figma TODAS as bandas têm a MESMA altura (220px num frame de 1512 =
 * 14.55vw) e o título é dimensionado para PREENCHER a largura de borda a borda,
 * "vazando" levemente nas laterais e cruzando a borda inferior da banda (a
 * parte de baixo das letras some no creme). Por isso títulos com menos letras
 * ficam maiores.
 *
 * Em vez de chutar o font-size por nº de caracteres, o título é desenhado em
 * SVG e medido com `getBBox`: o viewBox vira a caixa REAL das letras, então o
 * SVG (largura 100%) escala o texto para encher a largura automaticamente —
 * sem tamanho fixo e reescalando sozinho no resize (é vetor). A caixa justa faz
 * as letras encostarem nas bordas; um leve overscan empurra o "vazamento".
 *
 * Home/Contato usam "Ágatha sales"; landings, o nome da categoria.
 *
 * variant="home" (spec v2 §4.2): banda da home v2 "Pontossemno" — 252px @1728
 * (14.58vw) com gradiente -62.1° (.bg-hero). O default mantém .bg-band
 * (-70.88°, clamp(168px,17.5vw,290px)) pra home/contato/categorias antigas.
 *
 * Props opcionais (desligadas = HTML idêntico ao de antes), usadas pelo
 * banner de /projetos:
 * - fullWidth: ignora a regra de título curto e enche a largura da banda.
 * - bleedBottom: fração da altura das letras que fica ABAIXO da borda inferior
 *   da banda (o viewBox termina nessa altura acima da base e o recorte do SVG
 *   corta as letras).
 * - parallax: no scroll, o SVG ganha translateY(y·0.18) scale(1 + y·0.00012)
 *   (y = min(scrollY, 900)), por rAF, composto com o transform que já existir.
 */
export function BrandHero({
  title,
  variant = 'default',
  fullWidth = false,
  bleedBottom = 0,
  parallax = false,
}: {
  title: string;
  variant?: 'default' | 'home';
  fullWidth?: boolean;
  bleedBottom?: number;
  parallax?: boolean;
}) {
  const isHome = variant === 'home';
  const text = title;
  const textRef = useRef<SVGTextElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const reducedMotion = useReducedMotion();
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    let cancelled = false;
    const measure = () => {
      if (cancelled || !el) return;
      const b = el.getBBox();
      setBox({ x: b.x, y: b.y, w: b.width, h: b.height });
    };
    measure();
    // Re-medir quando a fonte custom (AM Novecento via Typekit) terminar de
    // carregar — antes disso o getBBox mede a fonte de fallback.
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [text]);

  // O texto é medido com a LINHA DE BASE em y=0 (dominant-baseline alphabetic):
  // box.y é negativo (topo das letras acima da base). O viewBox vai do topo
  // (box.y) até a base (y=0) → altura -box.y. Assim a base encosta EXATAMENTE
  // na borda inferior da banda (bottom:0), sem sobrar faixa e sem depender do
  // "descent" da fonte nem de o título ter descendente (ç). Descendentes ficam
  // abaixo da banda (no creme), recortados — igual ao Figma.
  const capHeight = box ? -box.y : 1;
  const viewBox = box
    ? `${box.x} ${box.y} ${box.w} ${capHeight * (1 - bleedBottom)}`
    : undefined;

  // Títulos CURTOS (ex: "3D Design", 9 letras) cresceriam demais pra encher a
  // largura e "quebram"; usamos um tamanho fixo (% da banda) centralizado. A
  // detecção é por nº de caracteres (determinística) — os demais têm 12+ letras.
  const short = !fullWidth && text.trim().length <= 10;

  const svgStyle: React.CSSProperties = short
    ? // título curto: largura arbitrária (% da banda), centralizado na
      // horizontal e colado na base. Altura sai da proporção das letras.
      { bottom: 0, left: "50%", transform: "translateX(-50%)", width: "74%", height: "auto", visibility: box ? "visible" : "hidden" }
    : // título normal: enche a largura (sangra ~1% nas laterais), colado na base.
      { bottom: 0, left: "-0.5%", width: "101%", height: "auto", visibility: box ? "visible" : "hidden" };

  const baseTransform = svgStyle.transform;
  useEffect(() => {
    const el = svgRef.current;
    if (!parallax || reducedMotion || !el) return;
    let frame = 0;
    const apply = () => {
      frame = 0;
      const y = Math.min(window.scrollY, 900);
      const motion = `translateY(${y * 0.18}px) scale(${1 + y * 0.00012})`;
      el.style.transform = baseTransform ? `${baseTransform} ${motion}` : motion;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      el.style.transform = baseTransform ?? "";
    };
  }, [parallax, reducedMotion, baseTransform]);

  return (
    <div
      className={`relative w-full overflow-hidden ${
        isHome
          ? 'bg-hero h-[14.58vw] min-h-[168px]'
          : 'bg-band h-[clamp(168px,17.5vw,290px)]'
      }`}
    >
      {/* h1 real pra semântica/SEO; o visual fica no SVG (aria-hidden). */}
      <h1 className="sr-only">{text}</h1>
      <svg
        ref={svgRef}
        aria-hidden
        className="absolute"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMax meet"
        style={svgStyle}
      >
        <text
          ref={textRef}
          x="0"
          y="0"
          dominantBaseline="alphabetic"
          className="font-display uppercase"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "100px",
            fill: "var(--color-cream)",
          }}
        >
          {text}
        </text>
      </svg>
    </div>
  );
}
