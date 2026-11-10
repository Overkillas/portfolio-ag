import type { ReactNode } from "react";
import type { LocalizedProject, Slug } from "@/lib/projects";
import type { CaseAsideLayout } from "@/components/case-study/CaseShell";
import { PontosSemNoCase, PontosSemNoHero } from "./PontosSemNoCase";
import { BatucoTucoCase } from "./BatucoTucoCase";
import { BatucoTucoHero } from "./BatucoTucoHero";
import { PontinhasSoltasCase } from "./PontinhasSoltasCase";
import { PontinhasSoltasHero } from "./PontinhasSoltasHero";
import { IdentidadeEventoCase, IdentidadeEventoHero } from "./IdentidadeEventoCase";
import { CajuCase, CajuHero } from "./CajuCase";
import { CascavelCase, CascavelHero } from "./CascavelCase";

export {
  PontosSemNoCase,
  PontosSemNoHero,
  BatucoTucoCase,
  BatucoTucoHero,
  PontinhasSoltasCase,
  PontinhasSoltasHero,
  IdentidadeEventoCase,
  IdentidadeEventoHero,
  CajuCase,
  CajuHero,
  CascavelCase,
  CascavelHero,
};

/** Slug → corpo do case, para reutilizar fora da página completa (ex.: no modal). */
export const caseBodies: Record<
  Slug,
  (props: { project: LocalizedProject }) => ReactNode
> = {
  "pontos-sem-no": PontosSemNoCase,
  "batuco-tuco": BatucoTucoCase,
  "pontinhas-soltas": PontinhasSoltasCase,
  "identidade-evento-15-anos": IdentidadeEventoCase,
  caju: CajuCase,
  cascavel: CascavelCase,
};

/** Partes do topo do case que ficam fora do corpo (props extras do `CaseShell`). */
export type CaseSlots = {
  /** Substitui a capa padrão (ex.: capa clicável que abre o lightbox). */
  cover?: ReactNode;
  aside?: ReactNode;
  asideLayout?: CaseAsideLayout;
  headerExtra?: ReactNode;
};

/**
 * Slug → slots do topo. A página completa e o modal chamam a mesma função, então
 * o case fica igual nos dois. `coverClassName` é a animação de entrada da capa
 * no modal (`heroIn`).
 */
export type CaseSlotsFn = (
  project: LocalizedProject,
  opts: { coverClassName?: string },
) => CaseSlots;

export const caseSlots: Partial<Record<Slug, CaseSlotsFn>> = {};

/**
 * Slug → capa própria do case (no lugar da `<img>` do `coverImage`, que fica só
 * no card). Página completa e modal usam a mesma, como em `caseBodies`.
 */
export const caseCovers: Partial<
  Record<Slug, (props: { project: LocalizedProject }) => ReactNode>
> = {
  "pontos-sem-no": PontosSemNoHero,
  "batuco-tuco": BatucoTucoHero,
  "pontinhas-soltas": PontinhasSoltasHero,
  "identidade-evento-15-anos": IdentidadeEventoHero,
  caju: CajuHero,
  cascavel: CascavelHero,
};
