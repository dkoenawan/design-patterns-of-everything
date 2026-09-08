import React, { useState, useMemo } from 'react';

interface Pattern {
  title: string;
  domain: 'backend' | 'data' | 'frontend' | 'infra' | 'cross-domain';
  domainLabel: string;
  complexity: 'fundamentals' | 'core' | 'advanced' | 'expert';
  complexityRank: number;
  tags: string[];
  slug: string;
  summary: string;
}

interface Props {
  patterns: Pattern[];
  baseUrl: string;
}

const PatternsCatalogViz: React.FC<Props> = ({ patterns, baseUrl }) => {
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(
    new Set(['backend', 'data', 'frontend', 'infra', 'cross-domain'])
  );
  const [selectedComplexities, setSelectedComplexities] = useState<Set<string>>(
    new Set(['fundamentals', 'core', 'advanced', 'expert'])
  );
  const [searchTerm, setSearchTerm] = useState('');

  const domainLabels: Record<string, string> = {
    backend: 'Backend',
    data: 'Data Pipeline',
    frontend: 'Frontend',
    infra: 'Infrastructure',
    'cross-domain': 'Cross-Domain',
  };

  const domainColors: Record<string, string> = {
    backend: '#d49a7a',
    data: '#9ec48a',
    frontend: '#7aa3d4',
    infra: '#c8a4d4',
    'cross-domain': '#d4b15e',
  };

  const complexityLabels: Record<string, string> = {
    fundamentals: 'Fundamentals',
    core: 'Core',
    advanced: 'Advanced',
    expert: 'Expert',
  };

  const filtered = useMemo(() => {
    return patterns.filter((p) => {
      const domainMatch = selectedDomains.has(p.domain);
      const complexityMatch = selectedComplexities.has(p.complexity);
      const searchMatch =
        searchTerm === '' ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      return domainMatch && complexityMatch && searchMatch;
    });
  }, [selectedDomains, selectedComplexities, searchTerm]);

  const toggleDomain = (domain: string) => {
    const updated = new Set(selectedDomains);
    if (updated.has(domain)) {
      updated.delete(domain);
    } else {
      updated.add(domain);
    }
    setSelectedDomains(updated);
  };

  const toggleComplexity = (complexity: string) => {
    const updated = new Set(selectedComplexities);
    if (updated.has(complexity)) {
      updated.delete(complexity);
    } else {
      updated.add(complexity);
    }
    setSelectedComplexities(updated);
  };

  const patternUrl = (domain: string, slug: string) => {
    const domainMap: Record<string, string> = {
      backend: 'backend',
      data: 'data',
      frontend: 'frontend',
      infra: 'infra',
      'cross-domain': 'patterns/cross-domain',
    };
    return `${baseUrl}/${domainMap[domain]}/${slug.replace(/-/g, '-')}`;
  };

  return (
    <div className="catalog-container">
      {/* Search */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search patterns by name, summary, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Filters */}
      <div className="filter-section">
        <div className="filter-group">
          <h3 className="filter-label">By Domain</h3>
          <div className="filter-options">
            {['backend', 'data', 'frontend', 'infra', 'cross-domain'].map((domain) => (
              <label key={domain} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedDomains.has(domain)}
                  onChange={() => toggleDomain(domain)}
                />
                <span style={{ color: domainColors[domain] }}>
                  {domainLabels[domain]}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h3 className="filter-label">By Complexity</h3>
          <div className="filter-options">
            {['fundamentals', 'core', 'advanced', 'expert'].map((complexity) => (
              <label key={complexity} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedComplexities.has(complexity)}
                  onChange={() => toggleComplexity(complexity)}
                />
                <span>{complexityLabels[complexity]}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="results-section">
        <div className="results-header">
          <p className="results-count">
            {filtered.length} of {patterns.length} patterns
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="no-results">
            <p>No patterns match your filters.</p>
          </div>
        ) : (
          <div className="patterns-grid">
            {filtered.map((pattern) => (
              <a
                key={`${pattern.domain}-${pattern.slug}`}
                href={patternUrl(pattern.domain, pattern.slug)}
                className="pattern-card"
              >
                <div className="pattern-header">
                  <h3 className="pattern-title">{pattern.title}</h3>
                  <div className="pattern-badges">
                    <span
                      className="badge badge-domain"
                      style={{ color: domainColors[pattern.domain] }}
                    >
                      {domainLabels[pattern.domain]}
                    </span>
                    <span className="badge badge-complexity">
                      {complexityLabels[pattern.complexity]}
                    </span>
                  </div>
                </div>
                <p className="pattern-summary">{pattern.summary}</p>
                <div className="pattern-tags">
                  {pattern.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                  {pattern.tags.length > 3 && (
                    <span className="tag">+{pattern.tags.length - 3}</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .catalog-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
          padding: 20px 0;
        }

        .search-box {
          margin-bottom: 12px;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(10, 14, 26, 0.6);
          border: 0.5px solid var(--paper-border);
          color: var(--ink);
          font-family: var(--font-body);
          font-style: italic;
          font-size: 15px;
          line-height: 1.5;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--gold);
        }

        .search-input::placeholder {
          color: var(--ink-dim);
        }

        .filter-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          padding: 20px;
          background: rgba(10, 14, 26, 0.4);
          border: 0.5px solid var(--paper-border);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .filter-label {
          font-size: 13px;
          font-style: italic;
          color: var(--ink-dim);
          margin: 0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .filter-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: var(--ink);
        }

        .filter-checkbox input {
          cursor: pointer;
          width: 16px;
          height: 16px;
          accent-color: var(--gold);
        }

        .filter-checkbox span {
          user-select: none;
        }

        .results-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .results-count {
          font-size: 13px;
          color: var(--ink-dim);
          letter-spacing: 0.5px;
          margin: 0;
        }

        .no-results {
          padding: 40px 20px;
          text-align: center;
          color: var(--ink-dim);
          font-style: italic;
        }

        .patterns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        .pattern-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 20px;
          background: rgba(10, 14, 26, 0.6);
          border: 0.5px solid var(--paper-border);
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }

        .pattern-card:hover {
          background: rgba(10, 14, 26, 0.8);
          border-color: var(--gold);
        }

        .pattern-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pattern-title {
          font-size: 18px;
          font-style: italic;
          color: var(--ink);
          margin: 0;
          line-height: 1.3;
        }

        .pattern-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .badge {
          font-size: 11px;
          padding: 4px 8px;
          background: rgba(212, 177, 94, 0.15);
          border: 0.5px solid;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          font-style: normal;
        }

        .badge-domain {
          background: rgba(212, 177, 94, 0.1);
          border-color: currentColor;
        }

        .badge-complexity {
          background: rgba(232, 220, 184, 0.1);
          border-color: var(--ink-dim);
          color: var(--ink-dim);
        }

        .pattern-summary {
          font-size: 14px;
          line-height: 1.5;
          color: var(--ink-dim);
          margin: 0;
        }

        .pattern-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .tag {
          font-size: 12px;
          padding: 3px 6px;
          background: rgba(212, 177, 94, 0.1);
          color: var(--gold);
          border-radius: 2px;
          font-family: var(--font-mono);
        }

        @media (max-width: 768px) {
          .filter-section {
            grid-template-columns: 1fr;
          }

          .patterns-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PatternsCatalogViz;
