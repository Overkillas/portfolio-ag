import type { Tool } from './glyphs';

/**
 * Sequência da brincadeira da lousa:
 *  idle ─pick→ erasing ─erased→ drawing ─drawn→ returning ─home→ idle
 *  idle ─grab→ holding ─release→ returning ─home→ idle   (só depois do 1º desenho)
 *  holding/returning ─pick→ erasing   (escolher um cubo com a caneta na mão ou voltando)
 * Virar um cubo (flip) vale a qualquer momento; escolher (pick) só fora de apagar/desenhar.
 * Clicar num cubo com a caneta na mão primeiro a guarda (release, clique fora da lousa) e
 * logo em seguida escolhe: por isso `pick` vale também em `returning`. Os efeitos de
 * apagar/desenhar partem da pose atual da caneta, então não precisa esperar ela chegar.
 */
export type Phase = 'idle' | 'erasing' | 'drawing' | 'returning' | 'holding';

export type BoardState = {
  phase: Phase;
  /** ferramenta sendo desenhada (erasing/drawing) */
  tool: Tool | null;
  /** última ferramenta desenhada na lousa */
  drawn: Tool | null;
  revealed: readonly Tool[];
  /** bolinha e caneta liberadas depois do primeiro desenho */
  unlocked: boolean;
};

export type BoardEvent =
  | { type: 'flip'; tool: Tool }
  | { type: 'pick'; tool: Tool }
  | { type: 'erased' }
  | { type: 'drawn' }
  | { type: 'grab' }
  | { type: 'release' }
  | { type: 'home' };

export const initialBoardState: BoardState = {
  phase: 'idle',
  tool: null,
  drawn: null,
  revealed: [],
  unlocked: false,
};

export function boardReducer(state: BoardState, event: BoardEvent): BoardState {
  switch (event.type) {
    case 'flip':
      return state.revealed.includes(event.tool) ? state : { ...state, revealed: [...state.revealed, event.tool] };
    case 'pick':
      if (isBusy(state) || !state.revealed.includes(event.tool)) return state;
      return { ...state, phase: 'erasing', tool: event.tool };
    case 'erased':
      return state.phase === 'erasing' ? { ...state, phase: 'drawing' } : state;
    case 'drawn':
      return state.phase === 'drawing'
        ? { ...state, phase: 'returning', drawn: state.tool, tool: null, unlocked: true }
        : state;
    case 'grab':
      return state.phase === 'idle' && state.unlocked ? { ...state, phase: 'holding' } : state;
    case 'release':
      return state.phase === 'holding' ? { ...state, phase: 'returning' } : state;
    case 'home':
      return state.phase === 'returning' ? { ...state, phase: 'idle' } : state;
  }
}

/** A bolinha pode ser arrastada? (a caneta usa `grab`, que já checa o mesmo) */
export const canErase = (s: BoardState): boolean => s.phase === 'idle' && s.unlocked;
/** Apagando ou desenhando sozinha: os cubos esperam. */
export const isBusy = (s: BoardState): boolean => s.phase === 'erasing' || s.phase === 'drawing';
