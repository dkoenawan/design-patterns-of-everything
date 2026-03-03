import { createContext, useContext, useEffect, useState } from 'react';

interface MousePosition {
  clientX: number;
  clientY: number;
}

const MouseContext = createContext<MousePosition>({ clientX: 0, clientY: 0 });

export const useMousePosition = () => useContext(MouseContext);

export const MouseProvider = ({ children }: { children: React.ReactNode }) => {
  const [pos, setPos] = useState<MousePosition>({ clientX: 0, clientY: 0 });

  useEffect(() => {
    const h = (e: MouseEvent) =>
      setPos({ clientX: e.clientX, clientY: e.clientY });
    window.addEventListener('mousemove', h, { passive: true });
    return () => window.removeEventListener('mousemove', h);
  }, []);

  return <MouseContext.Provider value={pos}>{children}</MouseContext.Provider>;
};
