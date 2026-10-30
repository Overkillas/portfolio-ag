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
    title: dict.metadata["3d"],
    alternates: {
      languages: { "pt-BR": "/pt-BR/3d", en: "/en/3d", "x-default": "/pt-BR/3d" },
    },
  };
}

export default async function ThreeDPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return <CategoryPage category="3d" dict={dict} locale={lang} />;
}