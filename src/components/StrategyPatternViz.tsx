import { useRef, useEffect } from 'react';

// ── Layout constants ────────────────────────────────────────────────────────

const W = 640;
const H = 300;

const TINT_GOLD    = '#d4b15e';
const TINT_BLUE    = '#7aa3d4';
const TINT_ORANGE  = '#d49a7a';
const TINT_GREEN   = '#9ec48a';
const TINT_PURPLE  = '#c8a4d4';
const INK_DIM      = 'rgba(232,220,184,0.45)';
const INK_FAINT    = 'rgba(232,220,184,0.12)';
const BOX_BG       = 'rgba(14,20,42,0.82)';

// Node x positions
const X_CLIENT  = W * 0.09;
const X_CONTEXT = W * 0.36;
const X_STRAT   = W * 0.74;

// Strategy y positions (4 strategies)
const STRATEGIES = [
  { label: 'Standard',  sublabel: '2.5×weight',  color: TINT_BLUE,   y: H * 0.18 },
  { label: 'Express',   sublabel: '5.0×+10',      color: TINT_ORANGE, y: H * 0.39 },
  { label: 'Overnight', sublabel: '8.0×+25',      color: TINT_PURPLE, y: H * 0.61 },
  { label: 'Economy',   sublabel: '1.2×weight',   color: TINT_GREEN,  y: H * 0.82 },
];

const CLIENT_Y  = H * 0.50;
const CONTEXT_Y = H * 0.50;

// Timing
const STRATEGY_HOLD = 3.0;   // seconds to hold each strategy
const MOTE_INTERVAL = 0.55;  // seconds between motes on the active path

interface Mote {
  id: number;
  phase: 'to-context' | 'to-strategy' | 'returning';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
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
  maxR: number;
  color: string;
  alpha: number;
}

let _nextId = 0;

// ── Component ───────────────────────────────────────────────────────────────

