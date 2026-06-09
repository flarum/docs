const fs = require('fs');
const path = require('path');

/**
 * Local Docusaurus plugin that injects per-page JSON-LD structured data
 * (TechArticle + BreadcrumbList) into every generated documentation page.
 *
 * Docusaurus has no built-in per-page structured data, and `injectHtmlTags`
 * is global rather than per-page. Instead of swizzling a theme component
 * (which is marked "unsafe" and needs maintenance across major upgrades),
 * this runs in the `postBuild` hook and rewrites the already-generated HTML.
 * It reads the title/description/canonical that Docusaurus has already
 * emitted into each page's <head>, so it needs no access to internal APIs
 * and is resilient to future Docusaurus upgrades.
 */
module.exports = function structuredDataPlugin(context) {
  const { siteConfig } = context;
  const siteUrl = siteConfig.url; // e.g. https://docs.flarum.org

  return {
    name: 'flarum-structured-data',

    async postBuild({ routesPaths, outDir, baseUrl }) {
      // In a localized build, outDir already points at e.g. build/es and
      // routesPaths are prefixed with the locale baseUrl ("/es/"). Strip that
      // prefix so paths resolve relative to outDir for every locale.
      const prefix = (baseUrl || '/').replace(/\/$/, '');
      const publisher = {
        '@type': 'Organization',
        name: 'Flarum',
        url: 'https://flarum.org',
        logo: `${siteUrl}/img/flarum-banner.png`,
      };

      const extract = (head, re) => {
        const m = head.match(re);
        return m ? m[1] : null;
      };

      // Build a human label from a URL path segment: "extend" -> "Extend",
      // "frontend-pages" -> "Frontend Pages".
      const labelFor = (segment) =>
        segment
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

      let injected = 0;

      for (const routePath of routesPaths) {
        // Map a route to its built index.html file. Strip the locale baseUrl
        // prefix first (outDir is already the locale's output directory).
        let rel = routePath;
        if (prefix && rel.startsWith(prefix)) rel = rel.slice(prefix.length);
        rel = rel.replace(/^\//, '');
        const file = path.join(outDir, rel, 'index.html');
        if (!fs.existsSync(file)) continue;

        let html = fs.readFileSync(file, 'utf8');

        // Don't double-inject if the plugin somehow runs twice.
        if (html.includes('"@type":"TechArticle"')) continue;

        const headEnd = html.indexOf('</head>');
        if (headEnd === -1) continue;
        const head = html.slice(0, headEnd);

        const canonical = extract(head, /rel="canonical"[^>]*href="([^"]+)"/);
        if (!canonical) continue; // pages without a canonical aren't real doc pages

        let title = extract(head, /property="og:title"[^>]*content="([^"]+)"/);
        // Strip the "| Flarum Documentation" suffix for the headline.
        if (title) title = title.replace(/\s*\|\s*Flarum Documentation\s*$/, '');
        const description = extract(head, /name="description"[^>]*content="([^"]*)"/);

        const article = {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: title || undefined,
          description: description || undefined,
          url: canonical,
          mainEntityOfPage: canonical,
          inLanguage: extract(html, /<html[^>]*lang="([^"]+)"/) || 'en',
          publisher,
          isPartOf: {
            '@type': 'WebSite',
            name: 'Flarum Documentation',
            url: siteUrl,
          },
        };

        // BreadcrumbList from the canonical URL path segments. We keep every
        // segment in the link URLs (so they resolve), but hide locale codes
        // (e.g. "es") and the version segment (e.g. "2.x") from the visible
        // crumb names, since they aren't meaningful navigation steps.
        const HIDDEN = new Set(['es', 'it', 'tr', 'zh', 'vi', 'de', '2.x', 'next']);
        const urlPath = canonical.slice(siteUrl.length).replace(/^\/|\/$/g, '');
        const allSegments = urlPath ? urlPath.split('/') : [];
        const itemListElement = [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Docs',
            item: `${siteUrl}/`,
          },
        ];
        let position = 2;
        allSegments.forEach((seg, i) => {
          if (HIDDEN.has(seg)) return; // skip locale/version crumbs
          const acc = allSegments.slice(0, i + 1).join('/');
          const isLast = i === allSegments.length - 1;
          itemListElement.push({
            '@type': 'ListItem',
            position: position++,
            name: isLast && title ? title : labelFor(seg),
            item: `${siteUrl}/${acc}`,
          });
        });
        const breadcrumb = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement,
        };

        const tag =
          `<script type="application/ld+json">${JSON.stringify(article)}</script>` +
          `<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`;

        html = html.slice(0, headEnd) + tag + html.slice(headEnd);
        fs.writeFileSync(file, html);
        injected++;
      }

      console.log(`[flarum-structured-data] injected JSON-LD into ${injected} pages`);
    },
  };
};
