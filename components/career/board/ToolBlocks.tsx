'use client';

import type { CSSProperties } from 'react';
import { TOOL_NAMES, type Tool } from './glyphs';
import { isBusy, type BoardState } from './machine';
import k from './blocks.module.css';

/**
 * Os blocos das ferramentas (Figma 201:621). Cada cubo é o SVG do Figma numa caixa de
 * 125.897 × 144.398 girada 24.72°, centrada num wrapper de 174.751 × 183.818
 * (get_design_context do 201:621). O x do wrapper é o da metadata − 60.5 (registrado contra
 * o render 2x: MAE 1.3/255). Coordenadas relativas à ilha (1297, 4913), 272 de largura.
 *
 * Passar o mouse vira o cubo; um clique (ou toque, ou Enter) vira e já desenha, sem
 * precisar de dois cliques (`onPick` = flip + pick no DrawingPlayground).
 *
 * O verso é o mesmo SVG só com as três faces (sem o ícone). O empilhamento segue o Figma:
 * a coluna da esquerda fica por cima da direita, e os de cima por cima dos de baixo.
 */
const CUBES: { tool: Tool; x: number; y: number; z: number }[] = [
  { tool: 'blender', x: -13.102, y: -27.999, z: 8 },
  { tool: 'ae', x: 118.898, y: -27.999, z: 4 },
  { tool: 'indesign', x: -16.103, y: 99.001, z: 7 },
  { tool: 'figma', x: 115.898, y: 99.001, z: 3 },
  { tool: 'clipstudio', x: -19.102, y: 226.001, z: 6 },
  { tool: 'animate', x: 112.898, y: 226.001, z: 2 },
  { tool: 'photoshop', x: -22.102, y: 353.001, z: 5 },
  { tool: 'illustrator', x: 109.898, y: 353.001, z: 1 },
];

export function ToolBlocks({
  state,
  armed,
  nudge,
  onFlip,
  onPick,
  labels,
  className = '',
  style,
}: {
  state: BoardState;
  /** depois da hidratação e sem movimento reduzido: os cubos começam de verso */
  armed: boolean;
  nudge: boolean;
  onFlip: (tool: Tool) => void;
  onPick: (tool: Tool) => void;
  labels: { group: string; flip: string; draw: string };
  className?: string;
  style?: CSSProperties;
}) {
  const busy = isBusy(state);
  return (
    <div className={className} style={style}>
    <ul className={k.blocks} aria-label={labels.group} data-armed={armed || undefined} data-nudge={nudge || undefined}>
      {CUBES.map(({ tool, x, y, z }, i) => {
        const up = !armed || state.revealed.includes(tool);
        const label = up ? labels.draw.replace('{name}', TOOL_NAMES[tool]) : labels.flip.replace('{n}', String(i + 1));
        return (
          <li key={tool} className={k.cube} style={{ '--x': x, '--y': y, '--z': z } as CSSProperties}>
            <button
              type="button"
              className={k.hit}
              aria-label={label}
              aria-disabled={(up && busy) || undefined}
              data-down={!up || undefined}
              data-active={(busy && state.tool === tool) || undefined}
              // o mouse vira o cubo ao passar; o clique vira (se faltar) e já desenha
              onPointerEnter={(e) => {
                if (!up && e.pointerType === 'mouse') onFlip(tool);
              }}
              onClick={() => onPick(tool)}
            >
              <span className={k.card}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={k.face} src={`/images/carreira/blocos/${tool}.svg`} alt="" width={131.075} height={149.396} loading="lazy" decoding="async" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={`${k.face} ${k.back}`} src={`/images/carreira/blocos/${tool}-verso.svg`} alt="" width={131.075} height={149.396} loading="lazy" decoding="async" />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
    </div>
  );
}
