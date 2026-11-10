import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/i18n/dictionaries";
import { getLocalizedProject } from "@/lib/projects";
import { CaseShell } from "@/components/case-study/CaseShell";
import { CaseTopBar } from "@/components/case-study/CaseTopBar";
import { RelatedProjects } from "@/components/case-study/RelatedProjects";
import { PontosSemNoCase, PontosSemNoHero } from "@/components/case-study/cases";
import { BatucoMotion } from "@/components/case-study/batuco/BatucoMotion";
import { ZoomButton } from "@/components/case-study/batuco/Zoom";
import { getPontosSemNoLightbox } from "@/components/case-study/pontos-sem-no/lightbox";
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
    title: dict.metadata.pontosSemNo,
    alternates: {
      languages: {
        "pt-BR": "/pt-BR/projetos/pontos-sem-no",
        en: "/en/projetos/pontos-sem-no",
        "x-default": "/pt-BR/projetos/pontos-sem-no",
      },
    },
  };
}

/**
 * Página completa do case (Figma 17:899). As animações e interações das imagens
 * são as mesmas do Batuco-tuco, do Pontinhas soltas e do Caju (entrada do banner,
 * zoom, cursor, lightbox, reveal, balão e bonequinha). O modal sobre /projetos usa
 * o mesmo corpo sem o lightbox.
 */
export default async function PontosSemNoPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const project = getLocalizedProject("pontos-sem-no", dict);
  if (!project) notFound();
  const lightbox = getPontosSemNoLightbox(project, dict);
  if (!lightbox) notFound();

  return (
    <BatucoMotion items={lightbox.items}>
      <CaseShell
        project={project}
        dict={dict}
        cover={
          <ZoomButton index={0} label={lightbox.labels[0]} className={s.heroIn}>
            <PontosSemNoHero project={project} />
          </ZoomButton>
        }
        top={<CaseTopBar locale={lang} dict={dict} />}
        bottom={<RelatedProjects slug="pontos-sem-no" locale={lang} dict={dict} />}
        thanksMotion={{ bubble: s.bubble, face: s.face }}
      >
        <PontosSemNoCase project={project} zoom={lightbox.labels} />
      </CaseShell>
    </BatucoMotion>
  );
}
