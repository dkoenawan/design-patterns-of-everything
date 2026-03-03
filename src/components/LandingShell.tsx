import { useRef } from 'react';
import { MouseProvider } from '../contexts/MouseContext';
import Starfield from './Starfield';
import HeroPanel from './HeroPanel';
import ConstellationPanel from './ConstellationPanel';
import FooterPanel from './FooterPanel';
import PanelIndicator from './PanelIndicator';
import { CONSTELLATIONS } from '../data/constellations';
import './LandingShell.css';

const PANEL_LABELS = [
  'Home',
  ...CONSTELLATIONS.map(c => c.name),
  'Origin',
];

const TOTAL_PANELS = PANEL_LABELS.length; // 1 hero + 8 domains + 1 footer = 10

export const LandingShell = () => {
  const trackRef = useRef<HTMLDivElement>(null);

  const goToPanel = (index: number) => {
    trackRef.current?.scrollTo({
      left: index * window.innerWidth,
      behavior: 'smooth',
    });
  };

  return (
    <MouseProvider>
      {/* Fixed cosmic backdrop */}
      <Starfield />

      {/* Horizontal scroll track */}
      <div className="sky-track" ref={trackRef} role="main">
        {/* Panel 0 — Hero */}
        <div className="sky-panel" id="panel-home" aria-label="Home">
          <HeroPanel onExplore={() => goToPanel(1)} />
        </div>

        {/* Panels 1–8 — Domains */}
        {CONSTELLATIONS.map((constellation, i) => (
          <div
            key={constellation.domain}
            className="sky-panel"
            id={`panel-${constellation.domain}`}
            aria-label={constellation.name}
          >
            <ConstellationPanel {...constellation} panelIndex={i + 1} />
          </div>
        ))}

        {/* Panel 9 — Footer / Origin */}
        <div className="sky-panel" id="panel-origin" aria-label="Origin">
          <FooterPanel />
        </div>
      </div>

      {/* Fixed dot navigation */}
      <PanelIndicator
        count={TOTAL_PANELS}
        labels={PANEL_LABELS}
        trackRef={trackRef}
      />
    </MouseProvider>
  );
};

export default LandingShell;
