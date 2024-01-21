import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from 'vitest';

import { Config, stripDebug } from './transformer';

const __dirname = dirname(fileURLToPath(import.meta.url));

function transformFile(path: string, config?: Config): string {
  const contents = readFileSync(
    resolve(__dirname, 'fixtures', path)
  ).toString();

  return stripDebug(contents, config);
}

test('should strip console statements', () => {
  const result = transformFile('base.ts');

  expect(/console\.log/.test(result)).toBeFalsy();
});

test('should strip console statements written with computed properties', () => {
  const result = transformFile('computed-property.ts');

  expect(/console\.log/.test(result)).toBeFalsy();
});

test('should strip debugger statements', () => {
  const result = transformFile('debugger.ts');

  expect(/debugger/.test(result)).toBeFalsy();
});

test('should exclude console.table and debuggers', () => {
  const result = transformFile('exclusion.ts', {
    exclude: ['table'],
    debugger: false,
  });

  expect(/debugger/.test(result)).toBeTruthy();
  expect(/console\.log/.test(result)).toBeFalsy();
  expect(/console\.table/.test(result)).toBeTruthy();
});

test('should strip inline console statements', () => {
  const result = transformFile('inline.ts');

  expect(/console\.log/.test(result)).toBeFalsy();
});

test.skip('should change nothing', () => {
  const original = readFileSync(
    resolve(__dirname, 'fixtures', 'no-change.ts')
  ).toString();
  const result = transformFile('no-change.ts');

  expect(result).toBe(original);
});

test('should strip console statements written in ternary', () => {
  const result = transformFile('ternary.ts');

  expect(/console\.log/.test(result)).toBeFalsy();
});
