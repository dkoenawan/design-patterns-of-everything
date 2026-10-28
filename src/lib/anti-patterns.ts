// The anti-pattern catalog's hazard register. anti-patterns.astro renders it,
// BlastRadiusViz plots it, pattern pages read `remedies` to link back to the
// anti-patterns they remedy, and domain pages list the entries in their domain.

import type { DomainId } from './atlas-data';

export interface AntiPattern {
  id: string;
  name: string;
  domain: string;
  domainLabel: string;
  severity: 1 | 2 | 3 | 4 | 5;
  symptom: string;
  consequence: string;
  mitigation: string;
  tint: string;
  /** Pattern ids (atlas-data) named in the mitigation, linked to their pages. */
  remedies: string[];
}

export const antiPatterns: AntiPattern[] = [
  {
    id: 'god-object',
    name: 'God Object',
    domain: 'BE',
    domainLabel: 'Backend',
    severity: 5,
    symptom:
      'A single class or service accumulates unrelated responsibilities — models, validation, persistence, formatting, and business logic all cohabit.',
    consequence:
      'Changes ripple unpredictably. Testing requires instantiating the universe. Onboarding becomes archaeology.',
    mitigation:
      'Apply Single Responsibility rigorously. Extract cohesive subsets into focused services. Use hexagonal boundaries to enforce dependency direction.',
    tint: 'var(--tint-backend)',
    remedies: ['single-responsibility', 'hexagonal-architecture'],
  },
  {
    id: 'premature-generalisation',
    name: 'Premature Generalisation',
    domain: 'XD',
    domainLabel: 'Cross-Domain',
    severity: 3,
    symptom:
      'Abstractions are introduced before the second concrete use case exists — base classes, plugin systems, and configuration-driven behaviour built for hypothetical callers.',
    consequence:
      'The abstraction hardens against the actual requirements that arrive later. You end up rewriting both the abstraction and its one real consumer.',
    mitigation:
      'Follow the Rule of Three: duplicate once, abstract on the third instance. Prefer composition over inheritance until the seam is proven stable.',
    tint: 'var(--gold)',
    remedies: ['composition-over-inheritance'],
  },
  {
    id: 'pipeline-fan-out-without-backpressure',
    name: 'Unbounded Fan-out',
    domain: 'DP',
    domainLabel: 'Data Pipeline',
    severity: 4,
    symptom:
      'A pipeline stage emits work faster than downstream stages can consume it — queues grow without bound, memory pressure climbs, and latency degrades silently.',
    consequence:
      'Under load the system collapses, not gracefully degrades. Recovery requires manual intervention and replay. Data may be lost or double-processed.',
    mitigation:
      'Design backpressure into every fan-out: bounded queues with blocking or drop-with-alert semantics. Monitor queue depth as a first-class SLI. Apply schema-driven validation at ingest to reduce downstream volume early.',
    tint: 'var(--tint-data)',
    remedies: ['schema-driven-validation'],
  },
  {
    id: 'snowflake-server',
    name: 'Snowflake Server',
    domain: 'INFRA',
    domainLabel: 'Infrastructure',
    severity: 4,
    symptom:
      'A production host has been patched, configured, and adjusted by hand over months or years. No two instances are identical. Nobody can reproduce the environment from source, and the runbook is tribal knowledge held by one engineer.',
    consequence:
      'Incident recovery is guesswork. Scaling horizontally creates invisible inconsistency. Rotating that engineer out means a production black box. Audits fail because the desired state is undocumented.',
    mitigation:
      'Treat infrastructure as code from day one. Encode every configuration change in IaC (Terraform, Pulumi, or equivalent). Use immutable image builds — provision, never patch in place. Enforce drift detection in CI so any manual change surfaces as a diff.',
    tint: 'var(--tint-infra)',
    remedies: ['infrastructure-as-code'],
  },
  {
    id: 'prop-drilling',
    name: 'Prop Drilling',
    domain: 'FE',
    domainLabel: 'Frontend',
    severity: 3,
    symptom:
      'Data that is consumed deep in a component tree is threaded through every intermediate layer as props — components that neither use nor care about the value become unwilling carriers of it.',
    consequence:
      'Refactoring is expensive: renaming or removing a prop requires touching every layer in the chain. Intermediate components become tightly coupled to their children\'s data needs, eroding reusability and making the component contract impossible to reason about at a glance.',
    mitigation:
      'Push state down to the lowest component that owns it; lift it only when genuinely shared. For cross-cutting state, use context or a dedicated state atom — but prefer co-location first. Compound component patterns can eliminate drilling within a bounded family of components without reaching for global state.',
    tint: 'var(--tint-frontend)',
    remedies: ['state-management-patterns', 'component-composition'],
  },
  {
    id: 'anemic-domain-model',
    name: 'Anemic Domain Model',
    domain: 'BE',
    domainLabel: 'Backend',
    severity: 3,
    symptom:
      'Domain objects are reduced to plain data bags — getters and setters with no behaviour. All business logic lives in separate "service" classes that pull data out, mutate it, and push it back.',
    consequence:
      'Invariants are enforced nowhere in particular, so they are enforced inconsistently everywhere. The same validation gets duplicated across services, or worse, skipped. The domain model stops communicating the rules of the domain — reading the code no longer tells you what is and isn\'t a valid state.',
    mitigation:
      'Move behaviour onto the objects that own the data it operates on. An order should know how to check itself out; a cart should know whether it can accept another item. Reserve services for orchestration across multiple aggregates, not for logic that belongs to a single one.',
    tint: 'var(--tint-backend)',
    remedies: [],
  },
  {
    id: 'unmemoized-rerender-cascade',
    name: 'Unmemoized Re-render Cascade',
    domain: 'FE',
    domainLabel: 'Frontend',
    severity: 2,
    symptom:
      'A component high in the tree holds state that changes frequently, and every descendant re-renders on each change because props are new object or function literals created inline on every render, defeating shallow-equality checks.',
    consequence:
      'The tree re-renders far more than the visible output requires. Interactions feel sluggish under load, profiling shows wide re-render fan-out from a single state update, and the fix is usually invisible until a profiler is attached — by then it is load-bearing behaviour nobody wants to touch.',
    mitigation:
      'Memoize expensive subtrees with the framework\'s memo primitive, and stabilise the props passed into them — hoist literals, memoize callbacks and derived objects. Push state down to the narrowest owner (pairs with Prop Drilling\'s fix) so updates only invalidate the subtree that actually needs them.',
    tint: 'var(--tint-frontend)',
    remedies: ['state-management-patterns'],
  },
  {
    id: 'silent-schema-drift',
    name: 'Silent Schema Drift',
    domain: 'DP',
    domainLabel: 'Data Pipeline',
    severity: 4,
    symptom:
      'An upstream producer adds, renames, or retypes a field without coordinating downstream. The pipeline has no schema contract enforced at the boundary, so the new shape is accepted, coerced, or silently dropped rather than rejected.',
    consequence:
      'Bad values propagate through every downstream stage before anyone notices — often surfacing weeks later as a subtly wrong aggregate or a dashboard nobody trusts anymore. Root-causing requires replaying history to find the exact commit where the shape changed, because no failure was ever raised at the point of ingest.',
    mitigation:
      'Enforce a schema contract at every trust boundary and fail closed on violation rather than coercing silently. Version schemas explicitly and require producers to bump the version on breaking changes. Pairs with Schema-Driven Validation: validate at ingest, not several stages downstream where the origin of a bad record is already lost.',
    tint: 'var(--tint-data)',
    remedies: ['schema-driven-validation'],
  },
  {
    id: 'tightly-coupled-service-dependencies',
    name: 'Tightly-Coupled Service Dependencies',
    domain: 'INFRA',
    domainLabel: 'Infrastructure',
    severity: 4,
    symptom:
      'Services are tightly woven together: direct internal client libraries passed between teams, synchronous chains of HTTP calls, shared internal schema changes that cascade through a dozen callers, or no clear API boundary between components.',
    consequence:
      'A patch to one service breaks callers with no warning. Deployments become globally coordinated bottlenecks. Scaling one service requires knowing which three others will melt. Incidents in a dependency pull down the entire stack. Teams cannot move independently.',
    mitigation:
      'Design explicit service boundaries with versioned APIs; clients pin versions and decouple deployment timing. Prefer asynchronous messaging over direct calls where the dependency can tolerate latency. Publish interface contracts as code and validate them in CI. Track service dependencies as a first-class asset for blast-radius analysis.',
    tint: 'var(--tint-infra)',
    remedies: [],
  },
  {
    id: 'shotgun-surgery',
    name: 'Shotgun Surgery',
    domain: 'XD',
    domainLabel: 'Cross-Domain',
    severity: 3,
    symptom:
      'A single logical change requires edits scattered across dozens of files — each client has its own copy of validation logic, each adapter re-implements the same translation, or a data shape change echoes through the entire codebase.',
    consequence:
      'The cost of a change becomes impossible to estimate. Edits are easily missed, leaving the system in an inconsistent state. The real dependencies and impact radius become invisible in the scatter. Regression tests miss cases because the coupling is implicit.',
    mitigation:
      'Extract the piece of knowledge that ought to be singular into one place: a shared validation library, a codec, a schema definition. Move related behaviour together to eliminate the scatter. Apply Composition Over Inheritance and Single Responsibility to reduce the surface area that a single change touches.',
    tint: 'var(--gold)',
    remedies: ['composition-over-inheritance', 'single-responsibility'],
  },
];

export const severityLabel = ['', 'Minor', 'Low', 'Moderate', 'High', 'Critical'] as const;

/** Catalogue reference shown in the register, e.g. AP.001 */
export function antiPatternRef(ap: AntiPattern): string {
  return `AP.${String(antiPatterns.indexOf(ap) + 1).padStart(3, '0')}`;
}

export function antiPatternsRemediedBy(patternId: string): AntiPattern[] {
  return antiPatterns.filter((ap) => ap.remedies.includes(patternId));
}

// Register domain codes for each atlas-data domain. Cross-Domain (XD) entries
// belong to no single domain page.
const DOMAIN_CODE: Record<DomainId, string> = {
  frontend: 'FE',
  backend: 'BE',
  data: 'DP',
  infra: 'INFRA',
};

export function antiPatternsInDomain(domain: DomainId): AntiPattern[] {
  return antiPatterns.filter((ap) => ap.domain === DOMAIN_CODE[domain]);
}
