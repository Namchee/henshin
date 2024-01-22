# Henshin

Collection of TypeScript custom transformers for various uses. Browse the [packages](./packages) for list of available transformers.

## Usage

There are 4 ways to consume the transformers:

1. **CLI Wrapper**

   By default, TypeScript [does not support custom transformers](https://github.com/microsoft/TypeScript/issues/14419) by default. The community addresses this issue by providing a CLI wrapper that augments the functionality of `tsc`. such as [`ttypescript`](https://github.com/cevek/ttypescript) and [`ts-patch`](https://github.com/nonara/ts-patch).

2. **Compiler API**
    
   Besides using third-party, custom compilers can be consumed by creating your own pipeline using [Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) using `transform` or `transpile`.

2. **Bundlers**

   Some bundlers provides way to consume custom transformers through plugins such as [`webpack` via `ts-loader`](https://github.com/TypeStrong/ts-loader#getcustomtransformers) or [`ttypescript` plugin for `parcel` and `rollup`](https://github.com/cevek/ttypescript#parcel)


4. **Use the provided helper function**

   For convenience, every transformers in Henshin exposes a helper function besides transformer factory that takes care of the transformation process by simply providing the file contents and options. Please refer to each package `README.md` for more information about helper functions.

## License

This project is licensed under the [MIT License](./LICENSE)