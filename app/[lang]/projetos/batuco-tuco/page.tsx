import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/i18n/dictionaries";
import { getLocalizedProject } from "@/lib/projects";
import { CaseShell } from "@/components/case-study/CaseShell";
import { BatucoTucoCase } from "@/components/case-study/cases";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.metadata.batucoTuco,
    alternates: {
      languages: {
        "pt-BR": "/pt-BR/projetos/batuco-tuco",
        en: "/en/projetos/batuco-tuco",
        "x-default": "/pt-BR/projetos/batuco-tuco",
      },
    },
  };
}

export default async function BatucoTucoPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const project = getLocalizedProject("batuco-tuco", dict);
  if (!project) notFound();

  return (
    <CaseShell project={project} dict={dict}>
      <BatucoTucoCase project={project} />
    </CaseShell>
  );
}
