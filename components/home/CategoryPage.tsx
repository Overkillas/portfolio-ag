import { BrandHero } from "@/components/layout/BrandHero";
import { ProjectCard, PlaceholderCard } from "./ProjectCard";
import { getLocalizedProjectsByCategory } from "@/lib/projects";
import type { Dictionary, Locale } from "@/i18n/dictionaries";
import type { CategoryKey } from "@/lib/site";

type Props = {
  category: CategoryKey;
  dict: Dictionary;
  locale: Locale;
  placeholderCount?: number;
};

export function CategoryPage({
  category,
  dict,
  locale,
  placeholderCount = 2,
}: Props) {
  const projects = getLocalizedProjectsByCategory(category, dict);
  const heroTitle = dict.categories[category].heroTitle;

  return (
    <>
      <BrandHero title={heroTitle} />
      <div className="container-narrow py-12">
        {/* Coluna de cards = 702px (largura do card no desktop do Figma), centralizada */}
        <div className="mx-auto flex max-w-[702px] flex-col gap-12">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} locale={locale} dict={dict} />
          ))}
          {Array.from({ length: placeholderCount }).map((_, i) => (
            <PlaceholderCard key={`placeholder-${i}`} dict={dict} />
          ))}
        </div>
      </div>
    </>
  );
}