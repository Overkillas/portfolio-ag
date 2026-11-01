import type { LocalizedProject } from "@/lib/projects";
import { CaseSection, CaseImage } from "@/components/case-study/CaseShell";

const base = "/images/projects/batuco-tuco";

/** Corpo do case (tudo entre `<CaseShell>` e `</CaseShell>`), reutilizado pela página e pelo modal. */
export function BatucoTucoCase({ project }: { project: LocalizedProject }) {
  const cp = project.sections.creationProcess;
  const protoTabs = project.sections.prototyping.tabs;
  const protoImages = project.sections.prototyping.images;

  return (
    <>
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
    </>
  );
}