export default function StrategyPatternViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    elapsed: 0,
    activeStrategy: 0,
    strategyTimer: 0.0,
    nextMote: 0.0,
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
      ctx: CanvasRenderingContext2D,
      x: number, y: number,
      label: string, sublabel: string,
      tint: string, active: boolean,
      cw: number, ch: number,
      hw = 48, hh = 18,
    ) {
      const bx = sx(x, cw), by = sy(y, ch);
      const bhw = sx(hw, cw), bhh = sy(hh, ch);

      ctx.fillStyle = active ? `${tint}22` : BOX_BG;
      ctx.strokeStyle = active ? tint : `${tint}55`;
      ctx.lineWidth = active ? 0.9 : 0.5;
      ctx.beginPath();
      ctx.rect(bx - bhw, by - bhh, bhw * 2, bhh * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = `normal 8px 'JetBrains Mono', monospace`;
      ctx.fillStyle = active ? tint : `${tint}88`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.toUpperCase(), bx, by - sy(4, ch));

      if (sublabel) {
        ctx.font = `italic 7px 'Cormorant Garamond', serif`;
        ctx.fillStyle = active ? `${tint}cc` : `${tint}44`;
        ctx.fillText(sublabel, bx, by + sy(5, ch));
      }
    }

    function spawnRing(x: number, y: number, color: string) {
      stateRef.current.rings.push({
        id: _nextId++,
        x, y, r: 4, maxR: 22,
        color, alpha: 0.7,
      });
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

      // ── Advance active strategy ─────────────────────────────────

      s.strategyTimer += dt;
      if (s.strategyTimer >= STRATEGY_HOLD) {
        s.strategyTimer = 0;
        s.activeStrategy = (s.activeStrategy + 1) % STRATEGIES.length;
        // Ring pulse on context when strategy switches
        spawnRing(sx(X_CONTEXT, cw), sy(CONTEXT_Y, ch), TINT_GOLD);
      }

      const activeStrat = STRATEGIES[s.activeStrategy];

      // ── Static structure ────────────────────────────────────────

      // Interface label
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.4;
      ctx.fillText('«interface»', sx(X_STRAT, cw), sy(H * 0.04, ch));
      ctx.fillText('ShippingStrategy', sx(X_STRAT, cw), sy(H * 0.09, ch));
      ctx.globalAlpha = 1;

      // Faint guide rail: client → context
      ctx.beginPath();
      ctx.moveTo(sx(X_CLIENT + 52, cw), sy(CLIENT_Y, ch));
      ctx.lineTo(sx(X_CONTEXT - 52, cw), sy(CONTEXT_Y, ch));
      ctx.strokeStyle = `${TINT_GOLD}28`;
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Guide rails from context to each strategy
      for (const st of STRATEGIES) {
        const isActive = st === activeStrat;
        ctx.beginPath();
        ctx.moveTo(sx(X_CONTEXT + 52, cw), sy(CONTEXT_Y, ch));
        ctx.lineTo(sx(X_STRAT - 52, cw), sy(st.y, ch));
        ctx.strokeStyle = isActive ? `${st.color}44` : `${st.color}14`;
        ctx.lineWidth = isActive ? 0.9 : 0.4;
        ctx.setLineDash(isActive ? [] : [3, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw "injected →" label on active rail
      {
        const mx = sx((X_CONTEXT + X_STRAT) / 2, cw);
        const my = sy((CONTEXT_Y + activeStrat.y) / 2, ch);
        ctx.font = `italic 7.5px 'Cormorant Garamond', serif`;
        ctx.fillStyle = activeStrat.color;
        ctx.globalAlpha = 0.6;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('injected', mx, my - 8);
        ctx.globalAlpha = 1;
      }

      // Draw strategy selector label inside context
      {
        const bx = sx(X_CONTEXT, cw);
        const by = sy(CONTEXT_Y, ch);
        ctx.font = `italic 7px 'Cormorant Garamond', serif`;
        ctx.fillStyle = activeStrat.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.55;
        ctx.fillText(`using: ${activeStrat.label}`, bx, by + sy(10, ch));
        ctx.globalAlpha = 1;
      }

      // Draw nodes
      // Client
      drawBox(ctx, X_CLIENT, CLIENT_Y, 'OrderService', 'caller', INK_DIM, true, cw, ch, 50, 18);

      // Context
      drawBox(ctx, X_CONTEXT, CONTEXT_Y, 'Checkout', 'context', TINT_GOLD, true, cw, ch, 50, 18);

      // Strategies
      for (const st of STRATEGIES) {
        const isActive = st === activeStrat;
        drawBox(ctx, X_STRAT, st.y, st.label, st.sublabel, st.color, isActive, cw, ch, 52, 18);
      }

      // Plate reference
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.22;
      ctx.fillText('Plate ii · Strategy Pattern · Backend Domain', sx(W / 2, cw), sy(H - 7, ch));
      ctx.globalAlpha = 1;

      // ── Spawn motes ─────────────────────────────────────────────

      s.nextMote -= dt;
      if (s.nextMote <= 0) {
        s.nextMote = MOTE_INTERVAL + Math.random() * 0.2;
        // Client → Context mote
        s.motes.push({
          id: _nextId++,
          phase: 'to-context',
          x: X_CLIENT + 52,
          y: CLIENT_Y,
          targetX: X_CONTEXT - 52,
          targetY: CONTEXT_Y,
          color: TINT_GOLD,
          alpha: 0.9,
          size: 2.8,
          speed: 160 + Math.random() * 30,
        });
      }

      // ── Update rings ─────────────────────────────────────────────

      s.rings = s.rings.filter((ring) => {
        ring.r += dt * 60;
        ring.alpha -= dt * 1.6;
        if (ring.alpha <= 0) return false;

        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = ring.alpha * 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;
        return true;
      });

      // ── Update & draw motes ──────────────────────────────────────

      const toRemove = new Set<number>();

      for (const m of s.motes) {
        const dx = m.targetX - m.x;
        const dy = m.targetY - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const stepD = sx(m.speed * dt, cw);

        if (dist < stepD + 1) {
          m.x = m.targetX;
          m.y = m.targetY;

          if (m.phase === 'to-context') {
            // Arrived at context — spawn ring, redirect to active strategy
            spawnRing(sx(X_CONTEXT, cw), sy(CONTEXT_Y, ch), TINT_GOLD);
            m.phase = 'to-strategy';
            m.color = activeStrat.color;
            m.targetX = X_STRAT - 52;
            m.targetY = activeStrat.y;
            m.x = X_CONTEXT + 52;
            m.y = CONTEXT_Y;
          } else if (m.phase === 'to-strategy') {
            // Arrived at strategy — spawn ring, return to context
            spawnRing(sx(X_STRAT - 4, cw), sy(activeStrat.y, ch), activeStrat.color);
            m.phase = 'returning';
            m.color = activeStrat.color;
            m.size = 2.2;
            m.alpha = 0.6;
            m.targetX = X_CLIENT + 52;
            m.targetY = CLIENT_Y;
          } else {
            // Returned to client — done
            toRemove.add(m.id);
          }
        } else {
          m.x += (dx / dist) * sx(m.speed * dt, cw) * (W / cw);
          m.y += (dy / dist) * sy(m.speed * dt, ch) * (H / ch);
        }

        if (toRemove.has(m.id)) continue;

        // Draw glow
        const mx = sx(m.x, cw);
        const my = sy(m.y, ch);
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
    <div style={{ position: 'relative', width: '100%', aspectRatio: '640 / 300' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
