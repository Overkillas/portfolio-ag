import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/i18n/dictionaries";
import { getLocalizedProject } from "@/lib/projects";
import { CaseShell } from "@/components/case-study/CaseShell";
import { CaseTopBar } from "@/components/case-study/CaseTopBar";
import { RelatedProjects } from "@/components/case-study/RelatedProjects";
import { CascavelCase, CascavelHero } from "@/components/case-study/cases";
import { BatucoMotion } from "@/components/case-study/batuco/BatucoMotion";
import { ZoomButton } from "@/components/case-study/batuco/Zoom";
import { getCascavelLightbox } from "@/components/case-study/cascavel/lightbox";
import s from "@/components/case-study/cases/batuco.module.css";
import c from "@/components/case-study/cases/cascavel.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.metadata.cascavel,
    alternates: {
      languages: {
        "pt-BR": "/pt-BR/projetos/cascavel",
        en: "/en/projetos/cascavel",
        "x-default": "/pt-BR/projetos/cascavel",
      },
    },
  };
}

/**
 * Página completa do case (Figma 17:4049). As animações e interações das imagens
 * são as mesmas dos outros cases 'wide' (entrada do banner, zoom, cursor,
 * lightbox, reveal, balão e bonequinha). O modal sobre /projetos usa o mesmo
 * corpo sem o lightbox.
 */
export default async function CascavelPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const project = getLocalizedProject("cascavel", dict);
  if (!project) notFound();
  const lightbox = getCascavelLightbox(project, dict);
  if (!lightbox) notFound();

  return (
    <BatucoMotion items={lightbox.items}>
      <CaseShell
        project={project}
        dict={dict}
        cover={
          <ZoomButton index={0} label={lightbox.labels[0]} className={`${s.heroIn} ${c.heroWide}`}>
            <CascavelHero project={project} />
          </ZoomButton>
        }
        top={<CaseTopBar locale={lang} dict={dict} />}
        bottom={<RelatedProjects slug="cascavel" locale={lang} dict={dict} />}
        thanksMotion={{ bubble: s.bubble, face: s.face }}
      >
        <CascavelCase project={project} zoom={lightbox.labels} />
      </CaseShell>
    </BatucoMotion>
  );
}
