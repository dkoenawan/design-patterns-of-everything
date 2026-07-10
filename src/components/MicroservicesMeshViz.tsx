import { useRef, useEffect } from 'react';

// ── Layout ────────────────────────────────────────────────────────────────────

const W = 640;
const H = 300;

const INFRA_TINT  = '#c8a4d4';
const HEALTH_TINT = '#9ec48a';
const WARN_TINT   = '#d49a7a';
const INK_DIM     = 'rgba(232,220,184,0.45)';
const INK_FAINT   = 'rgba(232,220,184,0.10)';
const BOX_BG      = 'rgba(14,20,42,0.85)';

// ── Service nodes ─────────────────────────────────────────────────────────────

interface Service {
  id: string;
  label: string;
  x: number;
  y: number;
  tint: string;
  health: number; // 0–1; <0.5 = degraded → shows warm tint
}

const SERVICES: Service[] = [
  { id: 'gateway',  label: 'API Gateway',   x: W * 0.12, y: H * 0.50, tint: INFRA_TINT,  health: 1 },
  { id: 'auth',     label: 'Auth',           x: W * 0.35, y: H * 0.22, tint: INFRA_TINT,  health: 1 },
  { id: 'orders',   label: 'Orders',         x: W * 0.35, y: H * 0.50, tint: INFRA_TINT,  health: 1 },
  { id: 'catalog',  label: 'Catalog',        x: W * 0.35, y: H * 0.78, tint: INFRA_TINT,  health: 1 },
  { id: 'notify',   label: 'Notify',         x: W * 0.58, y: H * 0.30, tint: INFRA_TINT,  health: 1 },
  { id: 'payments', label: 'Payments',       x: W * 0.58, y: H * 0.68, tint: WARN_TINT,   health: 0.35 },
  { id: 'db',       label: 'Data Store',     x: W * 0.82, y: H * 0.50, tint: HEALTH_TINT, health: 1 },
];

// ── Edges (directed) ─────────────────────────────────────────────────────────

interface Edge {
  from: string;
  to: string;
}

const EDGES: Edge[] = [
  { from: 'gateway',  to: 'auth'     },
  { from: 'gateway',  to: 'orders'   },
  { from: 'gateway',  to: 'catalog'  },
  { from: 'orders',   to: 'notify'   },
  { from: 'orders',   to: 'payments' },
  { from: 'orders',   to: 'db'       },
  { from: 'catalog',  to: 'db'       },
  { from: 'payments', to: 'db'       },
];

// ── Mote ─────────────────────────────────────────────────────────────────────

interface Mote {
  id: number;
  fromId: string;
  toId: string;
  t: number;        // 0→1 along edge
  speed: number;
  color: string;
  size: number;
  alpha: number;
}

let _nextId = 0;
function nextId() { return _nextId++; }

function serviceById(id: string): Service {
  return SERVICES.find((s) => s.id === id)!;
}

