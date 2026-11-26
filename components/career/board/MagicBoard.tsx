'use client';

import { useEffect, useRef, type CSSProperties, type Dispatch, type KeyboardEvent, type PointerEvent } from 'react';
import {
  BOARD_W,
  CORD_ANCHOR,
  CORD_CANVAS,
  CORD_REST,
  HELD_BOUNDS,
  HOLDER,
  INK,
  KNOB,
  PEN,
  PEN_HELD_ROT,
  PEN_REST,
  STRIP,
  STRIP_TRACK,
  boardToInk,
  clamp,
  inkToBoard,
  insideInk,
  knobToInkX,
  onHolder,
  penFoot,
  stripShift,
  type Pt,
} from './geometry';
import { BRUSH_IMAGES, TOOL_BRUSH, type Brush, type BrushImage } from './brushes';
import { glyph, strokeLength } from './glyphs';
import { CordPainter, Ink } from './ink';
import { canErase, type BoardEvent, type BoardState } from './machine';
import { BoardSound } from './sound';
import { easeOut, loop, tween } from './tween';
import b from './board.module.css';

/**
 * A lousa mágica (Figma 201:413) viva. Camadas, de baixo para cima (todas recompõem o
 * render do Figma em repouso — MAE 0.19/255, ver o spec, Emenda 3):
 *  1. base.webp — corpo, trilho, faixa bege e suporte vazios; a tela branca;
 *  2. a tinta (canvas) — começa com os rabiscos do Figma (tinta.webp) e recebe os traços,
 *     cada um com o pincel da ferramenta (brushes.ts; spec, Emenda 6);
 *  3. o grão rosa da tela (grao.webp), por cima da tinta, como no Figma;
 *  4. a faixa bege (faixa.webp), a régua: anda com a bolinha e apaga o que fica embaixo;
 *  5. o cordão (recorte em repouso; canvas quando a caneta sai) e a bolinha (#F9F3EA);
 *  6. a caneta (SVG do Figma), que gira em torno da ponta.
 *
 * A caneta na mão: um clique nela a tira do suporte e a ponta passa a seguir o ponteiro;
 * só sai tinta com o botão apertado, no pincel da última ferramenta desenhada; um clique
 * no suporte, um clique fora da lousa (ou Esc) a guarda de volta.
 *
 * O HTML do servidor é o Figma; o canvas só assume depois de pintar os rabiscos.
 */

const IMG = '/images/carreira/lousa';
const SPEED = 650; // px de design por segundo, desenhando
const HOP = 1.06; // a caneta "levanta" entre traços

type Pose = { x: number; y: number; rot: number; lift: number };

