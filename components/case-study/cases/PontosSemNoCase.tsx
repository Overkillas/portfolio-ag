import type { LocalizedProject } from "@/lib/projects";
import { CaseSection, CaseImage } from "@/components/case-study/CaseShell";

const base = "/images/projects/pontos-sem-no";

/** Corpo do case (tudo entre `<CaseShell>` e `</CaseShell>`), reutilizado pela página e pelo modal. */
export function PontosSemNoCase({ project }: { project: LocalizedProject }) {
  const protoTabs = project.sections.prototyping.tabs;
  const protoCaptions = project.sections.prototyping.thumbs.captions;

  return (
    <>
      <CaseSection title={project.sections.creationProcess.title}>
        {project.sections.creationProcess.paragraphs.map((p) => (
          <p
            key={p.slice(0, 24)}
            className="font-light text-[1rem] leading-relaxed text-[color:var(--color-blue)]"
          >
            {p}
          </p>
        ))}
      </CaseSection>

      {/* Sistema de identidade visual — PNG@3x do Figma (card infográfico + 3
          tiles de apoio compostos no próprio export). */}
      <CaseImage
        src={`${base}/sistema.png`}
        alt={project.sections.creationProcess.images[0] ?? ""}
      />

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
        <div className="grid grid-cols-3 gap-[clamp(0.75rem,4cqw,2rem)]">
          {protoCaptions.map((caption, i) => (
            <figure key={caption}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${base}/proto-${i + 1}.png`}
                alt={caption}
                className="block aspect-square w-full"
              />
              <figcaption className="mt-2 text-[1rem] font-normal text-[color:var(--color-blue)]">
                {caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </CaseSection>

      <CaseSection title={project.sections.finalProject.title}>
        {/* PNG@2x do Figma com os 4 blocos do projeto final (manual, biblioteca de
            personagens, variações do logo e aplicações) já empilhados. */}
        <CaseImage
          src={`${base}/projeto-final.webp`}
          alt={project.sections.finalProject.images[0] ?? ""}
        />
      </CaseSection>
    </>
  );
}
