import { useEffect, useRef } from 'react';
import StarfieldEngine from '../lib/starfield-engine';
import './StarfieldCanvas.css';

const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<StarfieldEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Check Canvas support
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) {
      console.warn('Canvas not supported, using CSS fallback');
      return;
    }

    // Initialize engine
    const engine = new StarfieldEngine(canvasRef.current);
    engineRef.current = engine;
    engine.resize();
    engine.start();

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      engine.updateMouse(e.clientX, e.clientY);
    };

    // Window resize
    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      engine.stop();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="starfield-canvas"
      aria-hidden="true"
    />
  );
};

export default Starfield;
