import Link from "next/link";
import type { Dictionary, Locale } from "@/i18n/dictionaries";
import type { LocalizedProject } from "@/lib/projects";

const accentClasses: Record<LocalizedProject["accent"], string> = {
  blue: "bg-[color:var(--color-blue)]",
  orange: "bg-[color:var(--color-orange)]",
  pink: "bg-[color:var(--color-pink)]",
};

function Pill({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-[color:var(--color-blue-soft)] px-3.5 py-1 text-base font-normal text-[color:var(--color-blue)] whitespace-nowrap">
      {children}
    </span>
  );
}

/** Ícone de engrenagem (estado "em breve" — "si:settings-cute-line" no Figma). */
function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function ProjectCard({
  project,
  locale,
  dict,
}: {
  project: LocalizedProject;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <Link
      href={`/${locale}/projetos/${project.slug}`}
      className="group block"
    >
      {/* Header — subtítulo (Clother Bold 26px) + ícone.
          Override do fontFamily: a regra global em globals.css força h1-h4 a usar
          a fonte display (AM Novecento), mas o subtítulo é Clother Bold. */}
      <div className="mb-2 flex items-end justify-between gap-3">
        <h3
          className="font-bold text-[1.625rem] leading-tight text-[color:var(--color-blue)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {project.cardTitle ?? project.subtitle}
        </h3>
        <span
          aria-hidden
          className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-[color:var(--color-blue-soft)] transition-transform group-hover:translate-x-0.5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/card-icon.svg"
            alt=""
            className="block h-[18px] w-[18px]"
          />
        </span>
      </div>

      {/* Capa — imagem real do Figma quando disponível, senão fallback de cor + título */}
      <div
        className={`shadow-card relative flex aspect-[640/238] items-center justify-center overflow-hidden rounded-[8px] ${project.coverImage ? "" : accentClasses[project.accent]}`}
      >
        {project.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.coverImage}
            alt={dict.projects.coverAlt.replace("{title}", project.title)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="px-6 text-center font-display text-4xl md:text-5xl uppercase leading-none text-[color:var(--color-cream)]">
            {project.title}
          </span>
        )}
      </div>

      {/* Pills — tipo · categoria (esquerda) · data (direita) */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {project.tags.map((tag) => (
          <Pill key={tag}>{tag}</Pill>
        ))}
        {project.date && (
          <span className="ml-auto">
            <Pill>{project.date}</Pill>
          </span>
        )}
      </div>

      {/* Descrição com "Ver mais." inline ao fim do texto (parte do parágrafo,
          como no Figma) — não mais um bloco separado à direita. */}
      <p className="mt-3 text-base leading-relaxed text-[color:var(--color-blue)]">
        {project.description}{" "}
        <span className="font-bold whitespace-nowrap group-hover:underline">
          {dict.projects.seeMore}
        </span>
      </p>
    </Link>
  );
}

export function PlaceholderCard({ dict }: { dict: Dictionary }) {
  return (
    <div className="block" aria-label={dict.projects.comingSoon}>
      <div className="mb-2 flex items-end justify-between">
        <h3 className="font-bold text-[1.625rem] leading-tight text-[color:var(--color-muted)]">
          {dict.projects.comingSoon}
        </h3>
      </div>
      <div className="bg-placeholder shadow-card flex aspect-[640/238] items-center justify-center rounded-[8px]">
        <GearIcon className="h-[90px] w-[90px] text-[color:var(--color-cream)]/85" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-[color:var(--color-blue-soft)]/50 px-3.5 py-1 text-base text-[color:var(--color-muted)]">
          {dict.projects.comingSoonTag}
        </span>
      </div>
    </div>
  );
}