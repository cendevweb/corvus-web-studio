/**
 * Generic 2D spring: keeps its momentum and slightly overshoots its target.
 * `apply` receives position and velocity on every frame; the loop stops by itself at rest.
 */
export type SpringApply = (x: number, y: number, vx: number, vy: number) => void;

export interface Spring {
  /** Animate towards a target. */
  to(x: number, y: number): void;
  /** Jump to a position without animating. */
  set(x: number, y: number): void;
  /** Cancel the running frame (call on unmount). */
  stop(): void;
  /** Change stiffness and/or damping on the fly. */
  tune(settings: { stiffness?: number; damping?: number }): void;
}

export function createSpring(apply: SpringApply, stiffness = 0.12, damping = 0.78): Spring {
  let x = 0;
  let y = 0;
  let vx = 0;
  let vy = 0;
  let tx = 0;
  let ty = 0;
  let raf = 0;

  const step = () => {
    vx = (vx + (tx - x) * stiffness) * damping;
    vy = (vy + (ty - y) * stiffness) * damping;
    x += vx;
    y += vy;
    apply(x, y, vx, vy);
    const moving = Math.abs(vx) + Math.abs(vy) + Math.abs(tx - x) + Math.abs(ty - y) > 0.01;
    raf = moving ? requestAnimationFrame(step) : 0;
  };

  return {
    to(a, b) {
      tx = a;
      ty = b;
      if (!raf) raf = requestAnimationFrame(step);
    },
    set(a, b) {
      x = tx = a;
      y = ty = b;
      vx = vy = 0;
      apply(x, y, 0, 0);
    },
    stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
    tune(settings) {
      stiffness = settings.stiffness ?? stiffness;
      damping = settings.damping ?? damping;
    },
  };
}
