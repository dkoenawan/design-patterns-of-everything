import { useRef, useEffect } from 'react';

// ── Tree topology ─────────────────────────────────────────────────────────────

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  layer: number;
}

interface Edge {
  from: string;
  to: string;
  branch: number;
}

const W = 540;
const H = 320;
const TINT = '#7aa3d4';

const NODES: Node[] = [
  // Layer 0 — Page
  { id: 'page',          label: 'Page',           x: 270, y: 32,  layer: 0 },
  // Layer 1 — Organisms
  { id: 'header',        label: 'Header',          x: 90,  y: 108, layer: 1 },
  { id: 'main',          label: 'Main',            x: 270, y: 108, layer: 1 },
  { id: 'sidebar',       label: 'Sidebar',         x: 450, y: 108, layer: 1 },
  // Layer 2 — Molecules
  { id: 'nav',           label: 'Nav',             x: 54,  y: 192, layer: 2 },
  { id: 'logo',          label: 'Logo',            x: 126, y: 192, layer: 2 },
  { id: 'content',       label: 'Content',         x: 216, y: 192, layer: 2 },
  { id: 'toolbar',       label: 'Toolbar',         x: 324, y: 192, layer: 2 },
  { id: 'panel',         label: 'Panel',           x: 450, y: 192, layer: 2 },
  // Layer 3 — Atoms
  { id: 'link',          label: 'Link',            x: 54,  y: 272, layer: 3 },
  { id: 'icon',          label: 'Icon',            x: 126, y: 272, layer: 3 },
  { id: 'text',          label: 'Text',            x: 216, y: 272, layer: 3 },
  { id: 'btn',           label: 'Button',          x: 324, y: 272, layer: 3 },
  { id: 'badge',         label: 'Badge',           x: 414, y: 272, layer: 3 },
  { id: 'tag',           label: 'Tag',             x: 486, y: 272, layer: 3 },
];

const EDGES: Edge[] = [
  { from: 'page',    to: 'header',  branch: 0 },
  { from: 'page',    to: 'main',    branch: 1 },
  { from: 'page',    to: 'sidebar', branch: 2 },
  { from: 'header',  to: 'nav',     branch: 0 },
  { from: 'header',  to: 'logo',    branch: 0 },
  { from: 'main',    to: 'content', branch: 1 },
  { from: 'main',    to: 'toolbar', branch: 1 },
  { from: 'sidebar', to: 'panel',   branch: 2 },
  { from: 'nav',     to: 'link',    branch: 0 },
  { from: 'logo',    to: 'icon',    branch: 0 },
  { from: 'content', to: 'text',    branch: 1 },
  { from: 'toolbar', to: 'btn',     branch: 1 },
  { from: 'panel',   to: 'badge',   branch: 2 },
  { from: 'panel',   to: 'tag',     branch: 2 },
];

// 5 named prop-flow paths (branch 0–4)
const PATHS: string[][] = [
  ['page', 'header', 'nav', 'link'],
  ['page', 'main', 'content', 'text'],
  ['page', 'sidebar', 'panel', 'badge'],
  ['page', 'header', 'logo', 'icon'],
  ['page', 'main', 'toolbar', 'btn'],
];

const BRANCH_COLORS = [
  '#7aa3d4',
  '#d49a7a',
  '#9ec48a',
  '#c8a4d4',
  '#f1d98a',
];

const LAYER_LABELS = ['Page', 'Organisms', 'Molecules', 'Atoms'];

// ── Particle state ────────────────────────────────────────────────────────────

interface Particle {
  branch: number;
  progress: number;  // 0–1 along path (3 edges)
  speed: number;
}

const nodeById = new Map(NODES.map((n) => [n.id, n]));

function lerpNode(pathIds: string[], t: number): { x: number; y: number } {
  const segCount = pathIds.length - 1;
  const segT = t * segCount;
  const segIdx = Math.min(Math.floor(segT), segCount - 1);
  const localT = segT - segIdx;
  const a = nodeById.get(pathIds[segIdx])!;
  const b = nodeById.get(pathIds[segIdx + 1])!;
  return {
    x: a.x + (b.x - a.x) * localT,
    y: a.y + (b.y - a.y) * localT,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ComponentTreeViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    particles: Particle[];
    raf: number;
    lastTime: number;
  }>({
    particles: [],
    raf: 0,
    lastTime: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Initialise particles — 2 per branch, offset so they don't bunch
    const particles: Particle[] = [];
    for (let b = 0; b < 5; b++) {
      particles.push({ branch: b, progress: (b * 0.2) % 1, speed: 1 / (2.4 * 60) });
      particles.push({ branch: b, progress: ((b * 0.2) + 0.5) % 1, speed: 1 / (2.4 * 60) });
    }
    stateRef.current.particles = particles;

    function draw(ts: number) {
      const dt = Math.min(ts - (stateRef.current.lastTime || ts), 50);
      stateRef.current.lastTime = ts;

      const dpr = window.devicePixelRatio || 1;
      const cw = canvas!.clientWidth;
      const ch = canvas!.clientHeight;
      if (canvas!.width !== cw * dpr || canvas!.height !== ch * dpr) {
        canvas!.width = cw * dpr;
        canvas!.height = ch * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, cw, ch);

      const scaleX = cw / W;
      const scaleY = ch / H;

      function sx(x: number) { return x * scaleX; }
      function sy(y: number) { return y * scaleY; }

      // Draw layer dividers + labels
      const layerYs = [20, 96, 180, 260];
      for (let i = 0; i < LAYER_LABELS.length; i++) {
        const y = sy(layerYs[i]);
        ctx.save();
        ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
        ctx.fillStyle = 'rgba(232,220,184,0.20)';
        ctx.letterSpacing = '2px';
        ctx.fillText(LAYER_LABELS[i].toUpperCase(), sx(4), y + 4);
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cw, y);
        ctx.strokeStyle = 'rgba(212,177,94,0.07)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw edges
      for (const edge of EDGES) {
        const a = nodeById.get(edge.from)!;
        const b = nodeById.get(edge.to)!;
        ctx.beginPath();
        ctx.moveTo(sx(a.x), sy(a.y));
        ctx.lineTo(sx(b.x), sy(b.y));
        ctx.strokeStyle = 'rgba(212,177,94,0.18)';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw nodes
      for (const node of NODES) {
        const r = node.layer === 0 ? 7 : node.layer === 1 ? 5 : node.layer === 2 ? 4 : 3;
        const nx = sx(node.x);
        const ny = sy(node.y);

        // Outer glow
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, r * 3);
        grad.addColorStop(0, `${TINT}28`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(nx, ny, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fillStyle = TINT;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Hairline ring
        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.strokeStyle = TINT;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Label
        ctx.font = `400 italic ${node.layer < 2 ? 10 : 9}px 'Cormorant Garamond', serif`;
        ctx.fillStyle = 'rgba(232,220,184,0.72)';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx, ny + r + 10);
      }

      // Advance + draw particles
      for (const p of stateRef.current.particles) {
        const dtSecs = dt / 1000;
        p.progress += p.speed * dtSecs * 60;
        if (p.progress >= 1) p.progress -= 1;

        const path = PATHS[p.branch];
        const pos = lerpNode(path, p.progress);
        const color = BRANCH_COLORS[p.branch];
        const px = sx(pos.x);
        const py = sy(pos.y);

        // Trail
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `${color}55`;
        ctx.fill();

        // Core mote
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      stateRef.current.raf = requestAnimationFrame(draw);
    }

    stateRef.current.raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '540 / 320' }}>
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
