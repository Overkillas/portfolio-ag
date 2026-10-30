import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Crachá — arte achatada do Figma (Group 100805, node 757:94): os 4 elementos
 * de arte são PNGs flat @2x (sombra, pétala, grão e furo baked) que já vêm
 * ROTACIONADOS — a aparência final do node como o Figma renderiza. NÃO há
 * cadeia de rotate para eles (manter os wrappers de 15.24° giraria a arte
 * duas vezes, ~+15°): cada img é absoluta, no tamanho CSS (PNG/2) e na
 * posição medida contra o render full-page 1x do Figma (MAE 1.66, varredura
 * ±4px, texto/réguas fora da métrica). Posições (left/top) relativas ao box
 * do grupo (1259.4,1237 no Figma):
 *   1. Corpo (node 757:95, cracha-corpo.png 668×868 → 334×434): left=-99.4px,
 *      top=79px. O render-bounds do node Exclude NÃO coincide com o AABB do
 *      grupo (o corpo fica ~100px à ESQUERDA do box e 79px abaixo do topo): o
 *      juiz é onde o render do Figma mostra a arte, não os números de
 *      metadata. O corpo já traz o furo RECORTADO (alpha 0 no centro do anel):
 *      o creme da página aparece pelo buraco. É o portador do alt.
 *   2. Anel (node 757:98, cracha-anel.png 167² → 83.5²): left=60.6px,
 *      top=112px — anel prata com centro transparente.
 *   3. Ellipse 378 (node 757:99, cracha-elipse-378.png 248×172 → 124×86):
 *      left=107.6px, top=88px — blob azul-gelo com grão/sombra baked. Sem
 *      inset-%: o antigo PNG 228×202 tinha dimensões diferentes.
 *   4. Pétala (node 757:100, cracha-petala.png 211×251 → 105.5×125.5):
 *      left=98.6px, top=42px — prata com grão, pinta sobre o blob e o anel
 *      (ordem do Figma: corpo, anel, 378, pétala).
 *   5. 4× Linha: wrapper 169.004×44.649 (bbox do traço rotacionado), lefts
 *      escalonados -11.51/-22.32/-33.13/-44px e tops 244.43/285.21/325.98/
 *      366.76px; child w=174.802 h=0 (img com espessura natural 3.45) e
 *      rotate 14.8° — continuam como SVG vivo (cracha-linha.svg)
 *   6. Texto typewriter (crachaSaying): wrapper left=-36.7px, top=247.3px,
 *      186.964×161.345; child rotate 14.8° (mesmo ângulo das réguas — spec
 *      v3 §2.3) com p de 23px, leading 1.8, lowercase, width 159.843 — por
 *      último no DOM (pinta sobre as linhas). Texto SEMPRE vivo (i18n): nunca
 *      baked nos PNGs.
 *
 * Texto: o left/top do wrapper (-36.7/247.3, antes -1.7/237.3) foi medido
 * contra o render do Figma (correlação das máscaras de glifo, réguas
 * mascaradas, pt-BR): cada linha fica ENTRE o par de réguas, não sobre elas.
 * Mobile (<md): a composição (corpo+réguas+texto, bbox visual 334px a partir
 * de -99.4px do box) é centralizada na coluna com margin-left: 50% − 67.6px
 * (centro do bbox em 67.6px do box) e justify-start; desktop inalterado. As
 * 4 imgs de arte levam max-md:max-w-none: o reset global max-width:100% as
 * encolheria quando o box encolhe como flex item na coluna estreita.
 *
 * NÃO re-exportar a pétala por screenshot do Figma (sai preta): os PNGs
 * vêm do download 2x com de-blend, versionados em public/images/home.
 *
 * NÃO renderizar o cracha-clip.png: o Figma node 757:94 NÃO tem tal parte
 * (verificado por metadata: Exclude, Ellipse 377, Ellipse 378, Union, 4 Lines
 * e Texto — apenas); o grande teardrop azul-claro cobria o meio do crachá e o
 * typewriter. O asset segue em public/, mas hoje nenhuma página o usa (órfão
 * pré-existente, fora do escopo desta branch).
 */
