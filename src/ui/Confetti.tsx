import { useEffect, useState } from 'react';

interface Props {
  /** When true, runs a one-shot confetti burst then unmounts itself. */
  active: boolean;
  count?: number;
  durationMs?: number;
}

interface Piece {
  id: number;
  x: number;
  hue: number;
  delay: number;
  rot: number;
  drift: number;
}

/**
 * Lightweight, dependency-free confetti burst.
 *
 * Honours prefers-reduced-motion: returns nothing when the user has opted out.
 * Mount it once per "celebration moment"; it auto-cleans after durationMs.
 */
export function Confetti({ active, count = 36, durationMs = 1800 }: Props) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!active) return;
    if (typeof window !== 'undefined') {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;
    }
    const arr: Piece[] = [];
    for (let i = 0; i < count; i += 1) {
      arr.push({
        id: i,
        x: Math.random() * 100,
        hue: Math.floor(Math.random() * 360),
        delay: Math.random() * 200,
        rot: Math.random() * 360,
        drift: -40 + Math.random() * 80,
      });
    }
    setPieces(arr);
    const handle = window.setTimeout(() => setPieces([]), durationMs + 250);
    return () => window.clearTimeout(handle);
  }, [active, count, durationMs]);

  if (pieces.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] overflow-hidden"
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.x}%`,
            top: '-2vh',
            backgroundColor: `hsl(${p.hue} 90% 60%)`,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${durationMs}ms`,
            // CSS vars consumed by the keyframes in index.css.
            ['--rot' as string]: `${p.rot}deg`,
            ['--drift' as string]: `${p.drift}vw`,
          }}
        />
      ))}
    </div>
  );
}
