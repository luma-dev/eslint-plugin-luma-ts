import { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../create-rule.js";

type Options = Record<string, never>;

const defaultOptions: Options = {};

export default createRule<[Options], "noExplicitReturnIs">({
  name: "no-explicit-return-is",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow explicit type predicate return types in function declarations",
    },
    messages: {
      noExplicitReturnIs:
        "Avoid explicit type predicate return types. Let TypeScript infer the return type or use type annotation/satisfies instead.",
    },
    schema: [],
    fixable: undefined,
    hasSuggestions: false,
  },
  defaultOptions: [defaultOptions],
  create(context) {
    return {
      // Check function declarations
      FunctionDeclaration(node: TSESTree.FunctionDeclaration): void {
        checkReturnType(node.returnType);
      },
      // Check function expressions
      FunctionExpression(node: TSESTree.FunctionExpression): void {
        checkReturnType(node.returnType);
      },
      // Check arrow functions
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void {
        checkReturnType(node.returnType);
      },
    };

    function checkReturnType(
      returnType: TSESTree.TSTypeAnnotation | undefined,
    ): void {
      if (!returnType) {
        return;
      }

      const typeNode = returnType.typeAnnotation;

      // Check if it's a type predicate (e.g., `a is string`)
      if (typeNode.type === TSESTree.AST_NODE_TYPES.TSTypePredicate) {
        context.report({
          node: returnType,
          messageId: "noExplicitReturnIs",
        });
      }
    }
  },
});
