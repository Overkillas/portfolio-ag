import { connection } from "next/server";
import type { Dictionary, Locale } from "@/i18n/dictionaries";
import {
  getLocalizedProject,
  getRandomOtherSlugs,
  type LocalizedProject,
  type Slug,
} from "@/lib/projects";
import { bodyFontBold } from "./CaseShell";
import s from "./cases/batuco.module.css";

/**
 * "Talvez você goste..." (Figma node 17:2862): dois outros projetos sorteados a
 * cada visita, cada card com a capa do projeto de destino (669.59 × 376.64,
 * cantos de 26.24px). Só na página completa dos cases 'wide'.
 *
 * O sorteio é no servidor, por requisição (`connection()`): sem diferença entre
 * o HTML do servidor e a hidratação e sem a ordem "pular" depois de carregar —
 * em troca, a página do case deixa de ser pré-renderizada no build.
 *
 * Os links são `<a>` simples (navegação de página inteira): um `next/link` daqui
 * para outro case seria interceptado e abriria o modal (AGENTS.md, armadilha 7).
 */
export async function RelatedProjects({
  slug,
  locale,
  dict,
}: {
  slug: Slug;
  locale: Locale;
  dict: Dictionary;
}) {
  await connection();
  const projects = getRandomOtherSlugs(slug, 2)
    .map((other) => getLocalizedProject(other, dict))
    .filter((p): p is LocalizedProject & { coverImage: string } => Boolean(p?.coverImage));
  if (projects.length === 0) return null;

  return (
    // Figma: 32px abaixo do balão de agradecimento; 15.306px do título aos cards.
    <section aria-labelledby="related-projects" className="mt-8 flex flex-col gap-[15.306px]">
      <h2
        id="related-projects"
        className={`text-[1.75rem] text-[color:var(--color-blue)] md:text-[2rem] ${s.title}`}
        style={bodyFontBold}
      >
        {dict.projectsPage.related}
      </h2>
      {/* Animações da guia: grade surge ao rolar (.rv); no hover o card sobe com sombra e
          a capa dá zoom (.card/.cardImg); cursor "ver projeto →" (data-cursor). */}
      <ul className={`grid gap-[15px] md:grid-cols-2 ${s.rv}`}>
        {projects.map((project) => (
          <li key={project.slug}>
            <a
              href={`/${locale}/projetos/${project.slug}`}
              aria-label={dict.projectsPage.openProject.replace("{title}", project.title)}
              data-cursor="card"
              className={`block overflow-hidden rounded-[26.239px] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#0e488b] ${s.card}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.coverImage}
                alt=""
                className={`block aspect-[669.59/376.645] w-full object-cover ${s.cardImg}`}
                style={{ objectPosition: project.grid.objectPosition }}
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
