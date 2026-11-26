import type { Dictionary } from "@/i18n/dictionaries";
import { HomeContactForm } from "@/components/home/HomeContactForm";

/**
 * Seção de contato — fiel ao Figma Pontossemno (node 751:1318):
 *
 * - Ilustração: PNG achatado contato-personagem.png (node 751:1360 achatado com
 *   o grupo da MÃO no rosto 751:1389 "Group 100785" BAKED por cima — o antigo
 *   overlay contato-extra.svg era esse mesmo grupo da mão; exatamente UMA mão
 *   no render, sem overlay e sem rotate 0.51°). O container do Figma era
 *   555×676 em x=254 y=3437, mas o export é content-cropped (crop 2x
 *   [31,39,1110,1362) — fim exclusivo — do canvas 1110×1362:
 *   removeu 15.5px de bleed à esquerda e 19.5px no topo, em 1x) → o conteúdo
 *   opaco assenta em page x=269.5, y=3456.5, CSS 539.5×661.5. Offsets/tamanho
 *   em % da coluna (554.98px @1728; margens % e width % resolvem contra a
 *   largura da coluna, então escalam com 32.12vw como o resto do layout):
 *   ml 15.5/554.98 = 2.793%, mt 19.5/554.98 = 3.514%, w 539.5/554.98 = 97.21%
 *   (classes md:* — mobile fica w-full centrado).
 *   NÃO usar w-full: o PNG é mais estreito que a coluna e w-full esticaria
 *   para 555 (preflight clamp: max-width 100% estica, não reduz).
 * - Título (Figma novo EGDJU9UG5XmLO6zV8Howwo, 17:173): caixa 517 centrada,
 *   DUAS linhas — "vAMOS" 132px (7.639vw) e "TRABALHAR JUNTOS?" 43px
 *   (2.488vw), AM Novecento. Calibrado pela TINTA no render 1:1 do Figma
 *   (relativo ao topo do bloco 17:133): "VAMOS" y=118..218 x=900..1403,
 *   linha pequena y=244..276, subtítulo y=320..337. Com lineHeight 1:
 *   mt-99 no h2, mt-7 na linha pequena, mb-30 no h2. lineHeight inline: o
 *   h2 { line-height: 1 } de globals.css vence a utility leading-*
 * - Subtítulo (17:175): w=517, Clother Light 26px (box 31 = 1.2×26); form
 *   (17:176) começa 26px depois
 * - Formulário: HomeContactForm (e-mail + solicitação, do protótipo; envio real
 *   via EmailJS). Mais compacto que o antigo ContactForm (~456px) e mais perto
 *   do stub de 129px do Figma.
 *
 * Container: fora do .container-narrow (padrão vw do Plan 2 — a coluna 1fr do
 * container limitava a ilustração a ~421px). Padding horizontal espelha o
 * Figma novo (17:133): ilustração em x=256 (14.815vw); bloco de texto em
 * x=895 (14.815 + 32.12 + 4.861 de gap), limitado a w=517px (o pr fiel seria
 * 1728−1412 = 316px ≈ 18.3vw, coberto pelo max-w do bloco).
 *
 * As elipses decorativas (758:110 em x=1131 y=3486, 758:111 em x=74 y=3669)
 * são posicionadas no wrapper do contato em page.tsx, NÃO aqui.
 */
export function ContactSection({ dict }: { dict: Dictionary }) {
  const home = dict.home;
  return (
    <section className="grid grid-cols-1 items-center gap-10 px-6 md:grid-cols-[32.12vw_1fr] md:items-start md:gap-x-[4.861vw] md:px-0 md:pl-[14.815vw] md:pr-[4vw]">
      {/* Ilustração (mão no rosto BAKED no PNG — sem overlay) */}
      <div className="relative mx-auto md:mx-0">
        {/* Wrapper flutuando (spec §4.1, fora de fase com o "Olá") */}
        <div className="anim-float-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/home/contato-personagem.png"
            alt={home.contactIllustrationAlt}
            loading="lazy"
            decoding="async"
            width={539}
            height={661}
            className="h-auto w-full md:w-[97.21%] md:ml-[2.793%] md:mt-[3.514%]"
          />
        </div>
      </div>

      {/* Texto + formulário */}
      <div className="md:max-w-[517px]">
        {/* Título em 2 linhas (Figma 17:173): palavra grande + frase pequena,
            centradas na caixa de 517. Margens calibradas pela tinta (ver doc
            acima): "VAMOS" a 118px do topo do bloco. */}
        <h2
          className="mb-[30px] w-full text-center font-display uppercase text-[color:var(--color-blue)] md:mt-[99px]"
          style={{ lineHeight: 1 }}
        >
          <span className="block text-[clamp(4rem,7.639vw,8.25rem)]">
            {home.contactTitleLine1}
          </span>
          <span className="mt-[7px] block text-[clamp(1.303rem,2.488vw,2.6875rem)]">
            {home.contactTitleLine2}
          </span>
        </h2>

        {/* Subtítulo: Clother Light 26px (17:175), caixa 31; o form (17:176)
            começa 26px depois no Figma; 28 aqui compensa a caixa de linha do
            navegador (31.2 vs 31) e assenta o form em 369.8 como no Figma */}
        <p className="mb-[28px] text-[1.625rem] font-light leading-[1.2] text-[color:var(--color-blue)]">
          {home.contactSubtitle}
        </p>

        {/* Formulário do protótipo (envio real via EmailJS). O ContactForm antigo
            segue só em /contato. */}
        <HomeContactForm />
      </div>
    </section>
  );
}
