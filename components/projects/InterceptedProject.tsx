import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/i18n/dictionaries";
import { getLocalizedProject, getNextSlug, slugToKey, type Slug } from "@/lib/projects";
import { CaseShell } from "@/components/case-study/CaseShell";
import { caseBodies } from "@/components/case-study/cases";
import { ProjectModal } from "./ProjectModal";
import s from "./projects.module.css";

/**
 * Case aberto em modal por cima do índice. Só é renderizado em navegação no
 * cliente a partir de /{lang}/projetos (rota interceptada); aberto direto pela
 * URL ou recarregado, quem responde é a página completa do case.
 *
 * Implementação compartilhada pelas pastas `@modal/(.)<slug>`: uma por projeto,
 * como as páginas completas. O `(.)[slug]` dinâmico responde 500 no `next dev`
 * (Turbopack) desta versão do Next ("Invalid interception route … (.)(.)slug").
 */
export async function InterceptedProject({
  params,
  slug,
}: {
  params: Promise<{ lang: string }>;
  slug: Slug;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const project = getLocalizedProject(slug, dict);
  if (!project) notFound();
  const nextProject = getLocalizedProject(getNextSlug(slug), dict);
  if (!nextProject) notFound();
  const Body = caseBodies[slug];

  return (
    <ProjectModal
      slug={slug}
      title={project.title}
      documentTitle={`${dict.metadata[slugToKey[slug]]} · ${dict.site.name}`}
      nextHref={`/${lang}/projetos/${nextProject.slug}`}
      nextTitle={nextProject.title}
    >
      <CaseShell
        project={project}
        dict={dict}
        motion={{ cover: s.heroIn, header: s.revealHeader, body: s.revealBody }}
      >
        <Body project={project} />
      </CaseShell>
    </ProjectModal>
  );
}
