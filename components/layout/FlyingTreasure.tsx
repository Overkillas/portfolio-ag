'use client';

import { useEffect, useRef, useState } from 'react';
import type { Dictionary } from '@/i18n/dictionaries';
import { useTranslations } from '@/lib/i18n/use-translation';
import { giftItems, type StudyItem } from '@/lib/studies';
import { GiftCard } from './GiftCard';
import s from './flying-treasure.module.css';

/**
 * Evento aleatório (Figma 259:778, "Icones que ficam voando como evento aleatório"): de
 * vez em quando um dos 12 ícones atravessa a tela voando, com um rastro de brilhos de
 * "recompensa" de jogo. Quem pega (clique, toque ou Enter) ganha uma arte da Ágatha: o
 * ícone estoura nos confetes de coelhinho (Figma 278:174) e abre o card do brinde (Figma
 * 281:301, GiftCard) com o ícone pego e uma arte sorteada da página Estudos que pode ser
 * baixada (`giftItems` em lib/studies.ts: sem rascunhos, calendários nem o gato).
 *
 * Quando: o primeiro entre 3 e 5 min depois de entrar no site, os seguintes 3 a 5 min
 * depois do anterior (contados de quando o card fecha); nunca com a aba escondida nem com
 * um diálogo aberto (modal do case, lightbox, o próprio brinde). Com `?voador` na URL o
 * primeiro vem em 1,5 s (para mostrar).
 *
 * Com movimento reduzido ele não voa nem deixa rastro: aparece parado perto de uma
 * borda, brilha e some sozinho.
 */

type IconKey = keyof Dictionary['treasure']['icons'];

const ICONS: readonly { key: IconKey; file: string }[] = [
  { key: 'aguaViva', file: 'agua-viva' },
  { key: 'aguaVivaLua', file: 'agua-viva-lua' },
  { key: 'peixinho', file: 'peixinho' },
  { key: 'concha', file: 'concha' },
  { key: 'relogio', file: 'relogio' },
  { key: 'estrela', file: 'estrela' },
  { key: 'bolinhaDeGude', file: 'bolinha-de-gude' },
  { key: 'pontosSemNo', file: 'pontos-sem-no' },
  { key: 'lirioDoVale', file: 'lirio-do-vale' },
  { key: 'dadinho', file: 'dadinho' },
  { key: 'folhaDeOutono', file: 'folha-de-outono' },
  { key: 'trevo', file: 'trevo' },
];

const FIRST = [180_000, 300_000] as const;
const NEXT = [180_000, 300_000] as const;
const DEMO_FIRST = 1500;
/** Tenta de novo quando a hora chega com a aba escondida ou um diálogo aberto. */
const RETRY = 5000;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dialogOpen = () => document.querySelector('[aria-modal="true"]') !== null;

type Icon = (typeof ICONS)[number];
type Flight = { id: number; icon: Icon };

