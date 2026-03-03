import { useEffect, useRef } from 'react';
import StarfieldEngine from '../lib/starfield-engine';
import { useMousePosition } from '../contexts/MouseContext';
import './StarfieldCanvas.css';

const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<StarfieldEngine | null>(null);
  const { clientX, clientY } = useMousePosition();

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) {
      console.warn('Canvas not supported, using CSS fallback');
      return;
    }

    const engine = new StarfieldEngine(canvasRef.current);
    engineRef.current = engine;
    engine.resize();
    engine.start();

    const handleResize = () => { engine.resize(); };
    window.addEventListener('resize', handleResize);

    return () => {
      engine.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Forward mouse position from context to the engine
  useEffect(() => {
    engineRef.current?.updateMouse(clientX, clientY);
  }, [clientX, clientY]);

  return (
    <canvas
      ref={canvasRef}
      className="starfield-canvas"
      aria-hidden="true"
    />
  );
};

export default Starfield;
