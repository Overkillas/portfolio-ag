import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/i18n/dictionaries";
import { getLocalizedProject } from "@/lib/projects";
import { CaseShell } from "@/components/case-study/CaseShell";
import { CaseTopBar } from "@/components/case-study/CaseTopBar";
import { RelatedProjects } from "@/components/case-study/RelatedProjects";
import { PontinhasSoltasCase, PontinhasSoltasHero } from "@/components/case-study/cases";
import { BatucoMotion } from "@/components/case-study/batuco/BatucoMotion";
import { ZoomButton } from "@/components/case-study/batuco/Zoom";
import { getPontinhasLightbox } from "@/components/case-study/pontinhas/lightbox";
import s from "@/components/case-study/cases/batuco.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.metadata.pontinhasSoltas,
    alternates: {
      languages: {
        "pt-BR": "/pt-BR/projetos/pontinhas-soltas",
        en: "/en/projetos/pontinhas-soltas",
        "x-default": "/pt-BR/projetos/pontinhas-soltas",
      },
    },
  };
}

/**
 * Página completa do case. As animações e interações são as mesmas da página do
 * Batuco-tuco (entrada do banner, zoom, cursor, lightbox, reveal, balão e
 * bonequinha, cards); o modal sobre /projetos usa o mesmo corpo sem elas.
 */
export default async function PontinhasSoltasPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const project = getLocalizedProject("pontinhas-soltas", dict);
  if (!project) notFound();
  const lightbox = getPontinhasLightbox(project, dict);
  if (!lightbox) notFound();

  return (
    <BatucoMotion items={lightbox.items}>
      <CaseShell
        project={project}
        dict={dict}
        cover={
          <ZoomButton index={0} label={lightbox.labels[0]} className={s.heroIn}>
            <PontinhasSoltasHero project={project} />
          </ZoomButton>
        }
        top={<CaseTopBar locale={lang} dict={dict} />}
        bottom={<RelatedProjects slug="pontinhas-soltas" locale={lang} dict={dict} />}
        thanksMotion={{ bubble: s.bubble, face: s.face }}
      >
        <PontinhasSoltasCase project={project} zoom={lightbox.labels} />
      </CaseShell>
    </BatucoMotion>
  );
}
