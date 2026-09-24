import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const repoRoot = process.cwd();
const cataloguePath = path.join(repoRoot, 'TestCatalogue.md');
const testsRoot = path.join(repoRoot, 'tests');
const startMarker = '<!-- AUTO-GENERATED TEST INVENTORY START -->';
const endMarker = '<!-- AUTO-GENERATED TEST INVENTORY END -->';

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

function getStringValue(node) {
  if (!node) {
    return '';
  }

  if (ts.isStringLiteralLike(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  if (ts.isIdentifier(node)) {
    return node.text;
  }

  return '';
}

function getTagsFromObjectLiteral(tagArg) {
  if (!tagArg || !ts.isObjectLiteralExpression(tagArg)) {
    return [];
  }

  const tagProperty = tagArg.properties.find((property) => {
    if (!ts.isPropertyAssignment(property)) {
      return false;
    }

    return getStringValue(property.name).trim() === 'tag';
  });

  if (!tagProperty || !ts.isPropertyAssignment(tagProperty)) {
    return [];
  }

  const initializer = tagProperty.initializer;
  const values = [];

  if (ts.isStringLiteralLike(initializer)) {
    values.push(initializer.text);
  } else if (ts.isArrayLiteralExpression(initializer)) {
    initializer.elements.forEach((element) => {
      const value = getStringValue(element);
      if (value) {
        values.push(value);
      }
    });
  }

  return [
    ...new Set(
      values.flatMap((value) =>
        value
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean)
      )
    ),
  ];
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

  const words = plain.split(' ').map((word) => humanizeWord(word));
  const formatted = words.join(' ');

  if (formatted.toLowerCase().startsWith('should ')) {
    return formatted.replace(/^Should\s+/, 'Should ');
  }

  return formatted.replace(/^\s+/, '');
}

function buildTestTitle(describeTitles, title) {
  const fullStack = [...describeTitles, title].filter(Boolean);
  return fullStack.length > 1 ? humanizeTestTitle(fullStack.join(' - ')) : humanizeTestTitle(title);
}

function extractTestEntries(filePath) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const relativeFilePath = path.relative(repoRoot, filePath).replace(/\\/g, '/');
  const entries = [];
  const describeStack = [];

  function visit(node) {
    if (!node) {
      return;
    }

    if (ts.isCallExpression(node)) {
      const expression = node.expression;

      if (
        ts.isPropertyAccessExpression(expression) &&
        expression.expression.getText(sourceFile) === 'test' &&
        expression.name.text === 'describe'
      ) {
        const describeTitle = getStringValue(node.arguments[0]);
        const describeTags = getTagsFromObjectLiteral(node.arguments[1]);

        if (describeTitle) {
          describeStack.push({ title: describeTitle, tags: describeTags });
        }

        const callback = node.arguments.find(
          (argument) => ts.isArrowFunction(argument) || ts.isFunctionExpression(argument)
        );
        if (callback) {
          visit(callback);
        }

        if (describeTitle) {
          describeStack.pop();
        }

        return;
      }

      if (ts.isIdentifier(expression) && expression.text === 'test') {
        const title = getStringValue(node.arguments[0]);
        const callTags = getTagsFromObjectLiteral(node.arguments[1]);

        if (title) {
          const inheritedTags = [...new Set(describeStack.flatMap((describe) => describe.tags))];
          const mergedTags = [...new Set([...inheritedTags, ...callTags])];
          const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));

          entries.push({
            title: buildTestTitle(
              describeStack.map((describe) => describe.title),
              title
            ),
            filePath: relativeFilePath,
            line: start.line + 1,
            tags: mergedTags,
            description: `Automated Playwright scenario: ${title}.`,
          });
        }

        return;
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
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

function mergeGeneratedRowsIntoSections(content, entries) {
  let updatedContent = content
    .replace(/<!-- AUTO-GENERATED TEST INVENTORY START -->[\s\S]*?<!-- AUTO-GENERATED TEST INVENTORY END -->\n?/g, '')
    .trimEnd();

  for (const section of sectionDefinitions) {
    const sectionEntries = entries
      .filter((entry) => section.matches(entry))
      .sort((left, right) => left.title.localeCompare(right.title));

    if (!sectionEntries.length) {
      continue;
    }

    const headingIndex = updatedContent.indexOf(section.heading);
    if (headingIndex === -1) {
      continue;
    }

    const nextHeadingIndex = updatedContent.indexOf('\n## ', headingIndex + section.heading.length);
    const sectionEnd = nextHeadingIndex === -1 ? updatedContent.length : nextHeadingIndex;
    const sectionContent = updatedContent.slice(headingIndex, sectionEnd);
    const lines = sectionContent.split('\n');
    let insertionLine = lines.length;

    for (let index = 0; index < lines.length; index += 1) {
      if (lines[index].startsWith('|')) {
        insertionLine = index + 1;
      }
    }

    const extraRows = sectionEntries.map((entry) => formatInventoryRow(entry));
    const replacement = [...lines.slice(0, insertionLine), ...extraRows, ...lines.slice(insertionLine)].join('\n');

    updatedContent = `${updatedContent.slice(0, headingIndex)}${replacement}${updatedContent.slice(sectionEnd)}`;
  }

  return `${updatedContent.trimEnd()}\n`;
}

const specFiles = collectSpecFiles(testsRoot);
const allEntries = specFiles.flatMap((filePath) => extractTestEntries(path.join(repoRoot, filePath)));

if (!fs.existsSync(cataloguePath)) {
  throw new Error(`Catalogue file not found: ${cataloguePath}`);
}

const existingCatalogue = fs.readFileSync(cataloguePath, 'utf8');
const hasExistingSections = sectionDefinitions.some((section) => existingCatalogue.includes(section.heading));
const updatedCatalogue = hasExistingSections
  ? mergeGeneratedRowsIntoSections(existingCatalogue, allEntries)
  : buildCatalogueFromScratch(allEntries);

fs.writeFileSync(cataloguePath, updatedCatalogue, 'utf8');
console.log(`Updated catalogue with ${allEntries.length} discovered Playwright tests.`);
