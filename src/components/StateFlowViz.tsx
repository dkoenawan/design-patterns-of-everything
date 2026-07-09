import { useRef, useEffect } from 'react';

const W = 560;
const H = 260;

const TINT        = '#7aa3d4'; // frontend blue
const GOLD        = '#d4b15e';
const INK_FAINT   = 'rgba(232,220,184,0.18)';
const INK_DIM     = 'rgba(232,220,184,0.45)';
const LANE_STROKE = 'rgba(232,220,184,0.08)';

// Four nodes in the unidirectional cycle: Action → Store → View → (dispatch)
const NODES = [
  { id: 'action',   label: 'Action',      x: 90,  y: 130 },
  { id: 'store',    label: 'Store',        x: 240, y: 60  },
  { id: 'view',     label: 'View',         x: 390, y: 130 },
  { id: 'dispatch', label: 'Dispatch',     x: 240, y: 200 },
] as const;

type NodeId = 'action' | 'store' | 'view' | 'dispatch';

const EDGES: { from: NodeId; to: NodeId; label: string }[] = [
  { from: 'action',   to: 'store',    label: 'reducer' },
  { from: 'store',    to: 'view',     label: 'select'  },
  { from: 'view',     to: 'dispatch', label: 'event'   },
  { from: 'dispatch', to: 'action',   label: 'create'  },
];

interface Mote {
  id: number;
  edge: number;      // index into EDGES
  t: number;         // 0..1 progress along edge
  speed: number;
  opacity: number;
}

let moteId = 0;

export default function StateFlowViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    motes: [] as Mote[],
    nextMote: [0.3, 0.6, 0.9, 1.2] as number[], // stagger per edge
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = stateRef.current;

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function draw(ts: number) {
      const dt = Math.min((ts - (s.lastTime || ts)) / 1000, 0.05);
      s.lastTime = ts;

      const dpr = window.devicePixelRatio || 1;
      const cw  = canvas!.clientWidth;
      const ch  = canvas!.clientHeight;
      if (canvas!.width !== cw * dpr || canvas!.height !== ch * dpr) {
        canvas!.width  = cw * dpr;
        canvas!.height = ch * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      const sx = (x: number) => (x / W) * cw;
      const sy = (y: number) => (y / H) * ch;

      // ── Background ───────────────────────────────────────────────
      ctx.fillStyle = 'rgba(10,14,26,0.60)';
      ctx.fillRect(0, 0, cw, ch);

      // Plate reference
      ctx.font = `400 italic 8px 'Cormorant Garamond', serif`;
      ctx.fillStyle = 'rgba(232,220,184,0.08)';
      ctx.textAlign = 'center';
      ctx.fillText('Unidirectional State Flow · Frontend Domain', sx(W / 2), sy(H - 8));
      ctx.textAlign = 'left';

      // ── Resolve node screen positions ────────────────────────────
      const screenNodes = NODES.map((n) => ({ ...n, sx: sx(n.x), sy: sy(n.y) }));

      // ── Draw edges ───────────────────────────────────────────────
      for (let i = 0; i < EDGES.length; i++) {
        const edge = EDGES[i];
        const from = screenNodes.find((n) => n.id === edge.from)!;
        const to   = screenNodes.find((n) => n.id === edge.to)!;

        ctx.beginPath();
        ctx.moveTo(from.sx, from.sy);
        ctx.lineTo(to.sx, to.sy);
        ctx.strokeStyle = LANE_STROKE;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrowhead at midpoint direction
        const mx   = lerp(from.sx, to.sx, 0.72);
        const my   = lerp(from.sy, to.sy, 0.72);
        const ang  = Math.atan2(to.sy - from.sy, to.sx - from.sx);
        const aLen = sx(10);
        ctx.beginPath();
        ctx.moveTo(mx - Math.cos(ang - 0.42) * aLen, my - Math.sin(ang - 0.42) * aLen);
        ctx.lineTo(mx, my);
        ctx.lineTo(mx - Math.cos(ang + 0.42) * aLen, my - Math.sin(ang + 0.42) * aLen);
        ctx.strokeStyle = 'rgba(122,163,212,0.22)';
        ctx.lineWidth = 0.75;
        ctx.stroke();

        // Edge label
        const lx = lerp(from.sx, to.sx, 0.5);
        const ly = lerp(from.sy, to.sy, 0.5);
        // offset perpendicular slightly
        const nx = -(to.sy - from.sy);
        const ny  = (to.sx - from.sx);
        const len = Math.hypot(nx, ny) || 1;
        const off = sx(14);
        ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
        ctx.fillStyle = INK_FAINT;
        ctx.textAlign = 'center';
        ctx.fillText(edge.label, lx + (nx / len) * off, ly + (ny / len) * off + 3);
        ctx.textAlign = 'left';
      }

      // ── Draw nodes ───────────────────────────────────────────────
      for (const n of screenNodes) {
        const r = sx(34);
        const rh = sy(22);

        // Box
        ctx.strokeStyle = n.id === 'store' ? 'rgba(122,163,212,0.55)' : 'rgba(122,163,212,0.28)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(n.sx - r, n.sy - rh, r * 2, rh * 2);

        // Fill
        ctx.fillStyle = n.id === 'store'
          ? 'rgba(122,163,212,0.10)'
          : 'rgba(14,20,42,0.55)';
        ctx.fillRect(n.sx - r, n.sy - rh, r * 2, rh * 2);

        // Label
        ctx.font = `400 italic 13px 'Cormorant Garamond', serif`;
        ctx.fillStyle = n.id === 'store' ? TINT : INK_DIM;
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.sx, n.sy + sy(5));
        ctx.textAlign = 'left';
      }

      // ── Spawn motes per edge ─────────────────────────────────────
      for (let i = 0; i < EDGES.length; i++) {
        s.nextMote[i] -= dt;
        if (s.nextMote[i] <= 0) {
          s.nextMote[i] = 0.8 + Math.random() * 0.6;
          s.motes.push({
            id: moteId++,
            edge: i,
            t: 0,
            speed: 0.28 + Math.random() * 0.14,
            opacity: 0,
          });
        }
      }

      // ── Draw + update motes ──────────────────────────────────────
      s.motes = s.motes.filter((m) => m.t < 1.05);
      for (const m of s.motes) {
        m.t += m.speed * dt;
        if (m.t < 0.12)     m.opacity = Math.min(m.opacity + dt * 5, 0.9);
        if (m.t > 0.82)     m.opacity = Math.max(m.opacity - dt * 5, 0);

        const edge = EDGES[m.edge];
        const from = screenNodes.find((n) => n.id === edge.from)!;
        const to   = screenNodes.find((n) => n.id === edge.to)!;
        const mx   = lerp(from.sx, to.sx, Math.min(m.t, 1));
        const my   = lerp(from.sy, to.sy, Math.min(m.t, 1));

        const color = m.edge === 0 ? GOLD : TINT;

        // Glow
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, sx(9));
        grad.addColorStop(0, `${color}55`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(mx, my, sx(9), 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.globalAlpha = m.opacity;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(mx, my, sx(3), 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = m.opacity * 0.95;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      stateRef.current.raf = requestAnimationFrame(draw);
    }

    stateRef.current.raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(stateRef.current.raf);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: `${W} / ${H}` }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
}
