import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/i18n/dictionaries";
import { getLocalizedProject } from "@/lib/projects";
import { CaseShell, CaseSection, CaseImage } from "@/components/case-study/CaseShell";

const base = "/images/projects/pontinhas-soltas";

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

  const cp = project.sections.creationProcess;
  const protoTabs = project.sections.prototyping.tabs;
  const protoImages = project.sections.prototyping.images;

  return (
    <CaseShell project={project} dict={dict}>
      <CaseSection title={cp.title}>
        {/* ATENÇÃO: texto do Figma é placeholder (copiado do Batuco). */}
        {cp.paragraphs.map((p) => (
          <p
            key={p.slice(0, 24)}
            className="font-light text-[1rem] leading-relaxed text-[color:var(--color-blue)]"
          >
            {p}
          </p>
        ))}
      </CaseSection>

      {/* Sistema de identidade visual (infográfico 6 etapas) + processo em 3D
          (capturas do Blender) + biblioteca de personagens (turnarounds).
          Blocos densos do Figma — card já embutido no export. */}
      <div className="flex flex-col gap-6">
        <CaseImage src={`${base}/sistema.png`} alt={cp.images[0] ?? ""} />
        <CaseImage src={`${base}/process-1.png`} alt={cp.images[1] ?? ""} />
        <CaseImage src={`${base}/process-2.png`} alt={cp.images[2] ?? ""} />
      </div>

      <CaseImage src={`${base}/biblioteca.png`} alt={cp.images[3] ?? ""} />

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
          <CaseImage
            src={`${base}/personagens.png`}
            alt={protoImages[0] ?? ""}
          />
          <CaseImage
            src={`${base}/personagens-desc.png`}
            alt={protoImages[1] ?? ""}
          />
        </div>
      </CaseSection>
    </CaseShell>
  );
}