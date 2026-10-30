import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/i18n/dictionaries";
import { getLocalizedProject } from "@/lib/projects";
import { CaseShell, CaseSection, CaseImage } from "@/components/case-study/CaseShell";

const base = "/images/projects/batuco-tuco";

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

  const cp = project.sections.creationProcess;
  const protoTabs = project.sections.prototyping.tabs;
  const protoImages = project.sections.prototyping.images;

  return (
    <CaseShell project={project} dict={dict}>
      <CaseSection title={cp.title}>
        {cp.paragraphs.map((p) => (
          <p
            key={p.slice(0, 24)}
            className="font-light text-[1rem] leading-relaxed text-[color:var(--color-blue)]"
          >
            {p}
          </p>
        ))}
      </CaseSection>

      {/* Infográfico "Interfaces Gráficas" + linha de rabiscos/wireframes.
          Blocos densos do Figma — card (bg+rounded) já embutido no export. */}
      <div className="flex flex-col gap-6">
        <CaseImage
          src={`${base}/interfaces-graficas.png`}
          alt={cp.images[0] ?? ""}
        />
        <CaseImage src={`${base}/proto-row.png`} alt={cp.images[1] ?? ""} />
      </div>

      <CaseSection title={project.sections.prototyping.title}>
        <div className="mb-6 flex flex-wrap gap-4">
          {protoTabs.map((tab) => (
            <span
              key={tab}
              className="rounded-full bg-[color:var(--color-blue-pale)] px-3 py-1.5 text-[1rem] font-normal leading-none text-[color:var(--color-blue)] shadow-[2px_4px_8px_2px_rgba(111,150,206,0.16)]"
            >
              {tab}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-8">
          <CaseImage src={`${base}/telas-1.png`} alt={protoImages[0] ?? ""} />
          <CaseImage src={`${base}/telas-2.png`} alt={protoImages[1] ?? ""} />
          <CaseImage src={`${base}/telas-3.png`} alt={protoImages[2] ?? ""} />
        </div>
      </CaseSection>
    </CaseShell>
  );
}