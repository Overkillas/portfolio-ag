"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// prefers-reduced-motion via matchMedia (padrão do useReducedMotion do protótipo);
// no servidor e na hidratação vale false, o estado final (p = 1) é o mesmo.
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getReducedServer = () => false;

/**
 * Cabeça + dedos do personagem espiando (registro sobre o antigo PNG plano:
 * peças a 1x CSS, offset (23.25, 0.5) px a partir do canvas de 766.5×420.5;
 * MAE 2.2/255 contra o PNG plano). A cabeça sobe de trás da galeria conforme o
 * scroll (spec §4.4): p = 0 quando o topo da galeria entra pela base da tela,
 * p = 1 a 55% da altura. Estado inicial (SSR/sem JS/movimento reduzido): p = 1.
 *
 * O recorte (overflow hidden) tem a borda de baixo exatamente no topo da
 * galeria; os dedos ficam logo abaixo dessa borda, por cima da galeria.
 */
export function PeekingReveal({ alt }: { alt: string }) {
  const clipRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(1);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    getReduced,
    getReducedServer,
  );

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = clipRef.current;
      if (!el) return;
      const vh = window.innerHeight || 800;
      const line = el.getBoundingClientRect().bottom;
      const next = clamp01((vh - line) / (vh * 0.55));
      setP((prev) =>
        next === 0 || next === 1 || Math.abs(prev - next) > 0.005 ? next : prev,
      );
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const pp = reduced ? 1 : p;
  const e = pp * pp * (3 - 2 * pp);
  const f = clamp01((pp - 0.9) / 0.1);

  return (
    <>
      <div
        ref={clipRef}
        aria-hidden="true"
        className="absolute overflow-hidden"
        style={{ left: "23.25px", top: "0.5px", width: "744px", height: "321px" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-peek-head
          src="/images/home/espiando-cabeca.png"
          alt=""
          loading="lazy"
          decoding="async"
          width={744}
          height={321}
          style={{
            width: "744px",
            height: "321px",
            maxWidth: "none",
            transform: `translateY(${((1 - e) * 100).toFixed(2)}%)`,
            transition: reduced ? "none" : "transform .35s var(--ease-out)",
            willChange: "transform",
          }}
        />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-peek-fingers
        src="/images/home/espiando-dedos.png"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        width={744}
        height={99}
        className="absolute"
        style={{
          left: "23.25px",
          top: "321.5px",
          width: "744px",
          height: "99px",
          maxWidth: "none",
          opacity: f,
          transform: `translateY(${((1 - f) * -60).toFixed(1)}%)`,
          transition: reduced
            ? "none"
            : "opacity .35s ease, transform .45s var(--ease-bouncy)",
        }}
      />
      <span className="sr-only">{alt}</span>
    </>
  );
}
