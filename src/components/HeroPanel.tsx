interface HeroPanelProps {
  onExplore: () => void;
}

export const HeroPanel = ({ onExplore }: HeroPanelProps) => {
  return (
    <div className="hero-panel">
      {/* Decorative constellation SVG */}
      <svg
        className="hero-panel__constellation"
        aria-hidden="true"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid meet"
      >
        <circle cx="20%" cy="30%" r="4" className="star star-frontend" />
        <circle cx="80%" cy="30%" r="4" className="star star-backend" />
        <circle cx="25%" cy="70%" r="4" className="star star-data" />
        <circle cx="75%" cy="70%" r="4" className="star star-infra" />
        <line x1="20%" y1="30%" x2="80%" y2="30%" className="constellation-line" />
        <line x1="20%" y1="30%" x2="25%" y2="70%" className="constellation-line" />
        <line x1="80%" y1="30%" x2="75%" y2="70%" className="constellation-line" />
        <line x1="25%" y1="70%" x2="75%" y2="70%" className="constellation-line" />
        <line x1="20%" y1="30%" x2="75%" y2="70%" className="constellation-line diagonal" />
        <line x1="80%" y1="30%" x2="25%" y2="70%" className="constellation-line diagonal" />
        <circle cx="10%" cy="15%" r="2.5" className="ambient-star" opacity="0.6" />
        <circle cx="90%" cy="20%" r="2"   className="ambient-star" opacity="0.5" />
        <circle cx="15%" cy="85%" r="1.5" className="ambient-star" opacity="0.7" />
        <circle cx="85%" cy="80%" r="1.5" className="ambient-star blue" opacity="0.4" />
        <circle cx="50%" cy="10%" r="2"   className="ambient-star blue" opacity="0.5" />
        <circle cx="45%" cy="90%" r="2"   className="ambient-star" opacity="0.6" />
        <circle cx="5%"  cy="50%" r="1.5" className="ambient-star" opacity="0.5" />
        <circle cx="95%" cy="55%" r="1.5" className="ambient-star" opacity="0.6" />
      </svg>

      <div className="hero-panel__content">
        <h1 className="display text-gradient-stellar animate-rise">
          Navigate the architecture landscape
        </h1>
        <p className="body-lg hero-panel__subtitle animate-rise">
          A constellation of design patterns mapped across eight domains. Each node represents
          proven solutions, hard-won experience, and the connections between architectural
          decisions. Like a star chart for software systems.
        </p>
        <button
          className="btn btn-primary animate-rise hero-panel__cta"
          onClick={onExplore}
          aria-label="Begin exploration — navigate to first domain"
        >
          Begin exploration →
        </button>
      </div>
    </div>
  );
};

export default HeroPanel;
