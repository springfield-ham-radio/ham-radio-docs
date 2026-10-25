#!/usr/bin/env node
/**
 * Fill the generated regions of docs/developer/config-reference.md from the
 * vendored ham-radio-utils JSON schemas, and fail if the page drifts.
 *
 *   node scripts/render-config-reference.mjs --write
 *   node scripts/render-config-reference.mjs --check
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pagePath = join(root, 'docs/developer/config-reference.md');
const vendorDir = join(root, 'scripts/vendor');
const source = JSON.parse(readFileSync(join(vendorDir, 'SOURCE.json'), 'utf8'));
const protocol = JSON.parse(readFileSync(join(vendorDir, 'radio-protocol-schema.json'), 'utf8'));
const memoryMap = JSON.parse(readFileSync(join(vendorDir, 'radio-memory-map-schema.json'), 'utf8'));

const mode = process.argv[2];

if (mode !== '--write' && mode !== '--check') {
  console.error('Usage: node scripts/render-config-reference.mjs --write|--check');
  process.exit(1);
}

function code(value) {
  return `\`${String(value).replace(/`/g, '\\`')}\``;
}

function cell(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function refName(ref) {
  const marker = '#/definitions/';

  if (typeof ref === 'string' && ref.startsWith(marker)) {
    return ref.slice(marker.length);
  }

  return ref || 'value';
}

function typeOf(schema) {
  if (!schema || typeof schema !== 'object') {
    return 'value';
  }

  if (schema.$ref) {
    return refName(schema.$ref);
  }

  if (schema.const !== undefined) {
    return `const ${code(schema.const)}`;
  }

  if (Array.isArray(schema.enum)) {
    const values = schema.enum.map((entry) => code(entry)).join(', ');
    const suffix = schema.default !== undefined ? `, default ${code(schema.default)}` : '';
    return `enum ${values}${suffix}`;
  }

  if (Array.isArray(schema.oneOf)) {
    return 'one of the shapes below';
  }

  if (Array.isArray(schema.anyOf)) {
    return 'any of the shapes below';
  }

  let name = Array.isArray(schema.type) ? schema.type.join(' or ') : schema.type || 'value';
  const notes = [];

  if (schema.minimum !== undefined && schema.maximum !== undefined) {
    notes.push(`${schema.minimum}–${schema.maximum}`);
  } else if (schema.minimum !== undefined) {
    notes.push(`min ${schema.minimum}`);
  } else if (schema.maximum !== undefined) {
    notes.push(`max ${schema.maximum}`);
  }

  if (schema.minLength !== undefined) {
    notes.push(`min length ${schema.minLength}`);
  }

  if (schema.minItems !== undefined) {
    notes.push(`min items ${schema.minItems}`);
  }

  if (schema.uniqueItems) {
    notes.push('unique');
  }

  if (schema.pattern) {
    notes.push(`pattern ${code(schema.pattern)}`);
  }

  if (schema.default !== undefined && !Array.isArray(schema.enum)) {
    notes.push(`default ${code(schema.default)}`);
  }

  if (schema.additionalProperties === false) {
    notes.push('no extra fields');
  }

  if (schema.type === 'array' && schema.items) {
    name = `array of ${typeOf(schema.items)}`;
  }

  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    name = `map of ${typeOf(schema.additionalProperties)}`;
  }

  return notes.length > 0 ? `${name}, ${notes.join(', ')}` : name;
}

function hasBody(schema) {
  if (!schema || typeof schema !== 'object') {
    return false;
  }

  return Boolean(
    schema.properties ||
      schema.oneOf ||
      schema.anyOf ||
      (schema.additionalProperties && typeof schema.additionalProperties === 'object' && schema.additionalProperties.properties) ||
      schema.items?.properties ||
      schema.items?.oneOf ||
      schema.items?.anyOf,
  );
}

function table(schema) {
  const properties = schema.properties;

  if (!properties) {
    return '';
  }

  const required = new Set(schema.required || []);
  const lines = ['| Field | Required | Type | Description |', '| --- | --- | --- | --- |'];

  for (const [name, property] of Object.entries(properties)) {
    lines.push(
      `| ${cell(code(name))} | ${required.has(name) ? 'yes' : ''} | ${cell(typeOf(property))} | ${cell(property.description || '')} |`,
    );
  }

  return `${lines.join('\n')}\n`;
}

function renderNode(schema, heading, level) {
  if (!schema || typeof schema !== 'object') {
    return '';
  }

  const hashes = '#'.repeat(Math.min(level, 6));
  let markdown = `\n${hashes} ${heading}\n\n`;

  if (schema.description) {
    markdown += `${schema.description}\n\n`;
  }

  if (schema.$ref && !schema.properties) {
    markdown += `See ${code(refName(schema.$ref))}.\n\n`;
    return markdown;
  }

  if (Array.isArray(schema.required) && schema.required.length > 0 && schema.properties) {
    markdown += `Required: ${schema.required.map((name) => code(name)).join(', ')}.\n\n`;
  }

  if (Array.isArray(schema.anyOf) && schema.anyOf.every((entry) => Array.isArray(entry.required))) {
    const choices = schema.anyOf.map((entry) => entry.required.map((name) => code(name)).join(' + '));
    markdown += `At least one of ${choices.join(', or ')}.\n\n`;
  }

  if (schema.additionalProperties === false) {
    markdown += 'Extra fields are rejected.\n\n';
  }

  markdown += table(schema);

  if (!schema.properties && !schema.oneOf && !schema.anyOf) {
    markdown += `${typeOf(schema)}.\n\n`;
  }

  if (schema.properties) {
    for (const [name, property] of Object.entries(schema.properties)) {
      markdown += renderProperty(name, property, level + 1);
    }
  }

  if (Array.isArray(schema.oneOf) && schema.oneOf.every((alternative) => alternative.$ref)) {
    markdown += `Exactly one of: ${schema.oneOf.map((alternative) => code(refName(alternative.$ref))).join(', ')}.\n\n`;
  } else if (Array.isArray(schema.oneOf)) {
    markdown += 'Exactly one of these shapes:\n\n';
    schema.oneOf.forEach((alternative, index) => {
      markdown += renderNode(alternative, alternativeLabel(alternative, index), level + 1);
    });
  } else if (Array.isArray(schema.anyOf) && !schema.properties) {
    schema.anyOf.forEach((alternative, index) => {
      markdown += renderNode(alternative, alternativeLabel(alternative, index), level + 1);
    });
  }

  if (schema.additionalProperties && typeof schema.additionalProperties === 'object' && schema.additionalProperties.properties) {
    markdown += renderNode(schema.additionalProperties, `${heading} entry`, level + 1);
  }

  return markdown;
}

function alternativeLabel(schema, index) {
  if (schema.$ref) {
    return refName(schema.$ref);
  }

  if (schema.properties?.kind?.const) {
    return String(schema.properties.kind.const);
  }

  if (Array.isArray(schema.required) && schema.required.length > 0) {
    return schema.required.join(' + ');
  }

  if (schema.type) {
    return String(schema.type);
  }

  return `shape ${index + 1}`;
}

function renderProperty(name, property, level) {
  if (property.$ref) {
    return '';
  }

  if (property.type === 'array' && property.items && hasBody(property.items)) {
    return renderNode(property.items, name, level);
  }

  if (hasBody(property)) {
    return renderNode(property, name, level);
  }

  return '';
}

function renderDefinitions(schema) {
  const definitions = schema.definitions;

  if (!definitions) {
    return '';
  }

  let markdown = '\n### Definitions\n';

  for (const [name, definition] of Object.entries(definitions)) {
    markdown += renderNode(definition, name, 4);
  }

  return markdown;
}

function renderSchema(schema, fileName) {
  const required = (schema.required || []).map((name) => code(name)).join(', ');
  let markdown = '';
  markdown += `Generated from \`${fileName}\` in [\`${source.repository}\`](https://github.com/${source.repository}) at \`${source.commit}\`.\n\n`;
  markdown += `${schema.title}. ${schema.description}\n\n`;

  if (required) {
    markdown += `Required: ${required}.\n\n`;
  }

  markdown += table(schema);

  if (schema.properties) {
    for (const [name, property] of Object.entries(schema.properties)) {
      markdown += renderProperty(name, property, 3);
    }
  }

  markdown += renderDefinitions(schema);
  return markdown.trimEnd();
}

function replaceRegion(page, name, body) {
  const start = `<!-- generated:${name} -->`;
  const end = `<!-- /generated:${name} -->`;
  const startIndex = page.indexOf(start);
  const endIndex = page.indexOf(end);

  if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) {
    throw new Error(`Missing generated region ${name}`);
  }

  return `${page.slice(0, startIndex + start.length)}\n\n${body}\n\n${page.slice(endIndex)}`;
}

let page = readFileSync(pagePath, 'utf8');
page = replaceRegion(page, 'protocol', renderSchema(protocol, 'src/schemas/radio-protocol-schema.json'));
page = replaceRegion(page, 'memory-map', renderSchema(memoryMap, 'src/schemas/radio-memory-map-schema.json'));

const requiredMentions = [
  'minApiVersion',
  'capabilities',
  'bands',
  'codec',
  'memoryMap',
  'metadata',
  'cat',
  'readMessage',
  'writeMessage',
  '$schema',
  'liveControl',
  '18.0.1',
  'isApiVersionCompatible',
  'APP_HAM_RADIO_API_VERSION',
];

const missing = requiredMentions.filter((token) => !page.includes(token));

if (missing.length > 0) {
  console.error(`config-reference.md is missing: ${missing.join(', ')}`);
  process.exit(1);
}

if (!page.includes('"minApiVersion": "18.0.1"')) {
  console.error('Sample config must include "minApiVersion": "18.0.1"');
  process.exit(1);
}

if (mode === '--check') {
  const current = readFileSync(pagePath, 'utf8');

  if (current !== page) {
    console.error('config-reference.md is stale. Run: node scripts/render-config-reference.mjs --write');
    process.exit(1);
  }

  console.log('config reference matches vendored schemas');
} else {
  writeFileSync(pagePath, page);
  console.log('wrote docs/developer/config-reference.md');
}
