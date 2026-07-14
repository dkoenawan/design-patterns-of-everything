import { useRef, useEffect } from 'react';

const W = 640;
const H = 300;

const VALID_TINT   = '#9ec48a'; // data green
const REJECT_TINT  = '#c46a55'; // red
const SCHEMA_TINT  = '#d4b15e'; // gold
const INK_DIM      = 'rgba(232,220,184,0.45)';
const INK_FAINT    = 'rgba(232,220,184,0.14)';
const BOX_BG       = 'rgba(14,20,42,0.80)';

// X centres
const X_SOURCE    = W * 0.06;
const X_VALIDATOR = W * 0.46;
const X_OUTPUT    = W * 0.86;

// Y lanes
const Y_PASS   = H * 0.36;
const Y_REJECT = H * 0.76;
const Y_CENTER = H * 0.36; // records enter at this height

// Validator box dimensions
const VAL_HW = 58;
const VAL_HH = 20;

// Pulse animation state
interface SchemaPulse {
  id: number;
  t: number;     // 0..1
  color: string;
}

interface Mote {
  id: number;
  x: number;
  y: number;
  targetY: number;
  color: string;
  alpha: number;
  speed: number;  // px/s in W-space
  // phase: approaching→validating→decided→travelling→done
  phase: 'approach' | 'hold' | 'pass' | 'reject' | 'done';
  holdT: number;  // time spent in hold (validation delay)
  valid: boolean;
  errorTag: string;
}

const ERROR_TAGS = [
  'type: null',
  'missing field',
  'out of range',
  'format error',
  'null ref',
];

let _moteId = 0;

