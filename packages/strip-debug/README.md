# @namchee/henshin-strip-debug

A TypeScript transfomer that replaces debugging statements such as [`debugger`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) and [`console`](https://developer.mozilla.org/en-US/docs/Web/API/console) methods with [void expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void). Supports plain JavaScript and syntax extensions like JSX and TSX.

## Example

Given the following code:

```ts
console.log('Hello World!');

function add(a: number, b: number): number {
    debugger;
    return a + b;
}

console['table']({ foo: 'bar' });
```

This transformer will transform your code to the following code:

```ts
void 0;

function add(a: number, b: number): number {
    void 0; // debugger statements are replaced
    return a + b;
}

void 0; // support computed accessor too!
```

## Installation

```bash
# Using npm
npm install -D @namchee/henshin-strip-debug

# Using yarn
yarn add -D @namchee/henshin-strip-debug

# Using pnpm
pnpm install -D @namchee/henshin-strip-debug

# Using bun
bun install -D @namchee/henshin-strip-debug
```

## API

### `createStripDebugTransformer(config: Config = defaultConfig)`

A factory function that creates a TypeScript transformer instance that strips debugger statements. Designed to be consumed by transpilers and compilers alike.

```ts
import ts from 'typescript';

import { createStripDebugTransformer } from '@namchee/henshin-strip-debug';

const sourceFile = `const add = (a: number, b: number) => a + b;

add(1, 2);
console.log('Hello World!');
`

const config = {
    compilerOptions: {
        target: ts.ScriptTarget.ESNext, 
    },
};
const transformer = createStripDebugTransformer(config);

/*
 * const add = (a: number, b: number) => a + b;
 *
 * add(1, 2);
 * void 0;
 */
const result = ts.transpileModule(sourceFile, {
    transformers: {
        before: [transformer]
    }
}).outputText;
```

### `stripDebug(source: string, config: Config = defaultConfig, path: string = 'index.ts')`

A helper function that strips debugger statement `source` using compilation options provided in `config`.

## Configuration

| Name              | Type              | Default                  | Description                                                                                                                                                                                                                                                                |
| ----------------- | ----------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `compilerOptions` | `CompilerOptions` | `{ "target": "ES2015" }` | TypeScript compiler options to be used on transformation process. Will be ignored by `createStripDebugTransformer`. Please refer to the [official documentation](https://www.typescriptlang.org/tsconfig#compilerOptions) for more information regarding supported values. |
| `debugger`        | `boolean`         | `true`                   | Strips `debugger` statements from the source.                                                                                                                                                                                                                              |
| `exclude`         | `string[]`        | `[]`                     | List of `console` methods that should not be stripped by the transformer. For example, filling this options with `['table']` will not strip `console.table` calls.                                                                                                         |

## FAQ

1. **What does `void 0` do?**

   [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void) is an operator that evaluates the given expression and returns `undefined`. TL;DR, it's a code that doesn't do anything.

2. **Why not removing the debugging statements altogether?**
   
   Completely stripping the debugging statements breaks some code. For example, given the following code:

   ```ts
   if (process.env.NODE_ENV === 'development')
     console.log('im debugging');

   const a = 3;

   a > 3 ? console.log('Greater than') : console.log('Lesser equal than');
   ```

   Completely stripping the debugging statements yield the following code:

   ```ts
   if (process.env.NODE_ENV === 'development')
     
   const a = 3;

   a > 3 ? : ;
   ```

   which is an invalid code. However, replacing it with a code that doesn't do anything like `void 0` will not break the code!

## Acknowledgements

This transformer is heavily inspired by [`@rollup/plugin-strip`](https://www.npmjs.com/package/@rollup/plugin-strip). This transformer is the generic version of it by utilizing [Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)