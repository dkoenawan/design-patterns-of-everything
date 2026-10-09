// schema.org structured data for a domain overview page: the page as a
// CollectionPage whose ItemList is the pattern register it renders, plus the
// same Atlas › Domain trail the visible breadcrumb shows.

import type { Domain, Pattern } from './atlas-data';

export function domainJsonLd(
  site: URL,
  domain: Domain,
  domainPatterns: Pattern[],
  description: string,
) {
  const atlasURL = new URL('/design-patterns-of-everything/', site).href;
  const pageURL = new URL(`${domain.id}/`, atlasURL).href;
  const listed = domainPatterns.filter((p) => p.href);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageURL}#page`,
        name: domain.english,
        description,
        url: pageURL,
        inLanguage: 'en',
        isPartOf: { '@type': 'WebSite', name: 'Design Patterns of Everything', url: atlasURL },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: listed.length,
          itemListElement: listed.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.name,
            url: new URL(`${p.href!.replace(/^\//, '')}/`, atlasURL).href,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Atlas', item: atlasURL },
          { '@type': 'ListItem', position: 2, name: domain.name, item: pageURL },
        ],
      },
    ],
  };
}
