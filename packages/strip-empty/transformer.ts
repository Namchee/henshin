import * as ts from 'typescript';

interface Config {
  allowComments: boolean;
}

function isVoidBlock(node: ts.Block) {
  if (node.statements.length === 0) {
    return true;
  }

  let isEmpty = true;
  for (const statement of node.statements) {
    if (
      ts.isExpressionStatement(statement) &&
      !ts.isVoidExpression(statement.expression)
    ) {
      isEmpty = false;
    }
  }

  return isEmpty;
}

function isEmptyBlock(node: ts.Node): boolean {
  return ts.isBlock(node) && isVoidBlock(node);
}

function createStripDeadTransformer(config: Config) {
  return (ctx: ts.TransformationContext) => (source: ts.SourceFile) => {
    const walk = (node: ts.Node) => {
      switch (node.kind) {
        case ts.SyntaxKind.IfStatement: {
          const ifNode = node as ts.IfStatement;
          const isEmptyInlineNode =
            ts.isExpressionStatement(ifNode.thenStatement) &&
            ts.isVoidExpression(ifNode.thenStatement.expression);
          const isEmptyBlockNode =
            ts.isBlock(ifNode.thenStatement) &&
            isEmptyBlock(ifNode.thenStatement);

          return isEmptyInlineNode || isEmptyBlockNode
            ? ctx.factory.createEmptyStatement()
            : node;
        }
      }

      return ts.visitEachChild(node, walk, ctx);
    };

    return ts.visitNode(source, walk) as ts.SourceFile;
  };
}
