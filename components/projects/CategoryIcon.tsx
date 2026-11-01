import type { CategoryKey } from '@/lib/site';
import s from './projects.module.css';

/** Ícones das pílulas: PNG usado como máscara, então herdam a cor do texto. */
const ICON_CLASS: Record<CategoryKey, string> = {
  servicos: s.iconServicos,
  '3d': s.icon3d,
  interacao: s.iconInteracao,
  grafico: s.iconGrafico,
};

export function CategoryIcon({ category }: { category: CategoryKey }) {
  return <span className={`${s.icon} ${ICON_CLASS[category]}`} aria-hidden />;
}

export function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--blue-500)"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5 5" />
    </svg>
  );
}
