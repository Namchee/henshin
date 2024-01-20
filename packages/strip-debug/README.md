# @namchee/ts-transformer-strip-debug

A TypeScript transfomer that replaces debugging statements such as [`debugger`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) and [`console`](https://developer.mozilla.org/en-US/docs/Web/API/console) methods with void expressions.

Supports plain JavaScript and JSX.

## Installation

```bash
# Using npm
npm install -D @namchee/ts-transformer-strip-debug

# Using yarn
yarn add -D @namchee/ts-transformer-strip-debug

# Using pnpm
pnpm install -D @namchee/ts-transfomer-strip-debug

# Using bun
bun install -D @namchee/ts-transformer-strip-debug
```

## API

### createStripDebugTransformer

A factory function

### stripDebug

foo bar

## Configuration