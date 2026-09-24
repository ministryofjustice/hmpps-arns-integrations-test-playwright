import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const cataloguePath = path.join(repoRoot, 'TestCatalogue.md');
const testsRoot = path.join(repoRoot, 'tests');

function collectSpecFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolutePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectSpecFiles(absolutePath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.spec.ts')) {
      files.push(path.relative(repoRoot, absolutePath).replace(/\\/g, '/'));
    }
  }

  return files.sort();
}

function extractTags(input) {
  if (!input) {
    return [];
  }

  const matches = [...input.matchAll(/tag\s*:\s*(\[[^\]]*\]|"[^"]*"|'[^']*')/g)];
  const tags = [];

  for (const match of matches) {
    const value = match[1];
    const trimmed = value.replace(/^\[|\]$/g, '').replace(/^['"]|['"]$/g, '');
    const parts = trimmed
      .split(',')
      .map((part) => part.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);

    for (const part of parts) {
      if (part.startsWith('@')) {
        tags.push(part);
      }
    }
  }

  return [...new Set(tags)];
}

function getEnvironmentLabel(tags) {
  if (!tags.length) {
    return 'Unspecified';
  }

  const labels = [];
  if (tags.includes('@dev')) labels.push('Dev');
  if (tags.includes('@test')) labels.push('Test');
  if (tags.includes('@local')) labels.push('Local');
  if (tags.includes('@security')) labels.push('Security');

  return labels.length ? labels.join(', ') : tags.join(', ');
}

function humanizeWord(word) {
  const normalized = word
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();

  const replacements = {
    aap: 'AAP',
    api: 'API',
    modsec: 'ModSec',
    san: 'SAN',
    ui: 'UI',
    oasys: 'OAsys',
    mpop: 'MPoP',
    po: 'Po',
    pop: 'PoP',
    url: 'URL',
  };

  const lower = normalized.toLowerCase();
  if (replacements[lower]) {
    return replacements[lower];
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function humanizeTestTitle(title) {
  const plain = title
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = plain
    .split(' ')
    .filter(Boolean)
    .map((word) => humanizeWord(word));
  return words.join(' ');
}

function buildTestTitle(describeTitles, title) {
  const fullStack = [...describeTitles, title].filter(Boolean);
  return fullStack.length > 1 ? humanizeTestTitle(fullStack.join(' - ')) : humanizeTestTitle(title);
}

function findMatchingBracket(text, openIndex, openChar, closeChar) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = openIndex; index < text.length; index += 1) {
    const char = text[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === openChar) {
      depth += 1;
    } else if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return text.length - 1;
}

function extractTestEntries(filePath) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const relativeFilePath = path.relative(repoRoot, filePath).replace(/\\/g, '/');
  const entries = [];
  const describeEntries = [];

  const describePattern = /test\.describe\s*\(\s*(["'`])((?:\\.|(?!\1).)*)\1/g;
  for (const match of sourceText.matchAll(describePattern)) {
    const description = match[2].replace(/\\(['"`])/g, '$1');
    const openParenIndex = match.index + match[0].lastIndexOf('(');
    if (openParenIndex === -1) {
      continue;
    }

    const closeParenIndex = findMatchingBracket(sourceText, openParenIndex, '(', ')');
    if (closeParenIndex === -1) {
      continue;
    }

    const describeText = sourceText.slice(match.index, closeParenIndex + 1);
    describeEntries.push({
      title: description,
      tags: extractTags(describeText),
      start: match.index,
      end: closeParenIndex,
    });
  }

  const testPattern = /\btest\s*\(/g;
  for (const match of sourceText.matchAll(testPattern)) {
    const openParenIndex = match.index + match[0].lastIndexOf('(');
    const closeParenIndex = findMatchingBracket(sourceText, openParenIndex, '(', ')');
    const callText = sourceText.slice(match.index, closeParenIndex + 1);
    const titleMatch = callText.match(/\btest\s*\(\s*(["'`])((?:\\.|(?!\1).)*)\1/);

    if (!titleMatch) {
      continue;
    }

    const title = titleMatch[2].replace(/\\(['"`])/g, '$1');
    const inheritedDescribe = [...describeEntries]
      .filter((describe) => describe.start < match.index && match.index < describe.end)
      .at(-1);
    const mergedTags = [...new Set([...(inheritedDescribe?.tags ?? []), ...extractTags(callText)])];
    const line = sourceText.slice(0, match.index).split(/\r?\n/).length;

    entries.push({
      title: buildTestTitle(inheritedDescribe ? [inheritedDescribe.title] : [], title),
      filePath: relativeFilePath,
      line,
      tags: mergedTags,
      description: `Automated Playwright scenario: ${title}.`,
    });
  }

  return entries;
}

function formatInventoryRow(entry) {
  const environmentLabel = getEnvironmentLabel(entry.tags);
  const link = `[${entry.title}](${entry.filePath}#L${entry.line})`;

  return `| ${link} | \`${entry.filePath}\` | ${environmentLabel} | ${entry.description} |`;
}

const sectionDefinitions = [
  {
    heading: '## ARNS Assessment Platform - Dev UI',
    matches: (entry) => /\/dev\/.*\/ui\//.test(entry.filePath),
  },
  {
    heading: '## ARNS Assessment Platform - Dev API and Auth',
    matches: (entry) => /\/dev\/(?:aap\/api|aap\/auth|san\/api|arns)\//.test(entry.filePath),
  },
  {
    heading: '## ARNS Assessment Platform - Test UI',
    matches: (entry) => /\/test\/.*\/ui\//.test(entry.filePath),
  },
  {
    heading: '## ARNS Assessment Platform - Test API',
    matches: (entry) => /\/test\/.*\/api\//.test(entry.filePath),
  },
  {
    heading: '## Legacy / archived tests',
    matches: (entry) => /\/oastub-archive\//.test(entry.filePath),
  },
];

function buildCatalogueFromScratch(entries) {
  const sections = sectionDefinitions.map((section) => {
    const sectionEntries = entries
      .filter((entry) => section.matches(entry))
      .sort((left, right) => left.title.localeCompare(right.title));

    return [
      section.heading,
      '',
      '| Test | Location | Environment | Description |',
      '| --- | --- | --- | --- |',
      ...sectionEntries.map((entry) => formatInventoryRow(entry)),
      '',
    ].join('\n');
  });

  return [
    '# Test Catalogue',
    '',
    'This is a catalogue for the Tests in this repository. It lists the name, where they live, how they are configured to run, and a short description.',
    '',
    '---',
    '',
    ...sections,
    '---',
    '',
    '## Notes',
    '',
  ].join('\n');
}

const specFiles = collectSpecFiles(testsRoot);
const allEntries = [];
const seenEntries = new Set();

for (const filePath of specFiles) {
  const fileEntries = extractTestEntries(path.join(repoRoot, filePath));

  for (const entry of fileEntries) {
    const entryKey = `${entry.filePath}#L${entry.line}:${entry.title}`;
    if (!seenEntries.has(entryKey)) {
      seenEntries.add(entryKey);
      allEntries.push(entry);
    }
  }
}

const generatedCatalogue = buildCatalogueFromScratch(allEntries);
fs.writeFileSync(cataloguePath, generatedCatalogue, 'utf8');
console.log(`Updated catalogue with ${allEntries.length} discovered Playwright tests.`);