function Cracha({ alt, saying }: { alt: string; saying: string }) {
  // 5. Posições (left/top) dos wrappers das 4 linhas, do Figma
  const linhas = [
    { left: "-11.51px", top: "244.43px" },
    { left: "-22.32px", top: "285.21px" },
    { left: "-33.13px", top: "325.98px" },
    { left: "-44px", top: "366.76px" },
  ];

  return (
    <div
      className="cracha relative mx-auto max-md:mx-0 max-md:ml-[calc(50%-67.6px)]"
      style={{ width: "377px", height: "506px" }}
    >
      {/* 1–4. Arte achatada (PNG já rotacionado — sem wrappers de rotate):
          corpo (alt-bearer, furo recortado), anel, ellipse 378, pétala —
          nessa ordem de pintura. Ver doc do Cracha. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/home/cracha-corpo.png"
        alt={alt}
        loading="lazy"
        decoding="async"
        width={334}
        height={434}
        className="absolute max-md:max-w-none"
        style={{
          left: "-99.4px",
          top: "79px",
          width: "334px",
          height: "434px",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/home/cracha-anel.png"
        alt=""
        loading="lazy"
        decoding="async"
        aria-hidden="true"
        width={84}
        height={84}
        className="absolute max-md:max-w-none"
        style={{
          left: "60.6px",
          top: "112px",
          width: "83.5px",
          height: "83.5px",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/home/cracha-elipse-378.png"
        alt=""
        loading="lazy"
        decoding="async"
        aria-hidden="true"
        width={124}
        height={86}
        className="absolute max-md:max-w-none"
        style={{
          left: "107.6px",
          top: "88px",
          width: "124px",
          height: "86px",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/home/cracha-petala.png"
        alt=""
        loading="lazy"
        decoding="async"
        aria-hidden="true"
        width={106}
        height={126}
        className="absolute max-md:max-w-none"
        style={{
          left: "98.6px",
          top: "42px",
          width: "105.5px",
          height: "125.5px",
        }}
      />

      {/* 5. Quatro linhas decorativas (réguas do texto) — o svg é um traço
          fino (174.802×3.45) NATIVO não rotacionado; rotacionamos em CSS (14.8°)
          — esticar para 44.65px engrossaria o traço 13×. O wrapper é o bbox
          do traço rotacionado (child de h=0 centrado, img sangra ±3.45px). */}
      {linhas.map((pos, i) => (
        <div
          key={i}
          className="absolute flex items-center justify-center"
          style={{
            left: pos.left,
            top: pos.top,
            width: "169.004px",
            height: "44.649px",
          }}
        >
          <div
            className="flex-none rotate-[14.8deg]"
            style={{ width: "174.802px", height: 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/home/cracha-linha.svg"
              alt=""
              aria-hidden="true"
              width={174.802}
              height={3.45}
              className="absolute"
              style={{ left: 0, top: "-3.45px" }}
            />
          </div>
        </div>
      ))}

      {/* 6. Texto typewriter entre as réguas — por último no DOM: pinta
          sobre base e linhas (ordem do código de referência do Figma) */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: "-36.7px",
          top: "247.3px",
          width: "186.964px",
          height: "161.345px",
        }}
      >
        <div className="flex-none rotate-[14.8deg]">
          <p
            className="lowercase text-center text-[color:var(--color-blue-soft)] text-[23px] leading-[1.8]"
            style={{
              width: "159.843px",
              fontFamily: '"P22 Typewriter","Courier New",monospace',
            }}
          >
            {saying}
          </p>
        </div>
      </div>

    </div>
  );
}

/**
 * Seção Philosophy — fiel ao Figma (node 751:1318):
 *
 * - Título "Filosofia": x=222, y=1266, 120px AM Novecento #6F96CE, box 166
 *   (lineHeight 1.383 — altura natural da fonte no Figma)
 * - Lead: x=222, y=1481, w=705, Clother Bold 32px, box 76 (2×38 = 1.19×32);
 *   gap título→lead = 49 (1481 − (1266+166))
 * - Body1: x=222, y=1590, w=702, 26px, box 93 (3×31); gap lead→body1 = 33
 * - Body2: x=222, y=1704, w=702, 26px, box 124 (4×31); gap body1→body2 = 21
 * - Crachá: x=1259, y=1237 (grupo 377×506 — arte em PNGs achatados
 *   já rotacionados, ver doc do Cracha; topo 29px ACIMA do título)
 *
 * NÃO IMPLEMENTAR: Figma nodes 753:1649 e 753:1653 (duplicados leftover).
 *
 * Layout: grid 2 colunas — coluna do texto = 1037px (60.01vw: 1259−222),
 * coluna do crachá = 377px fixo (assenta em x=1259 = 72.8% @1728).
 * O corpo do crachá sangra 99.4px para a ESQUERDA da coluna do crachá (ver doc
 * do Cracha): a coluna do texto reserva esse sangramento com md:pr-[100px],
 * senão o corpo (opaco, pintado depois no DOM) cobre a borda direita dos
 * parágrafos entre 768 e ~1440px. A 1728 não muda nada (texto limitado a
 * 705px dentro de 1037px).
 * O padding horizontal (pl 12.85vw / pr 5.32vw) mora no wrapper da página
 * (page.tsx), no padrão vw do Plan 2 — NÃO em .container-narrow.
 * As elipses decorativas (758:298 em x=27 y=1125, 758:112 em x=581 y=1608)
 * também são posicionadas no wrapper da página (page.tsx), NÃO aqui.
 */
export function PhilosophySection({ dict }: { dict: Dictionary }) {
  const home = dict.home;
  return (
    <section className="relative grid grid-cols-1 items-start gap-8 md:grid-cols-[1fr_377px] md:gap-x-0">
      {/* Texto esquerda */}
      <div className="md:pr-[100px]">
        {/* Título: 120px no Figma = clamp(3rem, 6.94vw, 7.5rem); o box do
            Figma (166 = 120×1.38) é a ALTURA NATURAL da linha — inline style
            (o h2 { line-height: 1 } de globals.css vence a utility leading-*) */}
        <h2
          className="w-fit font-display text-[color:var(--color-blue)] text-[clamp(3rem,6.94vw,7.5rem)] mb-[49px]"
          style={{ lineHeight: 1.383 }}
        >
          {home.philosophy}
        </h2>

        {/* Lead: 32px no Figma = text-[2rem], justificado, w=705 → max-w-[705px];
            2 linhas de 38 (1.19×32) = box 76 */}
        <p
          className="max-w-[705px] text-[2rem] font-bold leading-[1.19] text-justify text-[color:var(--color-blue)] mb-[33px]"
          style={{ wordSpacing: "0.08em" }}
        >
          {home.philosophyLead}
        </p>

        {/* Body1: 26px = text-[1.625rem], justificado, w=702; 3 linhas de 31
            (1.19×26) = box 93; gap lead→body1 = 1590 − 1557 = 33 */}
        <p
          className="max-w-[702px] text-[1.625rem] leading-[1.19] text-justify text-[color:var(--color-blue)] mb-[21px]"
          style={{ wordSpacing: "0.08em" }}
        >
          {home.philosophyBody1}
          <strong className="font-bold">{home.philosophyBody1Bold}</strong>
          {home.philosophyBody1End}
        </p>

        {/* Body2: 26px, justificado; 4 linhas de 31 = box 124 */}
        <p
          className="max-w-[702px] text-[1.625rem] leading-[1.19] text-justify text-[color:var(--color-blue)]"
          style={{ wordSpacing: "0.08em" }}
        >
          {home.philosophyBody2}
          <strong className="font-bold">{home.philosophyBody2Bold1}</strong>
          {home.philosophyBody2Mid}
          <strong className="font-bold">{home.philosophyBody2Bold2}</strong>
          {home.philosophyBody2Mid2}
          <strong className="font-bold">{home.philosophyBody2Bold3}</strong>
          {home.philosophyBody2End}
        </p>
      </div>

      {/* Crachá direita — 377px fixos, encostado à direita (x=1636 @1728).
          O Figma alinha o crachá 29px ACIMA do topo do título (1237 vs 1266). */}
      <div className="flex justify-center max-md:justify-start md:-mt-[29px] md:justify-end">
        <Cracha alt={home.crachaAlt} saying={home.crachaSaying} />
      </div>
    </section>
  );
}