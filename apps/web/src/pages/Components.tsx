import React, { useMemo, useState } from "react";
import { CATALOG_GROUPS, CATALOG_SECTIONS } from "./components/catalog-data.js";
import { CatalogDemo } from "./components/catalog-demos.js";
import { Seo } from "../components/Seo.js";
import {
  CatalogChip,
  CatalogEmptyState,
  CatalogGroupBlock,
  CatalogHero,
  CatalogPage,
  CatalogSearchInput,
  CatalogSidebar,
} from "./components/catalog-ui.js";

export function ComponentsPage() {
  const [query, setQuery] = useState("");

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATALOG_SECTIONS;
    return CATALOG_SECTIONS.filter(
      (section) =>
        section.title.toLowerCase().includes(q) ||
        section.group.toLowerCase().includes(q) ||
        section.components.some((name) => name.toLowerCase().includes(q))
    );
  }, [query]);

  const groupedSections = useMemo(() => {
    return CATALOG_GROUPS.map((group) => ({
      group,
      sections: filteredSections.filter((section) => section.group === group),
    })).filter((entry) => entry.sections.length > 0);
  }, [filteredSections]);

  const totalComponents = useMemo(
    () => new Set(CATALOG_SECTIONS.flatMap((section) => section.components)).size,
    []
  );

  return (
    <CatalogPage>
      <Seo title="Component Catalog — Owly" path="/components" noindex />
      <CatalogHero
        title="Component Catalog"
        description={
          <>
            Live previews of shadcn/ui primitives in the shared{" "}
            <code className="text-[var(--sx-on-primary)]">@owly/ui</code> package.
            Styled per{" "}
            <code className="text-[var(--sx-on-primary)]">DESIGN.md</code> — austere black canvas,
            uppercase display type, ghost pill CTAs.
          </>
        }
        meta={<CatalogChip>{totalComponents}+ components</CatalogChip>}
        search={
          <CatalogSearchInput
            value={query}
            onChange={setQuery}
            placeholder="Filter by component or category..."
          />
        }
      />

      <div className="grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
        <CatalogSidebar groups={groupedSections} />

        <div className="space-y-16">
          {groupedSections.length === 0 ? (
            <CatalogEmptyState query={query} />
          ) : (
            groupedSections.map(({ group, sections }) => (
              <CatalogGroupBlock key={group} group={group}>
                {sections.map((section) => (
                  <CatalogDemo key={section.id} section={section} />
                ))}
              </CatalogGroupBlock>
            ))
          )}
        </div>
      </div>
    </CatalogPage>
  );
}
