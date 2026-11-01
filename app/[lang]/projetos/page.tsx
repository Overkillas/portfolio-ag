import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectsIndex } from "@/components/projects/ProjectsIndex";
import { getDictionary, isLocale } from "@/i18n/dictionaries";
import { getLocalizedProjects } from "@/lib/projects";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.metadata.projetos,
    alternates: {
      languages: {
        "pt-BR": "/pt-BR/projetos",
        en: "/en/projetos",
        "x-default": "/pt-BR/projetos",
      },
    },
  };
}

export default async function ProjetosPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return <ProjectsIndex projects={getLocalizedProjects(dict)} />;
}
