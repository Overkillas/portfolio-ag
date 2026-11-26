import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/i18n/dictionaries";
import { CaseTopBar } from "@/components/case-study/CaseTopBar";
import { CareerView } from "@/components/career/CareerView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.metadata.career,
    alternates: {
      languages: {
        "pt-BR": "/pt-BR/carreira",
        en: "/en/carreira",
        "x-default": "/pt-BR/carreira",
      },
    },
  };
}

/**
 * Minha carreira (Figma EGDJU9UG5XmLO6zV8Howwo, frame 201:53), aberta pelo bloco de
 * carreira da home (home.tiles.career). Sem o header do site (HeaderRouter): a barra do
 * topo traz o voltar (home), o seletor de idioma e "projetos", como no Figma.
 */
export default async function CarreiraPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return <CareerView dict={dict} top={<CaseTopBar locale={lang} dict={dict} variant="career" />} />;
}
