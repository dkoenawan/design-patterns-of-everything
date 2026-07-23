import { useRef, useEffect } from 'react';

// ── Layout constants ───────────────────────────────────────────────────────────

const W = 700;
const H = 300;

const GOLD        = '#d4b15e';
const GOLD_DIM    = 'rgba(212,177,94,0.22)';
const GREEN       = '#9ec48a';
const ORANGE      = '#d49a7a';
const INFRA_TINT  = '#c8a4d4';
const INK_DIM     = 'rgba(232,220,184,0.45)';
const INK_FAINT   = 'rgba(232,220,184,0.08)';
const BOX_BG      = 'rgba(14,20,42,0.84)';

// ── Five nodes arranged in a horizontal loop ───────────────────────────────────
//  Git Repo → Operator → Apply → Cluster → Drift Check ─→ (back to Operator)

const NODES = [
  { id: 'git',    label: 'Git Repo',    sub: 'desired state',  x: W * 0.08,  y: H * 0.42 },
  { id: 'op',     label: 'Operator',    sub: 'polling loop',   x: W * 0.28,  y: H * 0.42 },
  { id: 'apply',  label: 'Apply',       sub: 'k8s manifest',   x: W * 0.50,  y: H * 0.42 },
  { id: 'cluster',label: 'Cluster',     sub: 'actual state',   x: W * 0.72,  y: H * 0.42 },
  { id: 'drift',  label: 'Drift Check', sub: 'diff actual/desired', x: W * 0.91, y: H * 0.42 },
];

// Return arc: from Drift → (up, then left) → Operator
const RETURN_Y = H * 0.78;  // below all nodes

const BOX_HW = 46;
const BOX_HH = 16;

// ── Types ─────────────────────────────────────────────────────────────────────

type MoteKind = 'commit' | 'apply' | 'converged' | 'drift';

interface Mote {
  id: number;
  kind: MoteKind;
  x: number;
  y: number;
  phase: number;      // index into NODES for next target
  alpha: number;
  size: number;
  speed: number;
  // return path state
  returning: boolean;
  returnPhase: 'down' | 'left' | 'up'; // three legs of the U-turn
}

interface RingPulse {
  id: number;
  x: number;
  y: number;
  color: string;
  alpha: number;
  radius: number;
}

let _id = 0;
function nextId() { return _id++; }

function kindColor(kind: MoteKind): string {
  switch (kind) {
    case 'commit':    return GOLD;
    case 'apply':     return INFRA_TINT;
    case 'converged': return GREEN;
    case 'drift':     return ORANGE;
  }
}

