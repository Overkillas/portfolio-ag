import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/i18n/dictionaries";
import { getLocalizedProject } from "@/lib/projects";
import { CaseShell } from "@/components/case-study/CaseShell";
import { PontosSemNoCase } from "@/components/case-study/cases";

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

  return (
    <CaseShell project={project} dict={dict}>
      <PontosSemNoCase project={project} />
    </CaseShell>
  );
}
