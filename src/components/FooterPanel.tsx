export const FooterPanel = () => {
  return (
    <div className="footer-panel">
      <div className="footer-panel__inner">
        <h2 className="footer-panel__title text-gradient-stellar">Origin</h2>
        <p className="body-lg footer-panel__intro">
          This map is drawn from real production systems — architecture decisions made under
          constraint, patterns proven through implementation, and lessons learned from
          trade-offs encountered in the field.
        </p>

        <div className="footer-panel__cards">
          <div className="footer-panel__card glass-surface hover-border-glow">
            <h3>Charted Through Experience</h3>
            <p>
              Every pattern documented here solved a real problem in a production system.
              Complexity ratings reflect actual implementation challenges. Case studies show
              the terrain as it was encountered — constraints, trade-offs, outcomes.
            </p>
          </div>
          <div className="footer-panel__card glass-surface hover-border-glow">
            <h3>Organized by Territory</h3>
            <p>
              Architecture knowledge naturally clusters into domains. Frontend, backend, data
              pipelines, infrastructure, DevOps, network, security, and AI each have distinct
              patterns and principles. The map respects these boundaries while showing where
              they connect.
            </p>
          </div>
          <div className="footer-panel__card glass-surface hover-border-glow">
            <h3>Built to Be Navigated</h3>
            <p>
              Skill trees visualize progression paths. Patterns link to related concepts.
              Anti-patterns mark known hazards. The structure reveals not just what to know,
              but how understanding develops across a career.
            </p>
          </div>
        </div>

        <div className="footer-panel__contact">
          <p className="body-lg">
            This portfolio is actively evolving. More patterns, case studies, and interactive
            visualizations coming soon.
          </p>
          <p className="text-amber-glow footer-panel__contact-note">
            Professional inquiries and collaboration opportunities welcome.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FooterPanel;
