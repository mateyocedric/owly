import React from "react";
import { Search } from "lucide-react";
import type { CatalogGroup, CatalogSection } from "./catalog-data.js";
import "./design.css";

export function CatalogPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="catalog min-h-full">
      <div className="mx-auto max-w-[1200px] px-6 py-12 sm:px-8 lg:py-24">
        {children}
      </div>
    </div>
  );
}

export function CatalogEyebrow({ label }: { label: string }) {
  return <p className="sx-eyebrow">{label}</p>;
}

export function CatalogHero({
  title,
  description,
  meta,
  search,
}: {
  title: string;
  description: React.ReactNode;
  meta?: React.ReactNode;
  search: React.ReactNode;
}) {
  return (
    <header className="mb-16 space-y-8 lg:mb-24">
      <div className="max-w-3xl space-y-6">
        <CatalogEyebrow label="@owly/ui · Component Catalog" />
        <h1 className="sx-display-hero">{title}</h1>
        <p className="sx-body max-w-2xl">{description}</p>
        {meta ? <div className="flex flex-wrap items-center gap-3">{meta}</div> : null}
        <div className="pt-2">{search}</div>
      </div>
    </header>
  );
}

export function CatalogSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="sx-search-wrap relative max-w-md">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--sx-on-primary-mute)]"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="sx-search"
      />
    </div>
  );
}

export function CatalogSidebar({
  groups,
}: {
  groups: { group: CatalogGroup; sections: CatalogSection[] }[];
}) {
  return (
    <aside className="hidden lg:block">
      <nav className="sx-nav-panel sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="space-y-8">
          {groups.map(({ group, sections }) => (
            <div key={group} className="space-y-3">
              <CatalogEyebrow label={group} />
              <ul className="space-y-0.5">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="sx-nav-link">
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}

export function CatalogGroupBlock({
  group,
  children,
}: {
  group: CatalogGroup;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-10">
      <h2 className="sx-display-section">{group}</h2>
      <div className="space-y-12">{children}</div>
    </div>
  );
}

export function CatalogEmptyState({ query }: { query: string }) {
  return (
    <div className="sx-demo-panel px-8 py-16 text-center">
      <p className="sx-demo-title mb-3">No matches</p>
      <p className="sx-caption">
        Nothing found for &ldquo;{query}&rdquo;. Try another component or category.
      </p>
    </div>
  );
}

export function CatalogDemoShell({
  section,
  children,
  leading,
}: {
  section: CatalogSection;
  children: React.ReactNode;
  /** Dark-panel content shown above the light shadcn widget surface (e.g. DESIGN.md buttons). */
  leading?: React.ReactNode;
}) {
  return (
    <section id={section.id} className="scroll-mt-28 space-y-5">
      <div className="space-y-2">
        <h3 className="sx-demo-title">{section.title}</h3>
        <p className="sx-caption">{section.components.join(" · ")}</p>
      </div>
      <div className="sx-demo-panel">
        {leading ? (
          <>
            {leading}
            <hr className="sx-divider" />
          </>
        ) : null}
        <div className="sx-demo-widgets">{children}</div>
      </div>
    </section>
  );
}

/** Reference buttons from DESIGN.md — button-ghost-on-dark, button-ghost-on-light, button-filled-cool */
export function CatalogDesignButtons() {
  return (
    <div className="space-y-6">
      <div>
        <p className="sx-label-cap">button-ghost-on-dark</p>
        <button type="button" className="sx-btn-ghost-on-dark">
          Explore missions
        </button>
      </div>
      <hr className="sx-divider" />
      <div className="sx-surface-light">
        <p className="sx-label-cap sx-label-cap-light">button-ghost-on-light · button-filled-cool</p>
        <div className="flex flex-wrap gap-4">
          <button type="button" className="sx-btn-ghost-on-light">
            View vehicles
          </button>
          <button type="button" className="sx-btn-filled-cool">
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

export function CatalogChip({ children }: { children: React.ReactNode }) {
  return <span className="sx-chip">{children}</span>;
}
