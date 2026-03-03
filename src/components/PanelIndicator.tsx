import { useEffect, useRef, useState } from 'react';

interface PanelIndicatorProps {
  count: number;
  labels: string[];
  trackRef: React.RefObject<HTMLDivElement | null>;
}

export const PanelIndicator = ({ count, labels, trackRef }: PanelIndicatorProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleScroll = () => {
      const idx = Math.round(track.scrollLeft / window.innerWidth);
      setActiveIndex(idx);
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => track.removeEventListener('scroll', handleScroll);
  }, [trackRef]);

  const goToPanel = (i: number) => {
    trackRef.current?.scrollTo({
      left: i * window.innerWidth,
      behavior: 'smooth',
    });
  };

  return (
    <nav className="panel-indicator" aria-label="Panel navigation">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          className={`indicator-dot${i === activeIndex ? ' active' : ''}`}
          onClick={() => goToPanel(i)}
          aria-label={labels[i] ?? `Panel ${i + 1}`}
          aria-current={i === activeIndex ? 'true' : undefined}
          title={labels[i]}
        />
      ))}
    </nav>
  );
};

export default PanelIndicator;
