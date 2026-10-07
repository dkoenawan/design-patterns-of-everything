// schema.org structured data for a case study page: the study as an Article,
// plus the same Atlas › Domain › Study trail the visible breadcrumb shows.

export interface CaseStudyMeta {
  /** Page file name under src/pages/case-studies/ */
  slug: string;
  /** Catalogue reference shown on the page, e.g. BE-01 */
  ref: string;
  title: string;
  subtitle: string;
  description: string;
  /** Domain page path segment, e.g. backend */
  domainSlug: string;
  /** Domain label used in the visible breadcrumb */
  domainName: string;
  /** Patterns the study applies */
  keywords: string[];
}

export function caseStudyJsonLd(site: URL, study: CaseStudyMeta) {
  const atlasURL = new URL('/design-patterns-of-everything/', site).href;
  const domainURL = new URL(`${study.domainSlug}/`, atlasURL).href;
  const pageURL = new URL(`case-studies/${study.slug}/`, atlasURL).href;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${pageURL}#article`,
        headline: study.title,
        alternativeHeadline: study.subtitle,
        description: study.description,
        identifier: study.ref,
        url: pageURL,
        mainEntityOfPage: pageURL,
        articleSection: 'Case Studies',
        keywords: study.keywords.join(', '),
        inLanguage: 'en',
        isPartOf: { '@type': 'WebSite', name: 'Design Patterns of Everything', url: atlasURL },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Atlas', item: atlasURL },
          { '@type': 'ListItem', position: 2, name: study.domainName, item: domainURL },
          { '@type': 'ListItem', position: 3, name: study.title, item: pageURL },
        ],
      },
    ],
  };
}