function makeMote(driftRoll: number): Mote {
  const kind: MoteKind = driftRoll < 0.25 ? 'drift' : 'commit';
  return {
    id: nextId(),
    kind,
    x: NODES[0].x,
    y: NODES[0].y,
    phase: 1,
    alpha: 0.92,
    size: 3,
    speed: 72 + Math.random() * 28,
    returning: false,
    returnPhase: 'down',
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GitOpsReconciliationViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    motes: [] as Mote[],
    pulses: [] as RingPulse[],
    nextSpawn: 0.8,
    nextPulseId: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function sx(x: number, cw: number) { return x * (cw / W); }
    function sy(y: number, ch: number) { return y * (ch / H); }

    function drawBox(
      node: typeof NODES[0],
      tint: string,
      cw: number,
      ch: number,
    ) {
      const bx = sx(node.x, cw), by = sy(node.y, ch);
      const hw = sx(BOX_HW, cw), hh = sy(BOX_HH, ch);
      ctx.fillStyle = BOX_BG;
      ctx.strokeStyle = tint;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.rect(bx - hw, by - hh, hw * 2, hh * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = tint;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label.toUpperCase(), bx, by - 2);
      ctx.font = `400 italic 6px 'Cormorant Garamond', serif`;
      ctx.fillStyle = tint;
      ctx.globalAlpha = 0.55;
      ctx.fillText(node.sub, bx, by + 8);
      ctx.globalAlpha = 1;
    }

    function drawGuide(
      x1: number, y1: number,
      x2: number, y2: number,
      color: string,
      cw: number, ch: number,
      dashed = false,
    ) {
      ctx.beginPath();
      ctx.moveTo(sx(x1, cw), sy(y1, ch));
      ctx.lineTo(sx(x2, cw), sy(y2, ch));
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.7;
      if (dashed) ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function spawnPulse(x: number, y: number, color: string) {
      stateRef.current.pulses.push({
        id: stateRef.current.nextPulseId++,
        x, y, color, alpha: 1.0, radius: 0,
      });
    }

    function draw(ts: number) {
      const s = stateRef.current;
      const dt = Math.min(ts - (s.lastTime || ts), 50) / 1000;
      s.lastTime = ts;

      const dpr = window.devicePixelRatio || 1;
      const cw = canvas!.clientWidth;
      const ch = canvas!.clientHeight;
      if (canvas!.width !== cw * dpr || canvas!.height !== ch * dpr) {
        canvas!.width  = cw * dpr;
        canvas!.height = ch * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, cw, ch);

      // ── Forward guide rails ───────────────────────────────────────
      for (let i = 0; i < NODES.length - 1; i++) {
        drawGuide(
          NODES[i].x + BOX_HW, NODES[i].y,
          NODES[i + 1].x - BOX_HW, NODES[i].y,
          GOLD_DIM, cw, ch,
        );
      }

      // ── Return arc guides (U-turn: Drift → down → left → up to Operator) ──
      // Vertical down from Drift
      drawGuide(NODES[4].x, NODES[4].y + BOX_HH, NODES[4].x, RETURN_Y, `${ORANGE}22`, cw, ch, true);
      // Horizontal left along return lane
      drawGuide(NODES[4].x, RETURN_Y, NODES[1].x, RETURN_Y, `${ORANGE}22`, cw, ch, true);
      // Vertical up to Operator
      drawGuide(NODES[1].x, RETURN_Y, NODES[1].x, NODES[1].y + BOX_HH, `${ORANGE}22`, cw, ch, true);

      // ── Return lane label ─────────────────────────────────────────
      ctx.font = `400 italic 8px 'Cormorant Garamond', serif`;
      ctx.textAlign = 'left';
      ctx.fillStyle = ORANGE;
      ctx.globalAlpha = 0.38;
      ctx.fillText(
        'DRIFT DETECTED · RECONCILE',
        sx(NODES[1].x + BOX_HW + 8, cw),
        sy(RETURN_Y + 10, ch),
      );
      ctx.globalAlpha = 1;

      // ── Node boxes ────────────────────────────────────────────────
      const tints = [GOLD, GOLD, INFRA_TINT, GREEN, ORANGE];
      for (let i = 0; i < NODES.length; i++) {
        drawBox(NODES[i], tints[i], cw, ch);
      }

      // ── Plate reference ───────────────────────────────────────────
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.18;
      ctx.fillText(
        'Plate iv · GitOps Reconciliation Loop · Infrastructure Domain',
        sx(W / 2, cw),
        sy(H - 6, ch),
      );
      ctx.globalAlpha = 1;

      // ── Loop direction arrow hint on Drift node ───────────────────
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = ORANGE;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.35;
      ctx.fillText('↓ reconcile', sx(NODES[4].x, cw), sy(NODES[4].y + BOX_HH + 9, ch));
      ctx.globalAlpha = 1;

      // ── Ring pulses ────────────────────────────────────────────────
      s.pulses = s.pulses.filter((p) => {
        p.alpha -= dt * 1.6;
        p.radius += dt * sx(BOX_HH * 5, cw);
        if (p.alpha <= 0) return false;
        ctx.beginPath();
        ctx.arc(sx(p.x, cw), sy(p.y, ch), p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = p.alpha * 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
        return true;
      });

      // ── Spawn motes ────────────────────────────────────────────────
      s.nextSpawn -= dt;
      if (s.nextSpawn <= 0) {
        s.motes.push(makeMote(Math.random()));
        s.nextSpawn = 1.8 + Math.random() * 1.4;
      }

      // ── Update & draw motes ────────────────────────────────────────
      const toRemove = new Set<number>();

      for (const m of s.motes) {
        const spd = m.speed * dt;

        if (!m.returning) {
          // Forward pass through nodes 0 → 4
          const target = NODES[m.phase];
          const dx = target.x - m.x;
          if (Math.abs(dx) > spd) {
            m.x += spd * Math.sign(dx);
          } else {
            m.x = target.x;
            m.y = target.y;

            if (m.phase === 2) {
              // At Apply node: upgrade commit mote to apply mote
              if (m.kind === 'commit') m.kind = 'apply';
            }
            if (m.phase === 3) {
              // At Cluster node: upgrade apply to converged or drift
              if (m.kind === 'apply') m.kind = 'converged';
            }
            if (m.phase === NODES.length - 1) {
              // Reached Drift Check
              spawnPulse(target.x, target.y, kindColor(m.kind));

              if (m.kind === 'drift') {
                // Start the return journey
                m.returning = true;
                m.returnPhase = 'down';
              } else {
                // Converged — done, vanish with green pulse
                spawnPulse(target.x, target.y, GREEN);
                toRemove.add(m.id);
                continue;
              }
            } else {
              spawnPulse(target.x, target.y, kindColor(m.kind));
              m.phase++;
            }
          }
        } else {
          // Return path: Drift → down → left → up to Operator
          if (m.returnPhase === 'down') {
            const targetY = RETURN_Y;
            const dy = targetY - m.y;
            if (Math.abs(dy) > spd) {
              m.y += spd;
            } else {
              m.y = targetY;
              m.returnPhase = 'left';
            }
          } else if (m.returnPhase === 'left') {
            const targetX = NODES[1].x;
            const dx = m.x - targetX;
            if (dx > spd) {
              m.x -= spd;
            } else {
              m.x = targetX;
              m.returnPhase = 'up';
            }
          } else {
            // up
            const targetY = NODES[1].y;
            const dy = m.y - targetY;
            if (dy > spd) {
              m.y -= spd;
            } else {
              m.y = targetY;
              // Re-enter forward loop from Operator
              m.returning = false;
              m.kind = 'commit';
              m.phase = 2; // next target: Apply
            }
          }
        }

        if (toRemove.has(m.id)) continue;

        const color = kindColor(m.kind);
        const mx = sx(m.x, cw);
        const my = sy(m.y, ch);
        const r  = m.size * 4;
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, r);
        grad.addColorStop(0, `${color}55`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(mx, my, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mx, my, m.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = m.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      s.motes = s.motes.filter((m) => !toRemove.has(m.id));

      // ── Tick marks between forward nodes ─────────────────────────
      for (let i = 0; i < NODES.length - 1; i++) {
        const gx = (NODES[i].x + BOX_HW + NODES[i + 1].x - BOX_HW) / 2;
        ctx.beginPath();
        ctx.moveTo(sx(gx, cw), sy(NODES[0].y - BOX_HH - 4, ch));
        ctx.lineTo(sx(gx, cw), sy(NODES[0].y + BOX_HH + 4, ch));
        ctx.strokeStyle = INK_FAINT;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      stateRef.current.raf = requestAnimationFrame(draw);
    }

    stateRef.current.raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(stateRef.current.raf);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '700 / 300' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
