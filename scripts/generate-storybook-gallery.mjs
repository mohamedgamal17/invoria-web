#!/usr/bin/env node
/**
 * Generates the Storybook component gallery MDX pages from the colocated
 * *.component.stories.ts files.
 *
 * - .storybook/gallery/overview.mdx   : one card per presentational component
 *   across every module (global Storybook sidebar: Gallery › Overview).
 * - .storybook/gallery/overlays.mdx   : dialog/modal components (appendTo="body")
 *   shown one per iframe so open modals don't cover the gallery.
 * - .storybook/modules/<module>/gallery/overview.mdx : module-scoped gallery for
 *   each per-module Storybook instance (Gallery › Overview).
 * - .storybook/modules/<module>/gallery/overlays.mdx : module-scoped overlays
 *   (only written when that module has overlay stories).
 *
 * Run: node scripts/generate-storybook-gallery.mjs
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, basename, dirname, relative } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const MODULES = resolve(ROOT, 'modules');
const GALLERY = resolve(ROOT, '.storybook', 'gallery');

const OVERLAY_BASES = new Set([
  'confirm-dialog',
  'settle-modal',
  'order-return-items-dialog',
  'record-payment-dialog',
]);

const MODULE_ORDER = [
  'ui',
  'catalog',
  'customers',
  'financial',
  'inventory',
  'procurement',
  'sales',
];

function pascalWords(kebab) {
  return kebab.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function aliasOf(kebab) {
  return kebab.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

function findStoryFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      findStoryFiles(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.component.stories.ts')) {
      out.push(full);
    }
  }
  return out;
}

function firstExport(file) {
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^export const (\w+)/m);
  return m ? m[1] : null;
}

function componentBase(file) {
  return basename(file, '.component.stories.ts');
}

function importPath(file, fromDir) {
  const rel = relative(fromDir, file).replace(/\.ts$/, '');
  return `'${rel.split('\\').join('/')}'`;
}

const storyFiles = findStoryFiles(MODULES);
const byModule = {};
for (const file of storyFiles) {
  const rel = relative(MODULES, file);
  const module = rel.split(/[\\/]/)[0];
  const base = componentBase(file);
  const story = firstExport(file);
  if (!story) continue;
  (byModule[module] || (byModule[module] = [])).push({ file, base, story, module });
}

for (const module of Object.keys(byModule)) {
  byModule[module].sort((a, b) => a.base.localeCompare(b.base));
}

function introText(moduleFilter) {
  const moduleLabel = moduleFilter ? pascalWords(moduleFilter) : null;
  if (moduleLabel) {
    return `# Component Gallery — ${moduleLabel}\n\nIsolated view of every presentational component in the \`${moduleLabel}\` module. Each card shows the component's primary story.`;
  }
  return `# Component Gallery\n\nA visual index of every presentational component in Invoria Web. Each card shows the component's primary story, so reviewers can scan all components at a glance.\n\nUse the Storybook sidebar to open any component's docs page (e.g. \`UI/KpiCard › Docs\`) and see every variant (Loading, Empty, etc.).`;
}

function buildOverview(moduleFilter, fromDir) {
  const sections = [];
  let total = 0;
  const modules = moduleFilter ? [moduleFilter] : MODULE_ORDER;

  for (const module of modules) {
    const items = (byModule[module] || []).filter((i) => !OVERLAY_BASES.has(i.base));
    if (!items.length) continue;
    total += items.length;
    const cards = items.map(({ base, story }) => {
      const Alias = aliasOf(base);
      return `  <div className="sb-gallery-card">
    <div className="sb-gallery-title">${pascalWords(base)}</div>
    <Story of={${Alias}.${story}} meta={${Alias}} />
  </div>`;
    }).join('\n');
    sections.push(`## ${pascalWords(module)}\n\n<div className="sb-gallery-grid">\n${cards}\n</div>\n`);
  }

  const imports = [];
  const seen = new Set();
  const modulesToScan = moduleFilter ? [moduleFilter] : MODULE_ORDER;
  for (const module of modulesToScan) {
    for (const { base, file } of byModule[module] || []) {
      if (OVERLAY_BASES.has(base)) continue;
      const Alias = aliasOf(base);
      if (seen.has(Alias)) continue;
      seen.add(Alias);
      imports.push(`import * as ${Alias} from ${importPath(file, fromDir)};`);
    }
  }

  return `import { Meta, Story } from '@storybook/addon-docs/blocks';
${imports.join('\n')}

<Meta title="Gallery/Overview" />

${introText(moduleFilter)}

${sections.join('\n')}

<p className="sb-hint">Total components rendered: ${total}.</p>
`;
}

function buildOverlays(moduleFilter, fromDir) {
  const imports = [];
  const rows = [];
  const modulesToScan = moduleFilter ? [moduleFilter] : Object.keys(byModule);

  for (const module of modulesToScan) {
    for (const base of OVERLAY_BASES) {
      const item = (byModule[module] || []).find((i) => i.base === base);
      if (!item) continue;
      const Alias = aliasOf(base);
      imports.push(`import * as ${Alias} from ${importPath(item.file, fromDir)};`);
      const story = item.story;
      rows.push(`<div className="sb-overlay-row">
  <div className="sb-overlay-title">${pascalWords(base)}</div>
  <Story of={${Alias}.${story}} meta={${Alias}} inline={false} height="320px" />
</div>`);
    }
  }

  if (!rows.length) return null;

  const moduleLabel = moduleFilter ? ` — ${pascalWords(moduleFilter)}` : '';
  return `import { Meta, Story } from '@storybook/addon-docs/blocks';
${imports.join('\n')}

<Meta title="Gallery/Overlays" />

# Gallery / Overlays${moduleLabel}

Dialog and modal components render with \`appendTo="body"\`, so an open modal would cover
the whole page. Each overlay story below is rendered in its own iframe
(\`inline={false}\`) to keep the modal contained.

${rows.join('\n\n')}
`;
}

function writeModuleGalleries() {
  for (const module of Object.keys(byModule)) {
    const galleryBase = resolve(ROOT, '.storybook', 'modules', module, 'gallery');
    mkdirSync(galleryBase, { recursive: true });

    const overview = buildOverview(module, galleryBase);
    writeFileSync(join(galleryBase, 'overview.mdx'), overview, 'utf8');

    const overlays = buildOverlays(module, galleryBase);
    if (overlays) {
      writeFileSync(join(galleryBase, 'overlays.mdx'), overlays, 'utf8');
    }
  }
}

// Global gallery (all modules) — written first so the global Storybook instance stays in sync.
writeFileSync(join(GALLERY, 'overview.mdx'), buildOverview(null, GALLERY), 'utf8');
writeFileSync(join(GALLERY, 'overlays.mdx'), buildOverlays(null, GALLERY), 'utf8');

// Per-module galleries for focused Storybook instances.
writeModuleGalleries();

console.log(`Generated gallery pages:`);
console.log(`  .storybook/gallery/overview.mdx`);
console.log(`  .storybook/gallery/overlays.mdx`);
for (const module of Object.keys(byModule).sort()) {
  console.log(`  .storybook/modules/${module}/gallery/overview.mdx`);
  if (byModule[module].some((i) => OVERLAY_BASES.has(i.base))) {
    console.log(`  .storybook/modules/${module}/gallery/overlays.mdx`);
  }
}
