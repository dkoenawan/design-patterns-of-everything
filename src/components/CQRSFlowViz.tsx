import { useRef, useEffect } from 'react';

// ── Layout constants ───────────────────────────────────────────────────────────

const W = 640;
const H = 320;

const CMD_TINT    = '#d49a7a'; // backend orange-warm
const QRY_TINT    = '#7aa3d4'; // backend blue
const PROJ_TINT   = 'rgba(212,177,94,0.55)'; // gold (sync arrow)
const INK_DIM     = 'rgba(232,220,184,0.45)';
const INK_FAINT   = 'rgba(232,220,184,0.14)';
const BOX_BG      = 'rgba(14,20,42,0.80)';

// Y centres for each lane
const CMD_Y = H * 0.30;
const QRY_Y = H * 0.70;

// X positions of nodes (shared columns)
const X_CLIENT   = W * 0.06;
const X_HANDLER  = W * 0.33;
const X_STORE    = W * 0.60;
const X_READDB   = W * 0.85;

// Node box half-dimensions
const BOX_HW = 46;
const BOX_HH = 16;

// Projection arrow X range (from write store to read db, mid-y)
const PROJ_MID_Y = H * 0.50;

// ── Mote types ─────────────────────────────────────────────────────────────────

type Lane = 'cmd' | 'qry';

interface Mote {
  id: number;
  lane: Lane;
  x: number;          // current x in [0..W]
  targetX: number;    // destination x
  color: string;
  alpha: number;
  size: number;
  speed: number;      // px/s in W-space
  phase: number;      // 0 = client→handler, 1 = handler→store, 2 = store→readdb (cmd only: projection), 3 = done
}

// Projection pulse (vertical sync arrow flash)
interface ProjPulse {
  id: number;
  y: number;    // current y from CMD_Y toward QRY_Y (in H-space)
  alpha: number;
}

let nextId = 0;

