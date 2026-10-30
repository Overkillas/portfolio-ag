import type { Dictionary } from "@/i18n/dictionaries";
import { ContactForm } from "@/components/contact/ContactForm";

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
 * - Título: x=891, y=3522, box 351 — 3 LINHAS de 78px (4.51vw @1728),
 *   lineHeight 1.5 (pitch 117: 78×1.5 = 351/3 exato; largura do box 511
 *   confirma 78 — 84.8 daria 559.8). lineHeight inline: o h2
 *   { line-height: 1 } de globals.css vence a utility leading-*
 * - Subtítulo: x=893, y=3908, w=517, Clother Regular 24px (box 29 = 1.2×24);
 *   gap título→subtítulo = 35 (3908 − (3522+351)); form (stub Figma
 *   750:1259) começa 26px depois (3963)
 * - Formulário: ContactForm existente (nome/email/telefone/mensagem)
 *   — o form REAL é ~456px (vs stub 129px do Figma), o que desce o rodapé
 *   da home (~+153px vs o height 4614 do frame) — impossível de fechar sem
 *   cortar funcionalidade do form.
 *
 * Container: fora do .container-narrow (padrão vw do Plan 2 — a coluna 1fr do
 * container limitava a ilustração a ~421px). Padding horizontal espelha o
 * Figma: ilustração em x=254 (14.70vw); bloco de texto em x=891 (51.56%
 * = 14.70 + 32.12 + 4.74 de gap), limitado a w=517px (o pr fiel seria
 * 1728−1408 = 318px ≈ 18.4vw, coberto pelo max-w do bloco).
 *
 * As elipses decorativas (758:110 em x=1131 y=3486, 758:111 em x=74 y=3669)
 * são posicionadas no wrapper do contato em page.tsx, NÃO aqui.
 */
export function ContactSection({ dict }: { dict: Dictionary }) {
  const home = dict.home;
  return (
    <section className="grid grid-cols-1 items-center gap-10 px-6 md:grid-cols-[32.12vw_1fr] md:items-start md:gap-x-[4.74vw] md:px-0 md:pl-[14.70vw] md:pr-[4vw]">
      {/* Ilustração (mão no rosto BAKED no PNG — sem overlay) */}
      <div className="relative mx-auto md:mx-0">
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

      {/* Texto + formulário */}
      <div className="md:max-w-[517px]">
        {/* Título em 3 LINHAS — Figma: 78px (4.51vw @1728) nas 3, linha 1.5:
            box 351 = 3×pitch 117 (117 = 78×1.5). As 3 linhas têm o MESMO
            tamanho (o antigo 120/72/72 era leitura errada; o 84.8/1.38 da
            inferência anterior estica a largura 559.8 vs box 511 do Figma).
            mt-[86px]: ilustração assenta em 3437 (padding-top 87 do wrapper
            em page.tsx) e o título em 3522 (3437+86) */}
        <h2
          className="w-fit font-display uppercase text-[color:var(--color-blue)] md:mt-[86px] mb-[35px]"
          style={{ lineHeight: 1.5 }}
        >
          <span className="block text-[clamp(3.25rem,4.51vw,4.875rem)]">
            {home.contactTitleLine1}
          </span>
          <span className="block text-[clamp(3.25rem,4.51vw,4.875rem)]">
            {home.contactTitleLine2}
          </span>
          <span className="block text-[clamp(3.25rem,4.51vw,4.875rem)]">
            {home.contactTitleLine3}
          </span>
        </h2>

        {/* Subtítulo: 24px no Figma = text-[1.5rem], box 29 = 1.2×24;
            mb-[26px]: stub do form no Figma começa em 3963 (3908+29+26) */}
        <p className="mb-[26px] text-[1.5rem] font-normal leading-[1.2] text-[color:var(--color-blue)]">
          {home.contactSubtitle}
        </p>

        {/* Formulário — REUTILIZAR ContactForm existente (não modificar!) */}
        <ContactForm />
      </div>
    </section>
  );
}