export default function SchemaValidationFlowViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    motes: [] as Mote[],
    pulses: [] as SchemaPulse[],
    nextSpawn: 0.4,
    pulseId: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = stateRef.current;

    function draw(ts: number) {
      const dt = Math.min((ts - (s.lastTime || ts)) / 1000, 0.05);
      s.lastTime = ts;

      const dpr = window.devicePixelRatio || 1;
      const cw = canvas!.clientWidth;
      const ch = canvas!.clientHeight;
      if (canvas!.width !== cw * dpr || canvas!.height !== ch * dpr) {
        canvas!.width = cw * dpr;
        canvas!.height = ch * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      const sx = (x: number) => (x / W) * cw;
      const sy = (y: number) => (y / H) * ch;

      // ── Background ──────────────────────────────────────────────
      ctx.fillStyle = 'rgba(10,14,26,0.70)';
      ctx.fillRect(0, 0, cw, ch);

      // Plate reference
      ctx.font = `400 italic 8px 'Cormorant Garamond', serif`;
      ctx.fillStyle = INK_FAINT;
      ctx.textAlign = 'center';
      ctx.fillText('Schema-Driven Validation · Data Pipeline Domain', sx(W / 2), sy(H - 8));
      ctx.textAlign = 'left';

      // ── Rails ───────────────────────────────────────────────────
      // Incoming rail: source → validator
      ctx.beginPath();
      ctx.moveTo(sx(X_SOURCE + 8), sy(Y_PASS));
      ctx.lineTo(sx(X_VALIDATOR - VAL_HW - 2), sy(Y_PASS));
      ctx.strokeStyle = 'rgba(232,220,184,0.10)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pass rail: validator → output
      ctx.beginPath();
      ctx.moveTo(sx(X_VALIDATOR + VAL_HW + 2), sy(Y_PASS));
      ctx.lineTo(sx(X_OUTPUT - 10), sy(Y_PASS));
      ctx.strokeStyle = `rgba(158,196,138,0.18)`;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Reject rail: validator → down
      ctx.beginPath();
      ctx.moveTo(sx(X_VALIDATOR), sy(Y_PASS + 20));
      ctx.lineTo(sx(X_VALIDATOR), sy(Y_REJECT - 10));
      ctx.strokeStyle = `rgba(196,106,85,0.20)`;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Source node ──────────────────────────────────────────────
      const srcX = sx(X_SOURCE);
      const srcY = sy(Y_PASS);
      ctx.beginPath();
      ctx.arc(srcX, srcY, sx(7), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(232,220,184,0.12)';
      ctx.fill();
      ctx.strokeStyle = INK_DIM;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.fillStyle = INK_DIM;
      ctx.letterSpacing = '1px';
      ctx.textAlign = 'center';
      ctx.fillText('SOURCE', srcX, sy(Y_PASS - 16));
      ctx.textAlign = 'left';
      ctx.letterSpacing = '0px';

      // ── Schema Validator box ──────────────────────────────────────
      const vx = sx(X_VALIDATOR);
      const vy = sy(Y_PASS);
      const vw = sx(VAL_HW * 2);
      const vh = sx(VAL_HH * 2);

      ctx.fillStyle = BOX_BG;
      ctx.fillRect(vx - vw / 2, vy - vh / 2, vw, vh);
      ctx.strokeStyle = `rgba(212,177,94,0.50)`;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(vx - vw / 2, vy - vh / 2, vw, vh);

      ctx.font = `400 italic 10px 'Cormorant Garamond', serif`;
      ctx.fillStyle = SCHEMA_TINT;
      ctx.letterSpacing = '1.5px';
      ctx.textAlign = 'center';
      ctx.fillText('SCHEMA', vx, vy - sy(3));
      ctx.fillText('VALIDATOR', vx, vy + sy(9));
      ctx.textAlign = 'left';
      ctx.letterSpacing = '0px';

      // ── Schema pulses (ripple on validation) ─────────────────────
      s.pulses = s.pulses.filter((p) => p.t < 1);
      for (const p of s.pulses) {
        p.t += dt * 1.8;
        const r = sx(VAL_HW * 0.4 + p.t * VAL_HW * 1.2);
        const alpha = (1 - p.t) * 0.35;
        ctx.beginPath();
        ctx.arc(vx, vy, r, 0, Math.PI * 2);
        ctx.strokeStyle = p.color === 'valid'
          ? `rgba(158,196,138,${alpha})`
          : `rgba(196,106,85,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // ── Output node (valid) ───────────────────────────────────────
      const outX = sx(X_OUTPUT);
      const outY = sy(Y_PASS);
      ctx.beginPath();
      ctx.arc(outX, outY, sx(9), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(158,196,138,0.10)';
      ctx.fill();
      ctx.strokeStyle = `rgba(158,196,138,0.55)`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.fillStyle = `rgba(158,196,138,0.65)`;
      ctx.letterSpacing = '1px';
      ctx.textAlign = 'center';
      ctx.fillText('VALID', outX, sy(Y_PASS - 16));
      ctx.textAlign = 'left';
      ctx.letterSpacing = '0px';

      // ── Reject bin ────────────────────────────────────────────────
      const binX = sx(X_VALIDATOR);
      const binY = sy(Y_REJECT);
      const binW = sx(80);
      const binH = sy(36);
      ctx.fillStyle = 'rgba(14,20,42,0.80)';
      ctx.fillRect(binX - binW / 2, binY - binH / 2, binW, binH);
      ctx.strokeStyle = `rgba(196,106,85,0.40)`;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(binX - binW / 2, binY - binH / 2, binW, binH);

      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.fillStyle = `rgba(196,106,85,0.55)`;
      ctx.letterSpacing = '1px';
      ctx.textAlign = 'center';
      ctx.fillText('REJECTED', binX, binY - sy(6));
      ctx.fillText('RECORDS', binX, binY + sy(6));
      ctx.textAlign = 'left';
      ctx.letterSpacing = '0px';

      // ── Spawn motes ───────────────────────────────────────────────
      s.nextSpawn -= dt;
      if (s.nextSpawn <= 0) {
        s.nextSpawn = 0.55 + Math.random() * 0.30;
        const valid = Math.random() > 0.28; // ~72% pass rate
        s.motes.push({
          id: _moteId++,
          x: sx(X_SOURCE + 10),
          y: sy(Y_PASS),
          targetY: sy(Y_PASS),
          color: 'rgba(232,220,184,0.70)',
          alpha: 0,
          speed: sx(72 + Math.random() * 24),
          phase: 'approach',
          holdT: 0,
          valid,
          errorTag: ERROR_TAGS[Math.floor(Math.random() * ERROR_TAGS.length)],
        });
      }

      // ── Update & draw motes ───────────────────────────────────────
      s.motes = s.motes.filter((m) => m.phase !== 'done');

      for (const m of s.motes) {
        // Fade in
        m.alpha = Math.min(m.alpha + dt * 4, 0.9);

        if (m.phase === 'approach') {
          const holdX = sx(X_VALIDATOR - VAL_HW - 8);
          m.x += m.speed * dt;
          if (m.x >= holdX) {
            m.x = holdX;
            m.phase = 'hold';
            m.holdT = 0;
          }
        } else if (m.phase === 'hold') {
          // Sit at the validator entrance for a moment (validation delay)
          m.holdT += dt;
          if (m.holdT >= 0.35) {
            // Emit pulse
            s.pulses.push({ id: s.pulseId++, t: 0, color: m.valid ? 'valid' : 'invalid' });
            if (m.valid) {
              m.phase = 'pass';
              m.color = VALID_TINT;
            } else {
              m.phase = 'reject';
              m.color = REJECT_TINT;
              m.targetY = sy(Y_REJECT);
            }
          }
        } else if (m.phase === 'pass') {
          m.x += m.speed * dt;
          if (m.x > sx(X_OUTPUT + 12)) {
            m.phase = 'done';
          }
        } else if (m.phase === 'reject') {
          // Move right past validator centre, then drop
          if (m.x < sx(X_VALIDATOR)) {
            m.x += m.speed * 0.6 * dt;
          }
          m.y += (m.targetY - m.y) * Math.min(dt * 5, 1);
          if (m.y >= m.targetY - sy(2) && m.x >= sx(X_VALIDATOR)) {
            m.alpha = Math.max(m.alpha - dt * 2.5, 0);
            if (m.alpha <= 0) m.phase = 'done';
          }
        }

        // Draw mote
        const r = sx(5);
        // Glow
        const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, r * 2.4);
        grad.addColorStop(0, m.color + '55');
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(m.x, m.y, r * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.globalAlpha = m.alpha;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(m.x, m.y, r, 0, Math.PI * 2);
        ctx.fillStyle = m.color;
        ctx.globalAlpha = m.alpha * 0.92;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Error tag for rejected motes (shown while dropping)
        if (m.phase === 'reject' && m.y > sy(Y_PASS + 20)) {
          const tagAlpha = Math.min((m.y - sy(Y_PASS + 20)) / sy(30), 1) * m.alpha;
          ctx.font = `400 italic 8px 'Cormorant Garamond', serif`;
          ctx.fillStyle = `rgba(196,106,85,${tagAlpha * 0.80})`;
          ctx.textAlign = 'center';
          ctx.fillText(m.errorTag, m.x, m.y - r - sy(3));
          ctx.textAlign = 'left';
        }
      }

      // ── Legend strip ─────────────────────────────────────────────
      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.letterSpacing = '1px';

      ctx.fillStyle = `rgba(232,220,184,0.35)`;
      ctx.fillText('→ APPROACH', sx(W * 0.03), sy(H * 0.92));

      ctx.fillStyle = `rgba(212,177,94,0.55)`;
      ctx.fillText('VALIDATE', sx(W * 0.36), sy(H * 0.92));

      ctx.fillStyle = `rgba(158,196,138,0.55)`;
      ctx.fillText('PASS ✓', sx(W * 0.57), sy(H * 0.92));

      ctx.fillStyle = `rgba(196,106,85,0.55)`;
      ctx.fillText('REJECT ✗', sx(W * 0.74), sy(H * 0.92));

      ctx.letterSpacing = '0px';

      s.raf = requestAnimationFrame(draw);
    }

    s.raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(s.raf);
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
