import { join } from "node:path";
import { PUBLIC_PAGES, SITE_ORIGIN, type PublicPageSeo } from "../src/lib/seo.js";

function attr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

function applyPage(html: string, page: PublicPageSeo): string {
  const url = `${SITE_ORIGIN}${page.path}`;
  const title = attr(page.title);
  const description = attr(page.description);
  const webPageLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    url,
    description: page.description,
    isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
  });

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /(<meta name="description" content=")[^"]*("\s*\/?>)/,
      `$1${description}$2`
    )
    .replace(/(<link rel="canonical" href=")[^"]*("\s*\/?>)/, `$1${url}$2`)
    .replace(
      /(<meta property="og:title" content=")[^"]*("\s*\/?>)/,
      `$1${title}$2`
    )
    .replace(
      /(<meta property="og:description" content=")[^"]*("\s*\/?>)/,
      `$1${description}$2`
    )
    .replace(/(<meta property="og:url" content=")[^"]*("\s*\/?>)/, `$1${url}$2`)
    .replace(
      /(<meta name="twitter:title" content=")[^"]*("\s*\/?>)/,
      `$1${title}$2`
    )
    .replace(
      /(<meta name="twitter:description" content=")[^"]*("\s*\/?>)/,
      `$1${description}$2`
    )
    .replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
      `<script type="application/ld+json">${webPageLd}</script>`
    )
    .replace(
      /<noscript>[\s\S]*?<\/noscript>/,
      `<noscript>${page.noscript}</noscript>`
    );
}

const distDir = join(import.meta.dir, "../dist");
const template = await Bun.file(join(distDir, "index.html")).text();

for (const page of PUBLIC_PAGES) {
  await Bun.write(join(distDir, page.file), applyPage(template, page));
}

console.log(`Prerendered ${PUBLIC_PAGES.length} public HTML snapshots`);
