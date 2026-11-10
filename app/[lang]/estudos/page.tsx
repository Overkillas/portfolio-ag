import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/i18n/dictionaries";
import { CaseTopBar } from "@/components/case-study/CaseTopBar";
import { StudiesView } from "@/components/studies/StudiesView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.metadata.studies,
    alternates: {
      languages: {
        "pt-BR": "/pt-BR/estudos",
        en: "/en/estudos",
        "x-default": "/pt-BR/estudos",
      },
    },
  };
}

/**
 * Estudos (Figma EGDJU9UG5XmLO6zV8Howwo, frame 17:2174), aberta pelo bloco
 * "Estudos" da home. Sem o header do site (HeaderRouter): a barra do topo traz o
 * voltar, o seletor de idioma e o "sobre", como nos cases de página completa.
 */
export default async function EstudosPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return <StudiesView top={<CaseTopBar locale={lang} dict={dict} variant="about" />} />;
}
