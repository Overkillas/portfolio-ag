import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Seção de saudação — fiel ao Figma Pontossemno (node 751:1318):
 *
 * Layout (canvas 1728px):
 * - Personagem ola-personagem.png (achatado: mão sobre a bochecha, sombras e
 *   grain já baked — sem overlay): canvas content-cropped 622.5×563 em
 *   x=166.5, y=557 (esquerda; coluna = 29.68vw). O canvas original do Figma
 *   (668.5×563) começava em x=121, mas a exportação é content-cropped (a 1ª
 *   coluna opaca = page x=166.5) → ml = 166.5−260 = −93.5px = −5.41vw;
 *   largura 622.5/1728 = 36.03vw. Mobile: preenche a coluna (w-full).
 * - Título "Olá a todos,": x=1031, y=575, 120px AM Novecento #6F96CE, 2 linhas,
 *   lineHeight 1.383 (o box do Figma = fontSize×1.38 por linha: 2×166 = 332;
 *   inline style, porque o h2 { line-height: 1 } de globals.css (unlayered)
 *   vence qualquer utility leading-* do Tailwind)
 * - Intro: x=843, y=948, w=648 (37.5vw), 26px Clother Light, justificado
 *   (gap título→intro = 948 − (575+332) = 41px)
 *
 * Container: fora do .container-narrow (decisão da review I-1 — a coluna 1fr
 * do container limitava a ilustração a ~421px e desproporcionava a mão).
 * Padding horizontal espelha o Figma: ilustração em x=260 (15.05vw), página
 * termina em x=1534 (pr 11.23vw). A elipse rosa (695×695, x=1394, y=436) e o
 * ":d" gigante são posicionados no wrapper da página (page.tsx), NÃO aqui.
 *
 * pb-[122px]: a coluna mais alta é a ILUSTRAÇÃO (557 + 563 = 1120 @1728),
 * não o texto (fim do intro = 1047) — com pb 196 a Filosofia caía em 1340,
 * 74px abaixo do Figma. 1120 + 122 = 1242 → com o pt-6 do wrapper da
 * filosofia (page.tsx) o título assenta em y=1266 (Figma 17:110).
 */
export function GreetingSection({ dict }: { dict: Dictionary }) {
  const home = dict.home;
  return (
    <section className="relative grid grid-cols-1 items-start gap-8 px-6 pb-12 pt-12 md:grid-cols-[29.68vw_1fr] md:gap-x-[14.93vw] md:pb-[122px] md:pl-[15.05vw] md:pr-[11.23vw] md:pt-[203px]">
      {/* Ilustração — personagem achatado (mão + sombras baked, sem overlay) */}
      <div className="relative mx-auto md:mx-0">
        {/* Wrapper flutuando (spec §4.1): o transform fica fora da img,
            que mantém margens e larguras que a posicionam */}
        <div className="anim-float">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/home/ola-personagem.png"
            alt={home.greetingAlt}
            width={622}
            height={563}
            className="h-auto w-full md:ml-[-5.41vw] md:max-w-none md:w-[36.03vw]"
          />
        </div>
      </div>

      {/* Texto — pt-[18px] assenta o título em y=575 (556.9 da ilustração + 18) */}
      <div className="md:pt-[18px]">
        {/* Título: 120px no Figma = clamp(3rem, 6.94vw, 7.5rem);
            lineHeight 1.383 inline — o box do Figma (332 = 2×120×1.383) é o
            line-height NATURAL da fonte; o h2 { line-height: 1 } de
            globals.css venceria a utility leading-*, por isso é inline */}
        <h2
          className="font-display text-[color:var(--color-blue)] text-[clamp(3rem,6.94vw,7.5rem)] mb-[41px]"
          style={{ lineHeight: 1.383 }}
        >
          {home.greeting}
        </h2>
        {/* Intro: 26px no Figma = text-[1.625rem], justificado; w=648 → 37.5vw, */}
        {/* outdent pra x=843 (10.88vw à esquerda da coluna do título, x=1031) */}
        {/* Duas frases em blocos: o Figma (17:109) quebra a linha depois da
            1ª (`<br>` após "fofinho."). Em pt-BR a quebra caía ali por acaso
            da largura do justify; em inglês sumia — por isso 2 chaves
            (intro + introWork), não uma string só.
            O Figma também justifica a linha antes da quebra; o CSS não
            (é a última do bloco). text-align-last só com a caixa cheia
            (648px, ≥1728): ali ela ocupa 87% (pt) / 95% (en); abaixo cai a
            15–50% e esticaria demais. */}
        <div className="max-w-[648px] text-[1.625rem] leading-[1.26] text-justify text-[color:var(--color-blue)] md:-ml-[10.88vw] md:w-[37.5vw]">
          <p>
            <span className="block min-[1728px]:[text-align-last:justify]">
              {home.intro}
            </span>
            <span className="block">{home.introWork}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
