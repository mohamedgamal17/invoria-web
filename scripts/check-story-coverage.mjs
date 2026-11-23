#!/usr/bin/env node
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const ROOT_DIR = resolve(import.meta.dirname, '..');
const MODULES_DIR = resolve(ROOT_DIR, 'modules');

/**
 * Parse module argument from process.argv if provided (e.g. --module=sales or --module sales).
 */
function parseModuleArgument() {
  const argumentIndex = process.argv.findIndex(
    (argument) => argument.startsWith('--module=') || argument === '--module',
  );
  if (argumentIndex === -1) {
    return null;
  }
  const currentArgument = process.argv[argumentIndex];
  if (currentArgument.startsWith('--module=')) {
    return currentArgument.slice('--module='.length).trim();
  }
  return process.argv[argumentIndex + 1] ?? null;
}

/**
 * Directories or files to ignore when scanning for presentational components.
 * Smart pages (pages/) and layout shells (layout/) are excluded by architecture design.
 */
const EXCLUDED_DIR_PATTERNS = [
  /node_modules/,
  /dist/,
  [/\bpages\b/, 'pages'],
  [/\blayout\b/, 'layout'],
];

/**
 * Scan directory recursively for *.component.ts files.
 */
function findComponentFiles(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name === 'pages' ||
        entry.name === 'layout' ||
        entry.name === 'node_modules' ||
        entry.name === 'dist'
      ) {
        continue;
      }
      results.push(...findComponentFiles(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.component.ts') &&
      !entry.name.endsWith('.spec.ts') &&
      !entry.name.endsWith('.stories.ts')
    ) {
      results.push(fullPath);
    }
  }

  return results;
}

function main() {
  const targetModule = parseModuleArgument();
  const scanDirectory = targetModule ? resolve(MODULES_DIR, targetModule) : MODULES_DIR;
  const displayLabel = targetModule ? `modules/${targetModule}` : 'modules/';

  console.log(`🔍 Checking story coverage for presentational components in ${displayLabel}...\n`);

  if (!existsSync(scanDirectory)) {
    console.error(`Error: Directory not found at ${scanDirectory}`);
    process.exit(1);
  }

  const componentFiles = findComponentFiles(scanDirectory);
  const missingStories = [];

  for (const componentFile of componentFiles) {
    const storyFile = componentFile.replace(/\.component\.ts$/, '.component.stories.ts');
    if (!existsSync(storyFile)) {
      missingStories.push(componentFile);
    }
  }

  const total = componentFiles.length;
  const covered = total - missingStories.length;
  const percentage = total > 0 ? ((covered / total) * 100).toFixed(1) : 100;

  console.log(`Components scanned: ${total}`);
  console.log(`Stories found:      ${covered}`);
  console.log(`Coverage:           ${percentage}%\n`);

  if (missingStories.length > 0) {
    console.error(`❌ Missing stories for ${missingStories.length} component(s):`);
    for (const missing of missingStories) {
      console.error(`  - ${missing}`);
    }
    console.error('\nPlease create colocated *.component.stories.ts files for these components.');
    process.exit(1);
  }

  console.log('✅ All presentational components have colocated stories!');
  process.exit(0);
}

main();
