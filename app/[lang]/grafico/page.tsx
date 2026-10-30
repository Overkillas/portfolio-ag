import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/i18n/dictionaries";
import { CategoryPage } from "@/components/home/CategoryPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.metadata.grafico,
    alternates: {
      languages: { "pt-BR": "/pt-BR/grafico", en: "/en/grafico", "x-default": "/pt-BR/grafico" },
    },
  };
}

export default async function GraficoPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return <CategoryPage category="grafico" dict={dict} locale={lang} />;
}