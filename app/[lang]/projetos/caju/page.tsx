import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/i18n/dictionaries";
import { getLocalizedProject } from "@/lib/projects";
import { CaseShell } from "@/components/case-study/CaseShell";
import { CaseTopBar } from "@/components/case-study/CaseTopBar";
import { RelatedProjects } from "@/components/case-study/RelatedProjects";
import { CajuCase, CajuHero } from "@/components/case-study/cases";
import { BatucoMotion } from "@/components/case-study/batuco/BatucoMotion";
import { ZoomButton } from "@/components/case-study/batuco/Zoom";
import { getCajuLightbox } from "@/components/case-study/caju/lightbox";
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
    title: dict.metadata.caju,
    alternates: {
      languages: {
        "pt-BR": "/pt-BR/projetos/caju",
        en: "/en/projetos/caju",
        "x-default": "/pt-BR/projetos/caju",
      },
    },
  };
}

/**
 * Página completa do case (Figma 17:5070). As animações e interações das imagens
 * são as mesmas do Batuco-tuco e do Pontinhas soltas (entrada do banner, zoom,
 * cursor, lightbox, reveal, balão e bonequinha); a pilha de páginas e o livro
 * seguem o canvas do Claude Design. O modal sobre /projetos usa o mesmo corpo sem
 * o lightbox.
 */
export default async function CajuPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const project = getLocalizedProject("caju", dict);
  if (!project) notFound();
  const lightbox = getCajuLightbox(project, dict);
  if (!lightbox) notFound();

  return (
    <BatucoMotion items={lightbox.items}>
      <CaseShell
        project={project}
        dict={dict}
        cover={
          <ZoomButton index={0} label={lightbox.labels[0]} className={s.heroIn}>
            <CajuHero project={project} />
          </ZoomButton>
        }
        top={<CaseTopBar locale={lang} dict={dict} />}
        bottom={<RelatedProjects slug="caju" locale={lang} dict={dict} />}
        thanksMotion={{ bubble: s.bubble, face: s.face }}
      >
        <CajuCase project={project} zoom={lightbox.labels} />
      </CaseShell>
    </BatucoMotion>
  );
}
