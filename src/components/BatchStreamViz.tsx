import { useRef, useEffect } from 'react';

const W = 560;
const H = 300;

const BATCH_TINT   = '#9ec48a'; // data green
const STREAM_TINT  = '#d4b15e'; // gold
const REJECT_TINT  = '#c46a55';
const INK_DIM      = 'rgba(232,220,184,0.45)';
const INK_FAINT    = 'rgba(232,220,184,0.18)';
const LANE_STROKE  = 'rgba(232,220,184,0.10)';

const BATCH_WINDOW   = 3.2;  // seconds to fill a batch
const FLUSH_DURATION = 0.5;  // seconds for flush animation

interface Record {
  id: number;
  x: number;
  y: number;
  vx: number;
  opacity: number;
  phase: 'settle' | 'flush' | 'done';
  slot: number; // grid column in batch queue
}

interface StreamMote {
  id: number;
  x: number;
  opacity: number;
  speed: number;
  y: number;
  color: string;
}

let recId = 0;
let moteId = 0;

export default function BatchStreamViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    elapsed: 0,
    batchClock: 0,
    records: [] as Record[],
    motes: [] as StreamMote[],
    nextRecord: 0.35,
    nextMote: 0.12,
    flushActive: false,
    flushT: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = stateRef.current;

    function draw(ts: number) {
      const dt = Math.min((ts - (s.lastTime || ts)) / 1000, 0.05);
      s.lastTime = ts;
      s.elapsed += dt;
      s.batchClock += dt;

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

      // ── Background ───────────────────────────────────────────────
      // Top lane (Batch)
      ctx.fillStyle = 'rgba(14,20,42,0.55)';
      ctx.fillRect(0, 0, cw, sy(H / 2));
      // Bottom lane (Stream)
      ctx.fillStyle = 'rgba(10,14,26,0.60)';
      ctx.fillRect(0, sy(H / 2), cw, sy(H / 2));

      // Divider
      ctx.beginPath();
      ctx.moveTo(0, sy(H / 2));
      ctx.lineTo(cw, sy(H / 2));
      ctx.strokeStyle = LANE_STROKE;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Lane labels
      ctx.font = `400 italic 10px 'Cormorant Garamond', serif`;
      ctx.fillStyle = INK_FAINT;
      ctx.letterSpacing = '2px';
      ctx.fillText('BATCH', sx(8), sy(14));
      ctx.fillText('STREAM', sx(8), sy(H / 2 + 14));
      ctx.letterSpacing = '0px';

      // Plate reference
      ctx.font = `400 italic 8px 'Cormorant Garamond', serif`;
      ctx.fillStyle = 'rgba(232,220,184,0.10)';
      ctx.textAlign = 'center';
      ctx.fillText('Batch vs Streaming · Data Pipeline Domain', sx(W / 2), sy(H - 8));
      ctx.textAlign = 'left';

      // ── BATCH lane ───────────────────────────────────────────────
      const batchFill = s.batchClock / BATCH_WINDOW; // 0..1
      const bufferX0 = sx(40);
      const bufferX1 = sx(340);
      const bufferY0 = sy(34);
      const bufferY1 = sy(H / 2 - 22);
      const bufferW  = bufferX1 - bufferX0;
      const bufferH  = bufferY1 - bufferY0;

      // Buffer box
      ctx.strokeStyle = `rgba(158,196,138,0.25)`;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(bufferX0, bufferY0, bufferW, bufferH);

      // Fill indicator
      const fillH = bufferH * Math.min(batchFill, 1);
      ctx.fillStyle = `rgba(158,196,138,0.10)`;
      ctx.fillRect(bufferX0, bufferY0 + bufferH - fillH, bufferW, fillH);

      // Buffer label
      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.fillStyle = `rgba(158,196,138,0.50)`;
      ctx.letterSpacing = '1px';
      ctx.fillText('BUFFER', sx(42), sy(44));
      ctx.letterSpacing = '0px';

      // "Process" box (right)
      const procX = sx(360);
      const procY = sy(50);
      const procW = sx(160);
      const procH = sy(80);
      ctx.strokeStyle = `rgba(158,196,138,0.35)`;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(procX, procY, procW, procH);
      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.fillStyle = `rgba(158,196,138,0.45)`;
      ctx.letterSpacing = '1px';
      ctx.fillText('PROCESS', procX + sx(8), procY + sy(14));
      ctx.letterSpacing = '0px';

      // Arrow buffer → process (only solid during flush)
      const arrowOpacity = s.flushActive ? 0.7 : 0.15;
      ctx.beginPath();
      ctx.moveTo(bufferX1 + sx(2), sy(H / 4));
      ctx.lineTo(procX - sx(2), sy(H / 4));
      ctx.strokeStyle = `rgba(158,196,138,${arrowOpacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(procX - sx(2), sy(H / 4) - 4);
      ctx.lineTo(procX + sx(4), sy(H / 4));
      ctx.lineTo(procX - sx(2), sy(H / 4) + 4);
      ctx.closePath();
      ctx.fillStyle = `rgba(158,196,138,${arrowOpacity})`;
      ctx.fill();

      // Spawn batch records
      if (!s.flushActive && batchFill < 1) {
        s.nextRecord -= dt;
        if (s.nextRecord <= 0) {
          s.nextRecord = 0.28 + Math.random() * 0.18;
          const slot = s.records.length;
          if (slot < 12) {
            const col = slot % 6;
            const row = Math.floor(slot / 6);
            const tx = sx(52 + col * 44);
            const ty = sy(60 + row * 40);
            s.records.push({
              id: recId++,
              x: sx(-10),
              y: ty,
              vx: 280,
              opacity: 0,
              phase: 'settle',
              slot,
            });
          }
        }
      }

      // Trigger flush
      if (s.batchClock >= BATCH_WINDOW && !s.flushActive) {
        s.flushActive = true;
        s.flushT = 0;
        s.records.forEach((r) => { r.phase = 'flush'; });
      }

      if (s.flushActive) {
        s.flushT += dt;
        if (s.flushT >= FLUSH_DURATION) {
          s.flushActive = false;
          s.batchClock = 0;
          s.records = [];
          s.nextRecord = 0.28;
        }
      }

      // Draw + update batch records
      for (const r of s.records) {
        if (r.phase === 'settle') {
          const col = r.slot % 6;
          const row = Math.floor(r.slot / 6);
          const tx = sx(52 + col * 44);
          const ty = sy(60 + row * 40);
          r.x += (tx - r.x) * Math.min(dt * 8, 1);
          r.opacity = Math.min(r.opacity + dt * 4, 0.85);
        } else if (r.phase === 'flush') {
          r.x += dt * sx(600);
          r.opacity = Math.max(r.opacity - dt * 3, 0);
        }

        ctx.beginPath();
        ctx.rect(r.x - sx(7), r.y - sy(7), sx(14), sy(14));
        ctx.fillStyle = `rgba(158,196,138,${r.opacity * 0.6})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(158,196,138,${r.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Batch clock tick marker
      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.fillStyle = `rgba(158,196,138,0.40)`;
      const pct = Math.round(Math.min(batchFill, 1) * 100);
      ctx.fillText(`${pct}%`, sx(44), sy(H / 2 - 26));

      // ── STREAM lane ──────────────────────────────────────────────
      const laneY0 = sy(H / 2);
      const laneH  = sy(H / 2);
      const channelY = laneY0 + laneH / 2;

      // Continuous flow line
      ctx.beginPath();
      ctx.moveTo(0, channelY);
      ctx.lineTo(cw, channelY);
      ctx.strokeStyle = `rgba(212,177,94,0.12)`;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Process box (stream side)
      const sProcX = sx(360);
      const sProcY = laneY0 + sy(40);
      const sProcW = sx(160);
      const sProcH = sy(60);
      ctx.strokeStyle = `rgba(212,177,94,0.30)`;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(sProcX, sProcY, sProcW, sProcH);
      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.fillStyle = `rgba(212,177,94,0.40)`;
      ctx.letterSpacing = '1px';
      ctx.fillText('PROCESS', sProcX + sx(8), sProcY + sy(14));
      ctx.letterSpacing = '0px';

      // Spawn stream motes
      s.nextMote -= dt;
      if (s.nextMote <= 0) {
        s.nextMote = 0.10 + Math.random() * 0.14;
        const spread = (Math.random() - 0.5) * sy(28);
        const colors = [STREAM_TINT, '#f1d98a', '#e8dcb8', '#d4b15e'];
        s.motes.push({
          id: moteId++,
          x: sx(-6),
          opacity: 0,
          speed: sx(90 + Math.random() * 40),
          y: channelY + spread,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      // Draw + update stream motes
      s.motes = s.motes.filter((m) => m.x < cw + sx(20) && m.opacity >= 0);
      for (const m of s.motes) {
        m.x += m.speed * dt;
        if (m.x < sx(30)) m.opacity = Math.min(m.opacity + dt * 6, 0.9);
        if (m.x > cw - sx(30)) m.opacity = Math.max(m.opacity - dt * 4, 0);

        // Glow
        const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, sx(10));
        grad.addColorStop(0, `${m.color}44`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(m.x, m.y, sx(10), 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.globalAlpha = m.opacity;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(m.x, m.y, sx(3.5), 0, Math.PI * 2);
        ctx.fillStyle = m.color;
        ctx.globalAlpha = m.opacity * 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Latency label
      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.fillStyle = `rgba(212,177,94,0.40)`;
      ctx.fillText('low latency · per-event', sx(44), laneY0 + sy(18));

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