const pos = (x: number, y: number, w: number, h: number) => ({ '--x': x, '--y': y, '--w': w, '--h': h }) as CSSProperties;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function MagicBoard({
  state,
  dispatch,
  alt,
  eraserLabel,
  onLocked,
  className = '',
  style,
}: {
  state: BoardState;
  dispatch: Dispatch<BoardEvent>;
  alt: string;
  eraserLabel: string;
  onLocked: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const inkWrapRef = useRef<HTMLDivElement>(null);
  const inkCanvasRef = useRef<HTMLCanvasElement>(null);
  const cordCanvasRef = useRef<HTMLCanvasElement>(null);
  const penRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLImageElement>(null);

  const engine = useRef<Promise<{ ink: Ink; cord: CordPainter } | null> | null>(null);
  const live = useRef<{ ink: Ink; cord: CordPainter } | null>(null);
  const pose = useRef<Pose>({ ...PEN_REST });
  const knobX = useRef<number>(KNOB.min);
  const scale = useRef(1);
  const knobDrag = useRef<{ id: number; offset: number } | null>(null);
  /** traço com a caneta na mão: o ponteiro que apertou e se a tinta já está saindo */
  const penStroke = useRef<{ id: number; inking: boolean } | null>(null);
  /** som da ponta riscando e da régua correndo (nasce no primeiro gesto na página) */
  const sound = useRef<BoardSound | null>(null);

  // ---------- aplicar pose/posição no DOM (fora do React: 60 fps) ----------
  const applyPen = () => {
    const pen = penRef.current, stage = stageRef.current;
    if (!pen || !stage) return;
    const p = pose.current, k = scale.current;
    const atRest = p.x === PEN_REST.x && p.y === PEN_REST.y && p.rot === PEN_REST.rot && p.lift === 1;
    pen.style.transform = atRest
      ? ''
      : `translate(${(p.x - PEN_REST.x) * k}px, ${(p.y - PEN_REST.y) * k}px) rotate(${p.rot}deg) scale(${p.lift})`;
    if (atRest) {
      delete stage.dataset.out;
      live.current?.cord.clear();
    } else {
      stage.dataset.out = '';
      live.current?.cord.draw(CORD_ANCHOR, penFoot(p));
    }
  };

  const applyKnob = () => {
    const knob = knobRef.current;
    if (!knob) return;
    const x = knobX.current;
    knob.style.transform = x === KNOB.min ? '' : `translateX(${(x - KNOB.min) * scale.current}px)`;
    const strip = stripRef.current;
    if (strip) strip.style.transform = x === KNOB.min ? '' : `translateX(${stripShift(x) * scale.current}px)`;
    knob.setAttribute('aria-valuenow', String(Math.round(((x - KNOB.min) / (KNOB.max - KNOB.min)) * 100)));
  };

  // ---------- montagem: imagens, canvas, resize ----------
  useEffect(() => {
    const stage = stageRef.current!, inkCanvas = inkCanvasRef.current!, cordCanvas = cordCanvasRef.current!;
    let cancelled = false;
    sound.current ??= new BoardSound();
    const disarmSound = sound.current.arm();
    const load = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    const measure = () => {
      scale.current = stage.clientWidth / BOARD_W;
      live.current?.ink.resize(INK.w * scale.current);
      live.current?.cord.resize(CORD_CANVAS.w * scale.current);
      applyPen();
      applyKnob();
    };
    const names = Object.keys(BRUSH_IMAGES) as BrushImage[];
    engine.current = Promise.all([load(`${IMG}/tinta.webp`), ...names.map((n) => load(BRUSH_IMAGES[n]))])
      .then(([tinta, ...brushes]) => {
        if (cancelled) return null;
        const images = Object.fromEntries(names.map((n, i) => [n, brushes[i]])) as Record<BrushImage, HTMLImageElement>;
        live.current = {
          ink: new Ink(inkCanvas, images),
          cord: new CordPainter(cordCanvas, images['doo-wop'], CORD_CANVAS),
        };
        measure();
        live.current.ink.image(tinta);
        inkWrapRef.current!.dataset.ready = '';
        return live.current;
      })
      .catch(() => null);
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    measure();
    return () => {
      cancelled = true;
      ro.disconnect();
      disarmSound();
    };
  }, []);

  // ---------- movimentos ----------
  const moveKnob = (to: number, ms: number, signal: AbortSignal, ink: Ink) => {
    const from = knobX.current;
    return tween(
      ms,
      (e) => {
        const x = from + (to - from) * e;
        ink.erase(knobToInkX(knobX.current), knobToInkX(x));
        knobX.current = x;
        sound.current?.at('eraser', { x, y: 0 });
        applyKnob();
      },
      signal,
    );
  };

  const movePen = (to: Pose, ms: number, signal: AbortSignal) => {
    const from = { ...pose.current };
    return tween(
      ms,
      (e) => {
        pose.current = {
          x: from.x + (to.x - from.x) * e,
          y: from.y + (to.y - from.y) * e,
          rot: from.rot + (to.rot - from.rot) * e,
          lift: from.lift + (to.lift - from.lift) * e,
        };
        applyPen();
      },
      signal,
    );
  };

  /** A caneta percorre o traço na velocidade de desenho, soltando tinta. */
  const trace = (stroke: Pt[], brush: Brush, signal: AbortSignal, ink: Ink) => {
    const cum = [0];
    for (let i = 1; i < stroke.length; i++)
      cum.push(cum[i - 1] + Math.hypot(stroke[i].x - stroke[i - 1].x, stroke[i].y - stroke[i - 1].y));
    let d = 0, i = 0;
    ink.beginStroke(stroke[0], brush, cum[cum.length - 1]);
    return loop((dt) => {
      d += SPEED * dt;
      while (i < stroke.length - 1 && cum[i + 1] <= d) ink.extend(stroke[++i]);
      const tip = inkToBoard(stroke[i]);
      sound.current?.at('pen', tip);
      pose.current = { x: tip.x, y: tip.y, rot: PEN_HELD_ROT + 3 * Math.sin(d / 45), lift: 1 };
      applyPen();
      return i < stroke.length - 1;
    }, signal);
  };

  const { phase, tool } = state;

  // apagar sozinha: a bolinha vai até o fim do trilho e volta para a posição do Figma
  useEffect(() => {
    if (phase !== 'erasing') return;
    const ac = new AbortController();
    (async () => {
      const e = await engine.current;
      if (!e || ac.signal.aborted) return;
      if (reducedMotion()) {
        e.ink.clear();
        knobX.current = KNOB.min;
        applyKnob();
      } else {
        if (!e.ink.isEmpty) {
          const span = KNOB.max - KNOB.min;
          const ok = await moveKnob(KNOB.max, 300 + (500 * (KNOB.max - knobX.current)) / span, ac.signal, e.ink);
          if (!ok || !(await moveKnob(KNOB.min, 650, ac.signal, e.ink))) return;
        } else if (knobX.current !== KNOB.min && !(await moveKnob(KNOB.min, 400, ac.signal, e.ink))) return;
        e.ink.clear();
      }
      sound.current?.up('eraser');
      if (!ac.signal.aborted) dispatch({ type: 'erased' });
    })();
    return () => {
      ac.abort();
      sound.current?.up('eraser');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // desenhar: a caneta sai do suporte, percorre os traços e levanta entre eles
  useEffect(() => {
    if (phase !== 'drawing' || !tool) return;
    const ac = new AbortController();
    (async () => {
      const e = await engine.current;
      if (!e || ac.signal.aborted) return;
      const strokes = glyph(tool);
      const brush = TOOL_BRUSH[tool];
      if (reducedMotion()) {
        for (const s of strokes) {
          e.ink.beginStroke(s[0], brush, strokeLength(s));
          for (const pt of s.slice(1)) e.ink.extend(pt);
          e.ink.endStroke();
        }
      } else {
        for (let n = 0; n < strokes.length; n++) {
          const start = inkToBoard(strokes[n][0]);
          const hop = Math.hypot(start.x - pose.current.x, start.y - pose.current.y);
          const ok = await movePen(
            { x: start.x, y: start.y, rot: PEN_HELD_ROT, lift: n === 0 ? 1 : HOP },
            n === 0 ? 700 : Math.min(320, 90 + hop * 0.6),
            ac.signal,
          );
          if (!ok || !(await trace(strokes[n], brush, ac.signal, e.ink))) return;
          e.ink.endStroke();
          sound.current?.up('pen');
        }
      }
      if (!ac.signal.aborted) dispatch({ type: 'drawn' });
    })();
    return () => {
      ac.abort();
      live.current?.ink.endStroke();
      sound.current?.up('pen');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, tool]);

  // voltar ao suporte
  useEffect(() => {
    if (phase !== 'returning') return;
    const ac = new AbortController();
    (async () => {
      if (reducedMotion()) {
        pose.current = { ...PEN_REST };
        applyPen();
      } else if (!(await movePen({ ...PEN_REST }, 650, ac.signal))) return;
      pose.current = { ...PEN_REST }; // exato, para o estado de repouso bater com o Figma
      applyPen();
      if (!ac.signal.aborted) dispatch({ type: 'home' });
    })();
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ---------- interação ----------
  const toBoard = (e: { clientX: number; clientY: number }): Pt => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * BOARD_W) / r.width, y: ((e.clientY - r.top) * BOARD_W) / r.width };
  };

  /** A ponta da caneta na mão vai para o ponteiro: quem segura a caneta desenha com a ponta. */
  const holdAt = (p: Pt) => {
    pose.current = {
      x: clamp(p.x, HELD_BOUNDS.x0, HELD_BOUNDS.x1),
      y: clamp(p.y, HELD_BOUNDS.y0, HELD_BOUNDS.y1),
      rot: PEN_HELD_ROT,
      lift: 1,
    };
  };

  /** Tinta no ponto (em B), só dentro da tela; sair da tela interrompe o traço. */
  const inkAt = (p: Pt, s: { inking: boolean }) => {
    const ink = live.current?.ink;
    if (!ink) return;
    const q = boardToInk(p);
    if (insideInk(q)) {
      if (s.inking) ink.extend(q);
      else {
        // a caneta na mão desenha com o pincel da última ferramenta desenhada
        ink.beginStroke(q, TOOL_BRUSH[state.drawn ?? 'figma']);
        s.inking = true;
      }
      sound.current?.at('pen', p);
    } else if (s.inking) {
      ink.endStroke();
      s.inking = false;
      sound.current?.up('pen');
    }
  };

  const endPenStroke = () => {
    if (penStroke.current?.inking) live.current?.ink.endStroke();
    penStroke.current = null;
    sound.current?.up('pen');
  };

  const putPenBack = () => {
    endPenStroke();
    dispatch({ type: 'release' });
  };

  // um clique na caneta (no suporte) a tira de lá; ela fica na mão até voltar ao suporte
  const onPenDown = (e: PointerEvent<HTMLDivElement>) => {
    if (phase !== 'idle' || e.button !== 0) return;
    if (!state.unlocked) return onLocked();
    if (!live.current) return;
    e.preventDefault();
    dispatch({ type: 'grab' });
    holdAt(toBoard(e));
    applyPen();
  };

  // com a caneta na mão: a ponta segue o ponteiro pela página (e na rolagem); Esc ou um
  // clique fora da lousa a guarda
  useEffect(() => {
    if (phase !== 'holding') return;
    let last: { clientX: number; clientY: number } | null = null;
    const follow = (e: globalThis.PointerEvent) => {
      const s = penStroke.current;
      const mine = s !== null && s.id === e.pointerId;
      const pressed = mine && (e.buttons & 1) === 1;
      if (mine && !pressed) endPenStroke(); // soltou fora da página
      const events = pressed ? (e.getCoalescedEvents?.() ?? []) : [];
      for (const ev of events.length ? events : [e]) {
        const p = toBoard(ev);
        holdAt(p);
        if (pressed && s) inkAt(p, s);
      }
      last = { clientX: e.clientX, clientY: e.clientY };
      applyPen();
    };
    const onScroll = () => {
      if (!last) return;
      holdAt(toBoard(last));
      applyPen();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') putPenBack();
    };
    // captura: roda antes do clique do alvo (num cubo, guarda e o clique escolhe em seguida)
    const onOutside = (e: globalThis.PointerEvent) => {
      const stage = stageRef.current;
      if (stage && e.target instanceof Node && !stage.contains(e.target)) putPenBack();
    };
    window.addEventListener('pointermove', follow);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onOutside, true);
    return () => {
      window.removeEventListener('pointermove', follow);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onOutside, true);
      endPenStroke();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // com a caneta na mão: apertar o botão desenha; clicar no suporte guarda a caneta
  const onStageDown = (e: PointerEvent<HTMLDivElement>) => {
    if (phase !== 'holding' || e.button !== 0) return;
    const p = toBoard(e);
    if (onHolder(p)) return putPenBack();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    endPenStroke();
    const s = { id: e.pointerId, inking: false };
    penStroke.current = s;
    holdAt(p);
    inkAt(p, s);
    applyPen();
  };

  const onStageUp = (e: PointerEvent<HTMLDivElement>) => {
    if (penStroke.current?.id === e.pointerId) endPenStroke();
  };

  const onKnobDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!canErase(state)) return phase === 'idle' ? onLocked() : undefined;
    if (!live.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    knobDrag.current = { id: e.pointerId, offset: toBoard(e).x - knobX.current };
  };

  const knobTo = (x: number) => {
    const ink = live.current?.ink;
    if (!ink) return;
    const to = clamp(x, KNOB.min, KNOB.max);
    ink.erase(knobToInkX(knobX.current), knobToInkX(to));
    knobX.current = to;
    sound.current?.at('eraser', { x: to, y: 0 });
    applyKnob();
  };

  const onKnobMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = knobDrag.current;
    if (!d || d.id !== e.pointerId) return;
    knobTo(toBoard(e).x - d.offset);
  };

  const onKnobUp = (e: PointerEvent<HTMLDivElement>) => {
    if (knobDrag.current?.id !== e.pointerId) return;
    knobDrag.current = null;
    sound.current?.up('eraser');
  };

  const onKnobKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 40, ArrowUp: 40, ArrowLeft: -40, ArrowDown: -40, PageUp: 160, PageDown: -160 }[e.key];
    const jump = e.key === 'Home' ? KNOB.min : e.key === 'End' ? KNOB.max : null;
    if (step === undefined && jump === null) return;
    e.preventDefault();
    if (!canErase(state)) return phase === 'idle' ? onLocked() : undefined;
    // anda em passos curtos para a régua não pular colunas
    const target = jump ?? knobX.current + step!;
    const ac = new AbortController();
    const from = knobX.current;
    void tween(180, (k) => knobTo(from + (target - from) * k), ac.signal, easeOut);
  };

  const locked = !state.unlocked;

  return (
    <div className={`${className} ${b.board}`} style={style}>
      <div
        ref={stageRef}
        className={b.stage}
        data-locked={locked || undefined}
        data-holding={phase === 'holding' || undefined}
        data-busy={(phase !== 'idle' && phase !== 'holding') || undefined}
        onPointerDown={onStageDown}
        onPointerUp={onStageUp}
        onPointerCancel={onStageUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/base.webp`} alt="" width={1151} height={709} loading="lazy" decoding="async" style={pos(0, 0, 1151, 709)} />

        {/* tela embaixo da faixa em repouso: aparece quando a faixa anda (1px a mais por baixo
            da tinta, para a borda da faixa assada na base não vazar em escala fracionária) */}
        <div className={b.underStrip} style={pos(STRIP.x, INK.y, STRIP.w + 1, INK.h)} />

        <div ref={inkWrapRef} className={b.inkWrap} style={pos(INK.x, INK.y, INK.w, INK.h)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={b.inkFallback} src={`${IMG}/tinta.webp`} alt="" width={891.5} height={532} loading="lazy" decoding="async" />
          <canvas ref={inkCanvasRef} role="img" aria-label={alt} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={b.grain} src={`${IMG}/grao.webp`} alt="" width={891.5} height={532} loading="lazy" decoding="async" />
        </div>

        {/* faixa bege (201:474): a régua, que corre por cima da tela junto com a bolinha */}
        <div className={b.stripTrack} style={pos(STRIP_TRACK.x, STRIP_TRACK.y, STRIP_TRACK.w, STRIP_TRACK.h)} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={stripRef} className={b.strip} src={`${IMG}/faixa.webp`} alt="" width={STRIP.w} height={STRIP.h} loading="lazy" decoding="async" />
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={b.cordRest}
          src={`${IMG}/cordao.webp`}
          alt=""
          width={CORD_REST.w}
          height={CORD_REST.h}
          loading="lazy"
          decoding="async"
          style={pos(CORD_REST.x, CORD_REST.y, CORD_REST.w, CORD_REST.h)}
        />

        <div
          ref={knobRef}
          className={b.knob}
          style={pos(KNOB.x, KNOB.y, KNOB.w, KNOB.h)}
          role="slider"
          tabIndex={0}
          aria-label={eraserLabel}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          aria-disabled={!canErase(state) || undefined}
          onPointerDown={onKnobDown}
          onPointerMove={onKnobMove}
          onPointerUp={onKnobUp}
          onPointerCancel={onKnobUp}
          onKeyDown={onKnobKey}
        />

        <canvas ref={cordCanvasRef} className={b.cordCanvas} style={pos(CORD_CANVAS.x, CORD_CANVAS.y, CORD_CANVAS.w, CORD_CANVAS.h)} aria-hidden />

        {/* área do suporte: com a caneta na mão, um clique aqui a guarda */}
        <div className={b.holder} style={pos(HOLDER.x, HOLDER.y, HOLDER.w, HOLDER.h)} aria-hidden />

        <div ref={penRef} className={b.pen} style={pos(PEN.x, PEN.y, PEN.w, PEN.h)} aria-hidden onPointerDown={onPenDown}>
          {/* caneta (201:465), SVG do Figma */}
          <svg viewBox="0 0 50.2395 395" fill="none">
            <path d="M23.174 18.4229C23.4203 16.0894 26.817 16.0894 27.0633 18.4229L31.3109 58.6634H18.9264L23.174 18.4229Z" fill="#FFFFFB" />
            <path d="M0.0259531 67.7889H50.2157V371.535C50.2157 384.494 39.7099 395 26.7504 395H23.4913C10.5317 395 0.0259531 384.494 0.0259531 371.535V67.7889Z" fill="#FADAE7" />
            <path d="M20.3263 25.5346C22.1315 21.3187 28.1081 21.3187 29.9133 25.5346L50.2395 73.0034H5.19245e-05L20.3263 25.5346Z" fill="#FADAE7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