function makeMote(edge: Edge): Mote {
  const to = serviceById(edge.to);
  const degraded = to.health < 0.5;
  return {
    id: nextId(),
    fromId: edge.from,
    toId: edge.to,
    t: 0,
    speed: 0.22 + Math.random() * 0.14,
    color: degraded ? WARN_TINT : INFRA_TINT,
    size: 2.5,
    alpha: 0.88,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MicroservicesMeshViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    motes: [] as Mote[],
    nextSpawn: 0.4,
    edgeIdx: 0,
    // Circuit-breaker pulse for degraded service
    pulses: [] as { alpha: number }[],
    nextPulse: 3.5,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function sx(x: number, cw: number) { return x * (cw / W); }
    function sy(y: number, ch: number) { return y * (ch / H); }

    const NODE_R = 22; // logical radius for node circle

    function drawService(svc: Service, cw: number, ch: number) {
      const cx = sx(svc.x, cw);
      const cy = sy(svc.y, ch);
      const r  = sx(NODE_R, cw);
      const degraded = svc.health < 0.5;
      const tint = degraded ? WARN_TINT : svc.tint;

      // Outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = BOX_BG;
      ctx.fill();
      ctx.strokeStyle = tint;
      ctx.lineWidth = degraded ? 1.2 : 0.7;
      ctx.stroke();

      // Degraded: dashed ring
      if (degraded) {
        ctx.beginPath();
        ctx.arc(cx, cy, r + sx(4, cw), 0, Math.PI * 2);
        ctx.strokeStyle = `${WARN_TINT}55`;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([4, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Health dot
      const dotR = sx(3.5, cw);
      const dotX = cx + r * 0.62;
      const dotY = cy - r * 0.62;
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
      ctx.fillStyle = degraded ? WARN_TINT : HEALTH_TINT;
      ctx.fill();

      // Label
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = tint;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(svc.label.toUpperCase(), cx, cy);
    }

    function drawEdges(cw: number, ch: number) {
      for (const edge of EDGES) {
        const from = serviceById(edge.from);
        const to   = serviceById(edge.to);
        const fx = sx(from.x, cw);
        const fy = sy(from.y, ch);
        const tx = sx(to.x, cw);
        const ty = sy(to.y, ch);

        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = INK_FAINT;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    function draw(ts: number) {
      const s = stateRef.current;
      const dt = Math.min(ts - (s.lastTime || ts), 50) / 1000;
      s.lastTime = ts;

      const dpr = window.devicePixelRatio || 1;
      const cw  = canvas!.clientWidth;
      const ch  = canvas!.clientHeight;
      if (canvas!.width !== cw * dpr || canvas!.height !== ch * dpr) {
        canvas!.width  = cw * dpr;
        canvas!.height = ch * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, cw, ch);

      // ── Edges ─────────────────────────────────────────────────────
      drawEdges(cw, ch);

      // ── Circuit-breaker pulses around degraded service ─────────────
      const paymentsSvc = serviceById('payments');
      const px = sx(paymentsSvc.x, cw);
      const py = sy(paymentsSvc.y, ch);

      s.nextPulse -= dt;
      if (s.nextPulse <= 0) {
        s.pulses.push({ alpha: 1 });
        s.nextPulse = 4 + Math.random() * 2;
      }
      s.pulses = s.pulses.filter((pulse) => {
        pulse.alpha -= dt * 0.9;
        if (pulse.alpha <= 0) return false;
        const r = sx(NODE_R + 18, cw) * (1 - pulse.alpha * 0.4);
        const grad = ctx.createRadialGradient(px, py, 0, px, py, r);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.6, `${WARN_TINT}${Math.round(pulse.alpha * 48).toString(16).padStart(2, '0')}`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        return true;
      });

      // ── Nodes ─────────────────────────────────────────────────────
      for (const svc of SERVICES) drawService(svc, cw, ch);

      // ── Motes ─────────────────────────────────────────────────────
      const toRemove = new Set<number>();

      for (const m of s.motes) {
        m.t += m.speed * dt;
        if (m.t >= 1) {
          toRemove.add(m.id);
          continue;
        }

        const from = serviceById(m.fromId);
        const to   = serviceById(m.toId);
        const mx = sx(from.x + (to.x - from.x) * m.t, cw);
        const my = sy(from.y + (to.y - from.y) * m.t, ch);

        // Glow
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, m.size * 4);
        glow.addColorStop(0, `${m.color}44`);
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(mx, my, m.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(mx, my, m.size, 0, Math.PI * 2);
        ctx.fillStyle = m.color;
        ctx.globalAlpha = m.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      s.motes = s.motes.filter((m) => !toRemove.has(m.id));

      // ── Plate reference ────────────────────────────────────────────
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.22;
      ctx.fillText('Plate iv-b · Service Mesh · Infrastructure Domain', sx(W / 2, cw), sy(H - 8, ch));
      ctx.globalAlpha = 1;

      // ── Spawn motes ────────────────────────────────────────────────
      s.nextSpawn -= dt;
      if (s.nextSpawn <= 0) {
        const edge = EDGES[s.edgeIdx % EDGES.length];
        s.edgeIdx++;
        s.motes.push(makeMote(edge));
        s.nextSpawn = 0.3 + Math.random() * 0.5;
      }

      stateRef.current.raf = requestAnimationFrame(draw);
    }

    stateRef.current.raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(stateRef.current.raf);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '640 / 300' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
