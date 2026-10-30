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
    title: dict.metadata.servicos,
    alternates: {
      languages: { "pt-BR": "/pt-BR/servicos", en: "/en/servicos", "x-default": "/pt-BR/servicos" },
    },
  };
}

export default async function ServicosPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <CategoryPage
      category="servicos"
      dict={dict}
      locale={lang}
      placeholderCount={3}
    />
  );
}