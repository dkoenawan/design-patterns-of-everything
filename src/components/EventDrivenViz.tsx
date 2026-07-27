import { useRef, useEffect } from 'react';

// ── Layout constants ────────────────────────────────────────────────────────

const W = 640;
const H = 320;

const TINT_GOLD   = '#d4b15e';
const TINT_BLUE   = '#7aa3d4';
const TINT_ORANGE = '#d49a7a';
const TINT_GREEN  = '#9ec48a';
const TINT_PURPLE = '#c8a4d4';
const INK_DIM     = 'rgba(232,220,184,0.45)';
const BOX_BG      = 'rgba(14,20,42,0.82)';

// X positions
const X_PRODUCERS = W * 0.12;
const X_BUS       = W * 0.50;
const X_SUBS      = W * 0.88;

// Producers
const PRODUCERS = [
  { label: 'OrderSvc',   sublabel: 'order.placed',   color: TINT_ORANGE, y: H * 0.25 },
  { label: 'InventorySvc', sublabel: 'stock.updated', color: TINT_GREEN,  y: H * 0.50 },
  { label: 'PaymentSvc', sublabel: 'payment.done',   color: TINT_PURPLE, y: H * 0.75 },
];

// Subscribers (each has a list of which producer events it handles)
const SUBSCRIBERS = [
  { label: 'NotifySvc',  sublabel: 'order.placed',   color: TINT_BLUE,   y: H * 0.20, accepts: [0] },
  { label: 'WarehouseSvc', sublabel: 'order + stock', color: TINT_GREEN,  y: H * 0.42, accepts: [0, 1] },
  { label: 'AuditSvc',  sublabel: 'all events',      color: TINT_GOLD,   y: H * 0.64, accepts: [0, 1, 2] },
  { label: 'BillingSvc', sublabel: 'payment.done',   color: TINT_ORANGE, y: H * 0.86, accepts: [2] },
];

const BUS_Y_TOP    = H * 0.12;
const BUS_Y_BOT    = H * 0.92;
const BUS_CENTER_Y = H * 0.50;

// Timing
const EMIT_INTERVAL = 0.9;   // seconds between new events

interface Mote {
  id: number;
  phase: 'to-bus' | 'on-bus' | 'to-sub';
  producerIdx: number;
  subIdx: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  busEntryY: number;
  color: string;
  alpha: number;
  size: number;
  speed: number;
}

interface Ring {
  id: number;
  x: number;
  y: number;
  r: number;
  color: string;
  alpha: number;
}

let _nextId = 0;

// ── Component ───────────────────────────────────────────────────────────────

