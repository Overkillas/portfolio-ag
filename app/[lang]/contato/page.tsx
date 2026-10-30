import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandHero } from "@/components/layout/BrandHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { Illustration } from "@/components/home/Illustration";
import { getDictionary, isLocale } from "@/i18n/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.metadata.contato,
    alternates: {
      languages: { "pt-BR": "/pt-BR/contato", en: "/en/contato", "x-default": "/pt-BR/contato" },
    },
  };
}

export default async function ContatoPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <BrandHero title={dict.site.name} />
      <div className="container-narrow py-12">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            {/* Figma: AM Novecento ~39px #6f96ce. Quebra natural -> "Vamos trabalhar" / "juntos?". */}
            <h2
              className="font-display uppercase text-[color:var(--color-blue)] text-[2rem] md:text-[2.375rem] leading-tight tracking-tight mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {dict.contact.title}
            </h2>

            {/* Figma: subtexto é Clother Regular (400); o peso global é 300, fixo o 400. */}
            <p className="font-normal text-[1.125rem] text-[color:var(--color-blue)] mb-6 leading-relaxed">
              {dict.contact.subtitle}
            </p>

            <ContactForm />
          </div>

          <Illustration
            name="contato"
            alt={dict.contact.illustrationAlt}
            maxWidth={440}
            className="hidden md:block mx-auto"
          />
        </div>
      </div>
    </>
  );
}