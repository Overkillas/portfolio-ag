import type { ReactNode } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { LocalizedProject, ProjectStatus } from "@/lib/projects";

// 'em-progresso' (slug, kebab) → 'emProgresso' (chave do dicionário, camelCase)
const statusKey: Record<ProjectStatus, keyof Dictionary["status"]> = {
  concluido: "concluido",
  "em-progresso": "emProgresso",
  "em-breve": "emBreve",
};

/** Fonte do corpo (Clother) — sobrescreve a regra global que joga h1-h4 pra display. */
const bodyFont = { fontFamily: "var(--font-body)" } as const;

/**
 * Pill do Figma. tag = Azul gelo (#bacceb), sem sombra.
 * status = azul clarinho (#e6eefa) + sombra "botoes" (2,4,8,2 @16%).
 */
function Pill({
  children,
  variant = "tag",
}: {
  children: ReactNode;
  variant?: "tag" | "status";
}) {
  // font-normal: Figma usa Clother Regular (400) nas pills; o peso global é 300.
  const base =
    "inline-flex items-center rounded-full px-3.5 py-1 text-[1rem] font-normal leading-none text-[color:var(--color-blue)] whitespace-nowrap";
  const skin =
    variant === "status"
      ? "bg-[color:var(--color-blue-pale)] shadow-[2px_4px_8px_2px_rgba(111,150,206,0.16)]"
      : "bg-[color:var(--color-blue-soft)]";
  return <span className={`${base} ${skin}`}>{children}</span>;
}

export function CaseShell({
  project,
  dict,
  cover,
  children,
}: {
  project: LocalizedProject;
  dict: Dictionary;
  cover?: ReactNode;
  children: ReactNode;
}) {
  const intro = project.intro ?? project.description;

  return (
    <article className="container-narrow py-12">
      {/* Coluna de conteúdo = 786px (largura do conteúdo do case no desktop
          do Figma — frame Responsividade/MacBook). Centralizada. */}
      <div className="mx-auto max-w-[786px]">
        {cover ??
          (project.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.coverImage}
              alt={dict.projects.coverAlt.replace("{title}", project.title)}
              className="shadow-card block w-full rounded-[8px]"
            />
          ))}

        {/* Subtítulo (Clother Bold 26px) + status */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <h1
            className="font-bold text-[1.625rem] leading-tight text-[color:var(--color-blue)]"
            style={bodyFont}
          >
            {project.subtitle}
          </h1>
          <Pill variant="status">{dict.status[statusKey[project.status]]}</Pill>
        </div>

        {/* Tags (esquerda) + data (direita) */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {project.tags.map((tag) => (
            <Pill key={tag}>{tag}</Pill>
          ))}
          {project.date && (
            <span className="ml-auto">
              <Pill>{project.date}</Pill>
            </span>
          )}
        </div>

        {/* Intro — Clother Light 16px, parágrafos preservando as quebras do Figma */}
        {intro && (
          <div className="mt-6 flex flex-col gap-4 font-light text-[1rem] leading-relaxed text-[color:var(--color-blue)]">
            {intro.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-col gap-12">{children}</div>

        {/* Figma: Clother Regular (400); o peso global é 300, fixo o 400. */}
        <p
          className="mt-16 font-normal text-[2rem] leading-tight text-[color:var(--color-blue)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {project.thanks}
        </p>
      </div>
    </article>
  );
}

/** Título de seção do case — Clother Bold 26px (NÃO é a fonte display). */
export function CaseSection({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <section>
      <h2
        className="mb-5 font-bold text-[1.625rem] leading-tight text-[color:var(--color-blue)]"
        style={bodyFont}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Bloco visual achatado do Figma.
 *
 * Não aplica sombra/rounded externos — os screenshots dos frames do Figma já
 * trazem o card (bg+rounded+shadow) embutido. Adicionar wrapper aqui cria
 * "caixa em volta de caixa".
 */
export function CaseImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`block w-full ${className ?? ""}`} />
  );
}
