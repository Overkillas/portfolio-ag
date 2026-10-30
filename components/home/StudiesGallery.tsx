import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Galeria de estudos — fiel ao Figma Pontossemno (canvas 1728px):
 *
 * Layout: grid 2fr 1fr (esquerda 1152px = 2/3, direita 576px = 1/3)
 * Altura total: 1117px (2 células de 558px + sidebar 1117px)
 *
 * Célula rosa (Frame 8, x=0, y=2234, 1152×558, bg #F9CEDC) — DUAS CAMADAS:
 *   1. Fundo: estudos-coelhos.png (h=161.56%, top=-8.61%, left=-1.36%, w=117.38%)
 *   2. Topo (VISÍVEL): estudos-cover.png (1727×558 at x=-95, object-cover)
 *
 * Célula azul (Frame 10, x=0, y=2793, 1152×558, bg #6F96CE):
 *   - carreira-baleia.png (h=153.99%, top=-28.29%, left=-4.16%, w=110.24%)
 *
 * Sidebar (Frame 9, x=1152, y=2234, 576×1117):
 *   - doodles-azul.svg (tem gradiente próprio #485699→#5C76B4→#6F95CE)
 */
export function StudiesGallery({ dict }: { dict: Dictionary }) {
  const home = dict.home;
  return (
    <section className="grid grid-cols-1 md:grid-cols-[2fr_1fr]">
      {/* Coluna esquerda (2/3): duas células empilhadas */}
      <div className="flex flex-col">
        {/* Célula ROSA — DUAS CAMADAS OBRIGATÓRIAS */}
        <div className="relative h-[300px] overflow-hidden bg-[color:var(--color-pink-light)] md:h-[558px]">
          {/* Camada 1 (fundo): coelhos — scaled para mostrar mais da imagem */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/home/estudos-coelhos.png"
            alt=""
            aria-hidden="true"
            width={735}
            height={490}
            className="absolute max-w-none object-cover"
            style={{
              height: "161.56%",
              top: "-8.61%",
              left: "-1.36%",
              width: "117.38%",
            }}
          />
          {/* Camada 2 (topo, VISÍVEL): cover — a imagem que o usuário vê */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/home/estudos-cover.png"
            alt={home.studiesAlt}
            width={1727}
            height={558}
            className="absolute max-w-none object-cover"
            style={{
              left: "-95px",
              top: "0.18px",
              width: "1727px",
              height: "558px",
            }}
          />
        </div>

        {/* Célula AZUL — baleia */}
        <div className="relative h-[300px] overflow-hidden bg-[color:var(--color-blue)] md:h-[558px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/home/carreira-baleia.png"
            alt={home.careerAlt}
            width={869}
            height={588}
            className="absolute max-w-none object-cover"
            style={{
              height: "153.99%",
              top: "-28.29%",
              left: "-4.16%",
              width: "110.24%",
            }}
          />
        </div>
      </div>

      {/* Coluna direita (1/3): sidebar com doodles */}
      <div className="relative min-h-[400px] md:min-h-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/home/doodles-azul.svg"
          alt={home.studiesDoodlesAlt}
          width={576}
          height={1117}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </section>
  );
}