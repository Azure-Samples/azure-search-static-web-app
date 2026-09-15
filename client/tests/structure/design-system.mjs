import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const mode = process.argv[2] || 'current';
assert.ok(['current', 'design'].includes(mode), `Unknown structure mode: ${mode}`);

const readJson = relativePath =>
  JSON.parse(fs.readFileSync(path.join(clientRoot, relativePath), 'utf8'));
const packageJson = readJson('package.json');
const policy = readJson('design-system.policy.json');
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

const requiredScripts = [
  'test:api',
  'test:native',
  'test:diagnostic',
  'test:e2e',
  'test:visual',
  'test:structure',
  'test:structure:design',
  'test:all',
  'test:design',
];
for (const script of requiredScripts) {
  check(Boolean(packageJson.scripts?.[script]), `Missing Playwright script: ${script}`);
}
check(
  Boolean(packageJson.devDependencies?.['@playwright/test']),
  'Missing @playwright/test dev dependency',
);
check(
  Boolean(packageJson.devDependencies?.['@axe-core/playwright']),
  'Missing @axe-core/playwright dev dependency',
);
check(fs.existsSync(path.join(clientRoot, 'playwright.config.js')), 'Missing Playwright config');

if (mode === 'design') {
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  for (const dependency of policy.forbiddenDependencies) {
    check(!dependencies[dependency], `Forbidden design-system dependency: ${dependency}`);
  }

  for (const requiredFile of [policy.themeFile, policy.requiredEntryPoint]) {
    check(fs.existsSync(path.join(clientRoot, requiredFile)), `Missing ${requiredFile}`);
  }

  const sourceRoot = path.join(clientRoot, 'src');
  const sourceFiles = walk(sourceRoot);
  const relativeSourceFiles = sourceFiles.map(file =>
    path.relative(clientRoot, file).replaceAll('\\', '/'));
  for (const file of relativeSourceFiles) {
    check(!/\.(jsx?|css)$/.test(file), `Superseded JavaScript/CSS implementation remains: ${file}`);
  }

  const searchableFiles = sourceFiles.filter(file => /\.(tsx?|jsx?|css)$/.test(file));
  for (const absolutePath of searchableFiles) {
    const relativePath = path.relative(clientRoot, absolutePath).replaceAll('\\', '/');
    const source = fs.readFileSync(absolutePath, 'utf8');

    for (const fragment of policy.forbiddenImportFragments) {
      check(!source.includes(fragment), `Forbidden import "${fragment}" in ${relativePath}`);
    }

    for (const className of policy.forbiddenBootstrapClasses) {
      const classPattern = new RegExp(
        `className\\s*=\\s*["'\`][^"'\`]*\\b${className.replace('-', '\\-')}`,
      );
      check(!classPattern.test(source), `Bootstrap class "${className}" remains in ${relativePath}`);
    }

    if (!policy.allowedHardCodedStyleFiles.includes(relativePath)) {
      const hardCodedColor = /#[0-9a-f]{3,8}\b|(?:rgb|hsl)a?\s*\(/i;
      const hardCodedLength = /["'`][^"'`]*\b\d+(?:\.\d+)?(?:px|rem|em)\b[^"'`]*["'`]/i;
      check(!hardCodedColor.test(source), `Hard-coded color remains outside theme in ${relativePath}`);
      check(!hardCodedLength.test(source), `Hard-coded CSS length remains outside theme in ${relativePath}`);
    }
  }

  const entryPoint = fs.readFileSync(path.join(clientRoot, policy.requiredEntryPoint), 'utf8');
  check(entryPoint.includes('ThemeProvider'), 'ThemeProvider is not wired in the design entry point');
  check(entryPoint.includes('CssBaseline'), 'CssBaseline is not wired in the design entry point');
}

if (failures.length > 0) {
  console.error(`Structure validation failed in ${mode} mode:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Structure validation passed in ${mode} mode.`);
