import ts from 'typescript';

import { basename } from 'node:path';

/**
 * Configuration object for the transformer
 */
export interface Config {
  /**
   * TypeScript's compiler options
   */
  compilerOptions?: ts.CompilerOptions;
  /**
   * Allow the transformer to strip `debugger;` statements
   */
  debugger?: boolean;
  /**
   * List of `console` methods to ignore when stripping `console` statements.
   */
  exclude?: string[];
}

function getScriptKind(filename: string): ts.ScriptKind {
  const ext = filename.split('.').pop() as string;

  switch (ext) {
    case 'jsx':
      return ts.ScriptKind.JSX;
    case 'tsx':
      return ts.ScriptKind.TSX;
    default:
      return ext.startsWith('js') ? ts.ScriptKind.JS : ts.ScriptKind.TS;
  }
}

function flattenExpression(node: ts.CallExpression): string[] {
  const tokens: string[] = [];

  let expr: ts.Expression = node.expression;
  while (expr) {
    switch (expr.kind) {
      case ts.SyntaxKind.PropertyAccessExpression: {
        tokens.unshift(
          (expr as ts.PropertyAccessExpression).name.escapedText.toString()
        );
        break;
      }
      case ts.SyntaxKind.ElementAccessExpression:
        const elementExpr = expr as ts.ElementAccessExpression;
        if (ts.isStringLiteral(elementExpr.argumentExpression)) {
          tokens.unshift(
            (elementExpr.argumentExpression as ts.StringLiteral).text
          );
        }
    }

    if ('expression' in expr) {
      expr = expr.expression as ts.Expression;
    } else {
      break;
    }
  }

  if (ts.isIdentifier(expr)) {
    tokens.unshift(expr.escapedText.toString());
  }

  return tokens;
}

function shouldStrip(flatExpr: string[], config: Config): boolean {
  if (flatExpr[0] !== 'console') {
    return false;
  }

  return config.exclude ? !config.exclude.includes(flatExpr[1]) : true;
}

const defaultConfig: Config = {
  compilerOptions: {
    ...ts.getDefaultCompilerOptions(),
    target: ts.ScriptTarget.ES2015,
  },
  debugger: true,
  exclude: [],
};

/**
 * Factory function for strip debug transformer
 *
 * @param {Config} config Transformer's configuration object, mya be omitted
 * @param {ts.CompilerOptions} config.compilerOptions TypeScript's compiler options. If not present,
 * will use the default options with `target` set to `ES2015`
 * @param {boolean} config.debugger Allows the transformer to strip `debugger` statements.
 * @param {string[]} config.exclude List of `console` methods to ignore when stripping `console` statements.
 * @returns A transformer instance that strips debug statements from a TypeScript
 * source file. Do note that this transformer might leave dangling statements.
 */
export function stripTransformer(
  config: Config = defaultConfig
): ts.TransformerFactory<ts.SourceFile> {
  return (ctx: ts.TransformationContext) => {
    return (source: ts.SourceFile) => {
      const walk = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
          const flattened = flattenExpression(node);

          return shouldStrip(flattened, config)
            ? ctx.factory.createVoidZero()
            : node;
        }

        if (ts.isDebuggerStatement(node) && config.debugger) {
          return ctx.factory.createEmptyStatement();
        }

        return ts.visitEachChild(node, walk, ctx);
      };

      return ts.visitNode(source, walk) as ts.SourceFile;
    };
  };
}

/**
 * Strip debugger statements from the given source text. Do note that this
 * transformer might leave dangling statements.
 *
 * @param {string} text Source file to be modified
 * @param {Config} config Configuration object, may be omitted
 * @param {ts.CompilerOptions} config.compilerOptions TypeScript's compiler options. If not present,
 * will use the default options with `target` set to `ES2015`
 * @param {boolean} config.debugger Allows the transformer to strip `debugger` statements.
 * @param {string[]} config.exclude List of `console` methods to ignore when stripping `console` statements.
 * @returns {string} processed source file without debugger statements.
 */
export function stripDebuggers(
  text: string,
  config: Config = defaultConfig,
  path: string = 'index.ts'
): string {
  const compilerOptions =
    config.compilerOptions ?? ts.getDefaultCompilerOptions();

  const sourceFile = ts.createSourceFile(
    basename(path),
    text,
    compilerOptions.target || ts.ScriptTarget.ES2015,
    false,
    getScriptKind(path)
  );

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    omitTrailingSemicolon: true,
  });

  const transformer = ts.transform(
    sourceFile,
    [stripTransformer(config)],
    config.compilerOptions
  );
  return printer.printNode(
    ts.EmitHint.Unspecified,
    transformer.transformed[0],
    sourceFile
  );
}