export function FlyingTreasure() {
  const { t, dict } = useTranslations();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [gift, setGift] = useState<{ icon: Icon; item: StudyItem } | null>(null);
  // primeira aparição (só no cliente; o valor não vai para o HTML)
  const [schedule, setSchedule] = useState<number | null>(() =>
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).has('voador')
        ? DEMO_FIRST
        : rand(...FIRST),
  );
  const lastIcon = useRef<IconKey | null>(null);
  const opener = useRef<Element | null>(null);

  // relógio do evento: quando chega a hora, solta um ícone (ou adia, se não é hora boa)
  useEffect(() => {
    if (schedule === null || flight || gift) return;
    const timer = window.setTimeout(() => {
      if (document.hidden || dialogOpen()) {
        setSchedule(RETRY + Math.random());
        return;
      }
      const choices = ICONS.filter((i) => i.key !== lastIcon.current);
      const icon = pick(choices);
      lastIcon.current = icon.key;
      setFlight({ id: Date.now(), icon });
    }, schedule);
    return () => window.clearTimeout(timer);
  }, [schedule, flight, gift]);

  const catchIt = (icon: Icon) => {
    opener.current = document.activeElement;
    setGift({ icon, item: pick(giftItems) });
  };

  const done = () => {
    setFlight(null);
    setSchedule(rand(...NEXT));
  };

  return (
    <>
      {flight && (
        <Flyer
          key={flight.id}
          src={`/images/voadores/${flight.icon.file}.svg`}
          label={t('treasure.catch').replace('{icon}', dict.treasure.icons[flight.icon.key])}
          onCatch={() => catchIt(flight.icon)}
          onDone={done}
        />
      )}
      {gift && (
        <GiftCard
          icon={`/images/voadores/${gift.icon.file}.svg`}
          title={dict.treasure.gift.titles[gift.icon.key]}
          item={gift.item}
          onClose={() => {
            setGift(null);
            const back = opener.current;
            if (back instanceof HTMLElement && back.isConnected) back.focus({ preventScroll: true });
          }}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------
// O voo e o rastro

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  r: number;
  star: boolean;
  color: string;
  spin: number;
  seed: number;
};

/** Confete de coelhinho que voa quando o ícone estoura. */
type Confetto = {
  img: HTMLImageElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  w: number;
  rot: number;
  spin: number;
  seed: number;
};

/** Confetes do Figma 278:174 (o mesmo coelhinho em três cores), 34.7 × 32.4. */
const CONFETTI = ['azul', 'rosa', 'marinho'].map((c) => `/images/voadores/confete-${c}.svg`);
const CONFETTI_COUNT = 26;
const CONFETTI_GRAVITY = 520;

/** Dourados e os pastéis do site: brilham no creme sem sumir nele. */
const SPARKS = ['#ffc93c', '#ffb703', '#ffe08a', '#ffffff', '#f4a9c8', '#8fb3e8'];
const GRAVITY = 26;
/** px/s do voo numa tela de 1440 (a duração se ajusta à largura). */
const SPEED = 150;
const SLOW = 0.3;
const STILL_MS = 10_000;

function Flyer({
  src,
  label,
  onCatch,
  onDone,
}: {
  src: string;
  label: string;
  onCatch: () => void;
  onDone: () => void;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const slow = useRef(false);
  const caught = useRef(false);
  // o Flyer só monta no cliente (depois de um timer), então dá para ler a preferência aqui
  const [still] = useState(reducedMotion);

  useEffect(() => {
    const btn = button.current;
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!btn || !cv || !ctx) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const size = W < 640 ? 72 : 96;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.scale(dpr, dpr);

    const calm = still;

    // trajetória: de uma borda à outra numa onda suave, um pouco subindo ou descendo
    const dir = Math.random() < 0.5 ? 1 : -1;
    const x0 = dir > 0 ? -size : W + size;
    const x1 = dir > 0 ? W + size : -size;
    const yBase = rand(0.18, 0.66) * H;
    const drift = rand(-0.14, 0.14) * H;
    const amp = rand(26, 56);
    const waves = rand(1.2, 2.2);
    const phase = rand(0, Math.PI * 2);
    const duration = Math.min(13_000, Math.max(7000, (Math.abs(x1 - x0) / SPEED) * 1000));
    // parado (movimento reduzido): perto da borda de onde viria
    const stillX = dir > 0 ? rand(0.08, 0.16) * W : rand(0.84, 0.92) * W;

    let p = 0;
    let speed = 1;
    let t = 0;
    let last = performance.now();
    let frame = 0;
    let leftAt: number | null = null;
    let caughtAt: number | null = null;
    let pos = { x: calm ? stillX : x0, y: yBase };
    const parts: Particle[] = [];
    const confetti: Confetto[] = [];
    // os confetes carregam já na montagem: quando pegarem o ícone, estão prontos
    const confettiImgs = CONFETTI.map((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
      return img;
    });

    const place = (x: number, y: number, rot: number, bob: number) => {
      btn.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0) rotate(${rot}deg) scale(${bob})`;
    };

    const spawn = (x: number, y: number, burst: boolean) => {
      const a = burst ? rand(0, Math.PI * 2) : rand(-0.6, 0.6) + (dir > 0 ? Math.PI : 0);
      const v = burst ? rand(120, 340) : rand(10, 45);
      parts.push({
        x: x + (burst ? 0 : rand(-size * 0.22, size * 0.22)),
        y: y + (burst ? 0 : rand(-size * 0.22, size * 0.22)),
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v + (burst ? 0 : rand(-12, 12)),
        age: 0,
        life: burst ? rand(0.5, 0.95) : rand(0.6, 1.3),
        r: burst ? rand(4, 9) : rand(2.5, 7),
        star: Math.random() < (burst ? 0.75 : 0.6),
        color: pick(SPARKS),
        spin: rand(-3, 3),
        seed: rand(0, 10),
      });
    };

    const drawStar = (r: number) => {
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.quadraticCurveTo(0, 0, 0, r);
      ctx.quadraticCurveTo(0, 0, -r, 0);
      ctx.quadraticCurveTo(0, 0, 0, -r);
      ctx.fill();
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      if (!caught.current) {
        if (calm) {
          // parado: só aparece, espera e vai embora
          if (t * 1000 > STILL_MS && leftAt === null) {
            leftAt = now;
            btn.dataset.leaving = '';
          }
          place(stillX, yBase, 0, 1);
          pos = { x: stillX, y: yBase };
        } else {
          speed += ((slow.current ? SLOW : 1) - speed) * Math.min(1, dt * 6);
          p = Math.min(1, p + (dt * 1000 * speed) / duration);
          const w = Math.PI * 2 * waves * p + phase;
          const x = x0 + (x1 - x0) * p;
          const y = yBase + drift * p + amp * Math.sin(w);
          const rot = 9 * Math.cos(w) * dir;
          const bob = 1 + 0.04 * Math.sin(t * 5.5);
          place(x, y, rot, bob);
          pos = { x, y };
          // rastro: mais brilho quanto mais rápido
          const n = dt * 60 * (0.6 + speed * 0.9);
          for (let i = 0; i < n; i++) if (Math.random() < Math.min(1, n - i)) spawn(x - dir * size * 0.18, y, false);
          if (p >= 1 && leftAt === null) leftAt = now;
        }
      } else if (caughtAt === null) {
        caughtAt = now;
        if (!calm) {
          const ready = confettiImgs.filter((img) => img.complete && img.naturalWidth > 0);
          // sem as imagens (rede falhou), estoura nas estrelinhas de antes
          if (ready.length === 0) for (let i = 0; i < 40; i++) spawn(pos.x, pos.y, true);
          for (let i = 0; ready.length && i < CONFETTI_COUNT; i++) {
            const a = rand(0, Math.PI * 2);
            const v = rand(180, 420);
            confetti.push({
              img: pick(ready),
              x: pos.x,
              y: pos.y,
              vx: Math.cos(a) * v,
              vy: Math.sin(a) * v - 140,
              age: 0,
              life: rand(1.1, 1.7),
              w: rand(26, 40),
              rot: rand(0, Math.PI * 2),
              spin: rand(-5, 5),
              seed: rand(0, 10),
            });
          }
        }
      }

      // partículas
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const q = parts[i];
        q.age += dt;
        if (q.age >= q.life) {
          parts.splice(i, 1);
          continue;
        }
        q.vx *= 1 - dt * 1.6;
        q.vy = q.vy * (1 - dt * 1.6) + GRAVITY * dt;
        q.x += q.vx * dt;
        q.y += q.vy * dt;
        const k = 1 - q.age / q.life;
        const twinkle = 0.65 + 0.35 * Math.sin(q.age * 16 + q.seed);
        const r = q.r * (0.4 + 0.6 * k) * (q.star ? twinkle : 1);
        ctx.save();
        ctx.translate(q.x, q.y);
        ctx.globalAlpha = Math.min(1, k * 1.4);
        // brilho em volta
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.6);
        glow.addColorStop(0, 'rgba(255, 226, 130, 0.55)');
        glow.addColorStop(1, 'rgba(255, 226, 130, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(-r * 2.6, -r * 2.6, r * 5.2, r * 5.2);
        ctx.fillStyle = q.color;
        if (q.star) {
          ctx.rotate(q.spin * q.age);
          drawStar(r * 1.5);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // confetes: sobem no estouro, chacoalham caindo e somem no fim
      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.age += dt;
        if (c.age >= c.life) {
          confetti.splice(i, 1);
          continue;
        }
        c.vx *= 1 - dt * 1.8;
        c.vy = c.vy * (1 - dt * 1.2) + CONFETTI_GRAVITY * dt;
        c.x += (c.vx + Math.sin(c.age * 7 + c.seed) * 40) * dt;
        c.y += c.vy * dt;
        c.rot += c.spin * dt;
        const k = 1 - c.age / c.life;
        const h = (c.w * c.img.naturalHeight) / c.img.naturalWidth;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        // vira no ar, como papel: a largura "respira"
        ctx.scale(0.55 + 0.45 * Math.cos(c.age * 9 + c.seed), 1);
        ctx.globalAlpha = Math.min(1, k / 0.3);
        ctx.drawImage(c.img, -c.w / 2, -h / 2, c.w, h);
        ctx.restore();
      }

      // fim: saiu da tela (ou foi pego) e o rastro já apagou
      const gone = caughtAt !== null ? now - caughtAt > 700 : leftAt !== null && now - leftAt > (calm ? 600 : 0);
      if (gone && parts.length === 0 && confetti.length === 0) {
        onDone();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    place(pos.x, pos.y, 0, 1);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // onDone/onCatch mudam a cada render do pai; o voo vive com os da montagem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grab = () => {
    if (caught.current) return;
    caught.current = true;
    const btn = button.current;
    const icon = btn?.querySelector('img');
    btn?.setAttribute('data-caught', '');
    // o rastro (com os confetes) sobe acima do card do brinde, que abre logo em seguida
    canvas.current?.setAttribute('data-caught', '');
    const pop = icon?.animate(
      [
        { transform: 'scale(1) rotate(0deg)', opacity: 1 },
        { transform: 'scale(1.4) rotate(-12deg)', opacity: 1, offset: 0.4 },
        { transform: 'scale(0) rotate(40deg)', opacity: 0 },
      ],
      { duration: still ? 1 : 420, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)', fill: 'forwards' },
    );
    const open = () => onCatch();
    if (pop) pop.finished.then(open, open);
    else open();
  };

  return (
    <>
      <canvas ref={canvas} className={s.trail} aria-hidden />
      <button
        ref={button}
        type="button"
        className={s.flyer}
        data-still={still ? '' : undefined}
        aria-label={label}
        onClick={grab}
        onPointerEnter={() => (slow.current = true)}
        onPointerLeave={() => (slow.current = false)}
        onFocus={() => (slow.current = true)}
        onBlur={() => (slow.current = false)}
      >
        <span className={s.rays} aria-hidden />
        <span className={s.halo} aria-hidden />
        <span className={s.flash} aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG do Figma, 110 × 110 */}
        <img src={src} alt="" width={110} height={110} className={s.icon} draggable={false} />
      </button>
    </>
  );
}