export default function EventDrivenViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    nextEmit: 0.0,
    motes: [] as Mote[],
    rings: [] as Ring[],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function sx(x: number, cw: number) { return x * (cw / W); }
    function sy(y: number, ch: number) { return y * (ch / H); }

    function drawBox(
      cx: number, cy: number,
      label: string, sublabel: string,
      tint: string,
      cw: number, ch: number,
      hw = 52, hh = 17,
    ) {
      const bx = sx(cx, cw), by = sy(cy, ch);
      const bhw = sx(hw, cw), bhh = sy(hh, ch);

      ctx.fillStyle = BOX_BG;
      ctx.strokeStyle = `${tint}66`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.rect(bx - bhw, by - bhh, bhw * 2, bhh * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = `normal 8px 'JetBrains Mono', monospace`;
      ctx.fillStyle = tint;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.toUpperCase(), bx, by - sy(4, ch));

      ctx.font = `italic 7px 'Cormorant Garamond', serif`;
      ctx.fillStyle = `${tint}88`;
      ctx.fillText(sublabel, bx, by + sy(5, ch));
    }

    function spawnRing(x: number, y: number, color: string) {
      stateRef.current.rings.push({ id: _nextId++, x, y, r: 3, color, alpha: 0.75 });
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

      // ── Emit events ─────────────────────────────────────────────────

      s.nextEmit -= dt;
      if (s.nextEmit <= 0) {
        s.nextEmit = EMIT_INTERVAL + Math.random() * 0.3;
        const pIdx = Math.floor(Math.random() * PRODUCERS.length);
        const prod = PRODUCERS[pIdx];
        // Each producer event fans out to its subscribers
        const matchingSubs = SUBSCRIBERS.filter(sub => sub.accepts.includes(pIdx));

        for (const sub of matchingSubs) {
          const sIdx = SUBSCRIBERS.indexOf(sub);
          const busEntryY = prod.y;
          s.motes.push({
            id: _nextId++,
            phase: 'to-bus',
            producerIdx: pIdx,
            subIdx: sIdx,
            x: X_PRODUCERS + 55,
            y: prod.y,
            targetX: X_BUS - 10,
            targetY: busEntryY,
            busEntryY,
            color: prod.color,
            alpha: 0.9,
            size: 2.6,
            speed: 150 + Math.random() * 30,
          });
        }
      }

      // ── Draw event bus ──────────────────────────────────────────────

      // Vertical bus line
      const bx = sx(X_BUS, cw);
      ctx.beginPath();
      ctx.moveTo(bx, sy(BUS_Y_TOP, ch));
      ctx.lineTo(bx, sy(BUS_Y_BOT, ch));
      ctx.strokeStyle = `${TINT_GOLD}30`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Bus label
      ctx.save();
      ctx.translate(bx - sx(14, cw), sy(BUS_CENTER_Y, ch));
      ctx.rotate(-Math.PI / 2);
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = `${TINT_GOLD}55`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('EVENT BUS', 0, 0);
      ctx.restore();

      // ── Draw static connector rails ──────────────────────────────────

      // Producer → bus rails
      for (const prod of PRODUCERS) {
        ctx.beginPath();
        ctx.moveTo(sx(X_PRODUCERS + 55, cw), sy(prod.y, ch));
        ctx.lineTo(bx, sy(prod.y, ch));
        ctx.strokeStyle = `${prod.color}18`;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Bus → subscriber rails
      for (const sub of SUBSCRIBERS) {
        ctx.beginPath();
        ctx.moveTo(bx, sy(sub.y, ch));
        ctx.lineTo(sx(X_SUBS - 55, cw), sy(sub.y, ch));
        ctx.strokeStyle = `${sub.color}18`;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── Draw nodes ───────────────────────────────────────────────────

      for (const prod of PRODUCERS) {
        drawBox(X_PRODUCERS, prod.y, prod.label, prod.sublabel, prod.color, cw, ch, 53, 17);
      }

      for (const sub of SUBSCRIBERS) {
        drawBox(X_SUBS, sub.y, sub.label, sub.sublabel, sub.color, cw, ch, 55, 17);
      }

      // Section labels
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';

      ctx.fillStyle = `${INK_DIM}`;
      ctx.globalAlpha = 0.35;
      ctx.fillText('PRODUCERS', sx(X_PRODUCERS, cw), sy(H * 0.06, ch));
      ctx.fillText('SUBSCRIBERS', sx(X_SUBS, cw), sy(H * 0.06, ch));
      ctx.globalAlpha = 1;

      // Plate reference
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.22;
      ctx.fillText('Plate ii · Event-Driven Architecture · Backend Domain', sx(W / 2, cw), sy(H - 7, ch));
      ctx.globalAlpha = 1;

      // ── Update rings ─────────────────────────────────────────────────

      s.rings = s.rings.filter((ring) => {
        ring.r += dt * 55;
        ring.alpha -= dt * 1.8;
        if (ring.alpha <= 0) return false;

        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = ring.alpha * 0.55;
        ctx.stroke();
        ctx.globalAlpha = 1;
        return true;
      });

      // ── Update & draw motes ──────────────────────────────────────────

      const toRemove = new Set<number>();

      for (const m of s.motes) {
        const dx = m.targetX - m.x;
        const dy = m.targetY - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const step = sx(m.speed * dt, cw);

        if (dist < step + 1) {
          m.x = m.targetX;
          m.y = m.targetY;

          if (m.phase === 'to-bus') {
            // Hit the bus — ring, then travel along bus vertically to sub's entry
            spawnRing(sx(X_BUS, cw), sy(m.y, ch), m.color);
            const sub = SUBSCRIBERS[m.subIdx];
            m.phase = 'on-bus';
            m.color = sub.color;
            m.targetX = X_BUS;
            m.targetY = sub.y;
            m.speed = 180 + Math.random() * 30;
          } else if (m.phase === 'on-bus') {
            // Reached subscriber row on bus — move right to subscriber
            const sub = SUBSCRIBERS[m.subIdx];
            m.phase = 'to-sub';
            m.targetX = X_SUBS - 55;
            m.targetY = sub.y;
            m.speed = 160 + Math.random() * 20;
          } else {
            // Delivered — ring pulse at subscriber, fade out
            const sub = SUBSCRIBERS[m.subIdx];
            spawnRing(sx(X_SUBS, cw), sy(sub.y, ch), sub.color);
            toRemove.add(m.id);
          }
        } else {
          m.x += (dx / dist) * sx(m.speed * dt, cw) * (W / cw);
          m.y += (dy / dist) * sy(m.speed * dt, ch) * (H / ch);
        }

        if (toRemove.has(m.id)) continue;

        const mx = sx(m.x, cw);
        const my = sy(m.y, ch);

        // Glow
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, m.size * 4);
        glow.addColorStop(0, `${m.color}55`);
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(mx, my, m.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

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
