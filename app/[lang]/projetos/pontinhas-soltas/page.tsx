import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/i18n/dictionaries";
import { getLocalizedProject } from "@/lib/projects";
import { CaseShell } from "@/components/case-study/CaseShell";
import { PontinhasSoltasCase } from "@/components/case-study/cases";

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

  return (
    <CaseShell project={project} dict={dict}>
      <PontinhasSoltasCase project={project} />
    </CaseShell>
  );
}
