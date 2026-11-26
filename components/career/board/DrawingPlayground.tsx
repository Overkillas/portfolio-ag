'use client';

import { useReducer, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { Dictionary } from '@/i18n/dictionaries';
import { at } from '../layout';
import s from '../career.module.css';
import { TOOL_NAMES, type Tool } from './glyphs';
import { boardReducer, initialBoardState } from './machine';
import { MagicBoard } from './MagicBoard';
import { ToolBlocks } from './ToolBlocks';

/**
 * "hora do desenho": a lousa mágica e os blocos das ferramentas brincam juntos.
 * O bloco vira com o mouse por cima; um clique nele já escolhe a ferramenta: a bolinha
 * apaga a lousa, a caneta sai do suporte e desenha o ícone. Depois disso dá para apagar
 * com a bolinha e desenhar com a caneta (um clique fora da lousa a guarda).
 *
 * Posições do Figma 226:56 (as do 201:53 + (51.66, 2109.13) na lousa e + (51.91, 2096.31)
 * nos blocos): lousa em (155.66, 6859.13) com 1151, blocos em (1348.91, 7009.31) com 272.
 * `children` são os textos do meio.
 */

const QUERY = '(prefers-reduced-motion: reduce)';
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(QUERY);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};

/** Cubos de verso só no cliente e sem movimento reduzido (o servidor renderiza o Figma). */
function useArmed() {
  return useSyncExternalStore(subscribe, () => !window.matchMedia(QUERY).matches, () => false);
}

export function DrawingPlayground({
  labels,
  children,
}: {
  labels: Dictionary['career']['drawing'];
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(boardReducer, initialBoardState);
  const armed = useArmed();
  const [nudge, setNudge] = useState(false);
  const nudgeTimer = useRef(0);

  const onLocked = () => {
    setNudge(true);
    window.clearTimeout(nudgeTimer.current);
    nudgeTimer.current = window.setTimeout(() => setNudge(false), 900);
  };

  const pick = (tool: Tool) => {
    // vira (se ainda estiver de verso) e escolhe no mesmo clique
    dispatch({ type: 'flip', tool });
    dispatch({ type: 'pick', tool });
  };

  const name = state.tool ? TOOL_NAMES[state.tool] : null;
  const status = nudge
    ? labels.locked
    : name && (state.phase === 'erasing' || state.phase === 'drawing')
      ? labels.drawing.replace('{name}', name)
      : '';
  const alt = state.drawn ? labels.drawnAlt.replace('{name}', TOOL_NAMES[state.drawn]) : labels.boardAlt;

  return (
    <>
      <MagicBoard
        className={`${s.a} ${s.board}`}
        style={at(155.66, 6859.13, 1151)}
        state={state}
        dispatch={dispatch}
        alt={alt}
        eraserLabel={labels.eraser}
        onLocked={onLocked}
      />
      {children}
      <ToolBlocks
        className={`${s.a} ${s.tools}`}
        style={at(1348.91, 7009.31, 272)}
        state={state}
        armed={armed}
        nudge={nudge}
        onFlip={(tool) => dispatch({ type: 'flip', tool })}
        onPick={pick}
        labels={{ group: labels.blocksLabel, flip: labels.flip, draw: labels.draw }}
      />
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </>
  );
}