function makeMote(lane: Lane): Mote {
  return {
    id: nextId++,
    lane,
    x: X_CLIENT,
    targetX: X_HANDLER,
    color: lane === 'cmd' ? CMD_TINT : QRY_TINT,
    alpha: 0.9,
    size: 3,
    speed: lane === 'cmd' ? 90 + Math.random() * 30 : 110 + Math.random() * 30,
    phase: 0,
  };
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function CQRSFlowViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    motes: [] as Mote[],
    projPulses: [] as ProjPulse[],
    nextCmd: 1.4,
    nextQry: 0.9,
    elapsed: 0,
    nextProjId: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // ── Draw helpers ──────────────────────────────────────────────

    function sx(x: number, cw: number) { return x * (cw / W); }
    function sy(y: number, ch: number) { return y * (ch / H); }

    function drawBox(
      ctx: CanvasRenderingContext2D,
      x: number, y: number,
      label: string,
      tint: string,
      cw: number, ch: number,
    ) {
      const bx = sx(x, cw);
      const by = sy(y, ch);
      const hw = sx(BOX_HW, cw);
      const hh = sy(BOX_HH, ch);

      ctx.fillStyle = BOX_BG;
      ctx.strokeStyle = tint;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.rect(bx - hw, by - hh, hw * 2, hh * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = `normal 8px 'JetBrains Mono', monospace`;
      ctx.fillStyle = tint;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.toUpperCase(), bx, by);
    }

    function drawArrow(
      ctx: CanvasRenderingContext2D,
      x1: number, y1: number, x2: number, y2: number,
      color: string, cw: number, ch: number,
    ) {
      const ax1 = sx(x1, cw), ay1 = sy(y1, ch);
      const ax2 = sx(x2, cw), ay2 = sy(y2, ch);
      ctx.beginPath();
      ctx.moveTo(ax1, ay1);
      ctx.lineTo(ax2, ay2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrowhead
      const angle = Math.atan2(ay2 - ay1, ax2 - ax1);
      const len = 6;
      ctx.beginPath();
      ctx.moveTo(ax2, ay2);
      ctx.lineTo(ax2 - len * Math.cos(angle - 0.4), ay2 - len * Math.sin(angle - 0.4));
      ctx.lineTo(ax2 - len * Math.cos(angle + 0.4), ay2 - len * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    function draw(ts: number) {
      const s = stateRef.current;
      const dt = Math.min(ts - (s.lastTime || ts), 50) / 1000;
      s.lastTime = ts;
      s.elapsed += dt;

      const dpr = window.devicePixelRatio || 1;
      const cw = canvas!.clientWidth;
      const ch = canvas!.clientHeight;
      if (canvas!.width !== cw * dpr || canvas!.height !== ch * dpr) {
        canvas!.width  = cw * dpr;
        canvas!.height = ch * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, cw, ch);

      // ── Static structure ────────────────────────────────────────

      // Lane labels
      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.textBaseline = 'middle';

      ctx.fillStyle = CMD_TINT;
      ctx.textAlign = 'left';
      ctx.globalAlpha = 0.55;
      ctx.fillText('COMMAND PATH', sx(X_CLIENT + BOX_HW + 8, cw), sy(CMD_Y, ch) - sy(BOX_HH + 12, ch));

      ctx.fillStyle = QRY_TINT;
      ctx.fillText('QUERY PATH', sx(X_CLIENT + BOX_HW + 8, cw), sy(QRY_Y, ch) + sy(BOX_HH + 14, ch));
      ctx.globalAlpha = 1;

      // Lane separator
      ctx.beginPath();
      ctx.moveTo(sx(X_CLIENT - 4, cw), sy(PROJ_MID_Y, ch));
      ctx.lineTo(sx(X_READDB + BOX_HW + 4, cw), sy(PROJ_MID_Y, ch));
      ctx.strokeStyle = INK_FAINT;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([6, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Static connector lines (guide rails)
      const guides: [number, number, number, number, string][] = [
        [X_CLIENT + BOX_HW, CMD_Y, X_HANDLER - BOX_HW, CMD_Y, `${CMD_TINT}30`],
        [X_HANDLER + BOX_HW, CMD_Y, X_STORE - BOX_HW, CMD_Y, `${CMD_TINT}30`],
        [X_CLIENT + BOX_HW, QRY_Y, X_HANDLER - BOX_HW, QRY_Y, `${QRY_TINT}30`],
        [X_HANDLER - BOX_HW, QRY_Y, X_STORE + BOX_HW, QRY_Y, `${QRY_TINT}30`], // read side: readdb → handler
        [X_READDB - BOX_HW, QRY_Y, X_STORE + BOX_HW, QRY_Y, `${QRY_TINT}30`],
      ];
      for (const [x1, y1, x2, y2, col] of guides) {
        ctx.beginPath();
        ctx.moveTo(sx(x1, cw), sy(y1, ch));
        ctx.lineTo(sx(x2, cw), sy(y2, ch));
        ctx.strokeStyle = col;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Projection vertical sync arrow (static, faint)
      drawArrow(ctx, X_STORE, CMD_Y + BOX_HH, X_READDB, QRY_Y - BOX_HH, `${CMD_TINT}28`, cw, ch);

      // Boxes — Command lane
      drawBox(ctx, X_CLIENT,  CMD_Y, 'Client',     INK_DIM,  cw, ch);
      drawBox(ctx, X_HANDLER, CMD_Y, 'Cmd Handler', CMD_TINT, cw, ch);
      drawBox(ctx, X_STORE,   CMD_Y, 'Write Store', CMD_TINT, cw, ch);

      // Boxes — Query lane
      drawBox(ctx, X_CLIENT,  QRY_Y, 'Client',     INK_DIM,  cw, ch);
      drawBox(ctx, X_READDB,  QRY_Y, 'Read DB',     QRY_TINT, cw, ch);
      drawBox(ctx, X_HANDLER, QRY_Y, 'Qry Handler', QRY_TINT, cw, ch);
      drawBox(ctx, X_STORE,   QRY_Y, 'Projection',  QRY_TINT, cw, ch);

      // Plate reference
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.22;
      ctx.fillText('Plate ii · CQRS Flow · Backend Domain', sx(W / 2, cw), sy(H - 8, ch));
      ctx.globalAlpha = 1;

      // ── Spawn motes ─────────────────────────────────────────────

      s.nextCmd -= dt;
      if (s.nextCmd <= 0) {
        s.motes.push(makeMote('cmd'));
        s.nextCmd = 1.6 + Math.random() * 0.8;
      }

      s.nextQry -= dt;
      if (s.nextQry <= 0) {
        s.motes.push(makeMote('qry'));
        s.nextQry = 1.1 + Math.random() * 0.6;
      }

      // ── Update & draw projection pulses ─────────────────────────

      s.projPulses = s.projPulses.filter((pp) => {
        pp.y += dt * 120; // px/s in H-space
        pp.alpha = Math.max(0, pp.alpha - dt * 1.2);
        if (pp.alpha <= 0) return false;

        const px = sx(X_STORE + 4, cw);
        const py = sy(pp.y, ch);
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = CMD_TINT;
        ctx.globalAlpha = pp.alpha * 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
        return true;
      });

      // ── Update & draw motes ──────────────────────────────────────

      const toRemove = new Set<number>();

      for (const m of s.motes) {
        const laneY = m.lane === 'cmd' ? CMD_Y : QRY_Y;
        const speed = m.speed * dt;

        if (m.lane === 'cmd') {
          // Phase 0: client → cmd handler
          // Phase 1: cmd handler → write store
          // Phase 2: (done, triggers projection pulse)

          const targets = [X_HANDLER, X_STORE];
          if (m.phase < targets.length) {
            const tx = targets[m.phase];
            if (m.x < tx - speed) {
              m.x += speed;
            } else {
              m.x = tx;
              m.phase++;
              // When reaching write store, fire a projection pulse
              if (m.phase === 2) {
                s.projPulses.push({
                  id: s.nextProjId++,
                  y: CMD_Y + BOX_HH + 4,
                  alpha: 1.0,
                });
              }
            }
          } else {
            toRemove.add(m.id);
          }
        } else {
          // Query path: client → qry handler → read db (flows right)
          // Then read db → qry handler (data returns, flows left) — we simplify to one-way right
          const targets = [X_HANDLER, X_READDB];
          if (m.phase < targets.length) {
            const tx = targets[m.phase];
            if (m.x < tx - speed) {
              m.x += speed;
            } else {
              m.x = tx;
              m.phase++;
            }
          } else {
            toRemove.add(m.id);
          }
        }

        if (toRemove.has(m.id)) continue;

        // Draw glow
        const mx = sx(m.x, cw);
        const my = sy(laneY, ch);
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, m.size * 4);
        glow.addColorStop(0, `${m.color}50`);
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(mx, my, m.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Draw core
        ctx.beginPath();
        ctx.arc(mx, my, m.size, 0, Math.PI * 2);
        ctx.fillStyle = m.color;
        ctx.globalAlpha = m.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      s.motes = s.motes.filter((m) => !toRemove.has(m.id));

      stateRef.current.raf = requestAnimationFrame(draw);
    }

    stateRef.current.raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(stateRef.current.raf);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '640 / 320' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
