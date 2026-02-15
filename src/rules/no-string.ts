import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../create-rule.js";

type Options = Record<string, never>;
const defaultOptions: Options = {};

export default createRule<[Options], "noStringCall" | "noNewString">({
  name: "no-string",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow String() and new String() for type conversion. Use .toString() or template literals instead.",
    },
    messages: {
      noStringCall:
        "Avoid using String() for type conversion. Use .toString() or a template literal instead.",
      noNewString:
        "Avoid using new String() to create string wrapper objects. Use .toString() or a template literal instead.",
    },
    schema: [],
  },
  defaultOptions: [defaultOptions],
  create(context) {
    function isStringIdentifier(node: TSESTree.Node): boolean {
      return node.type === AST_NODE_TYPES.Identifier && node.name === "String";
    }

    return {
      // String(value) call expression
      CallExpression(node: TSESTree.CallExpression): void {
        if (isStringIdentifier(node.callee)) {
          context.report({
            node,
            messageId: "noStringCall",
          });
        }
      },

      // new String(value) constructor
      NewExpression(node: TSESTree.NewExpression): void {
        if (isStringIdentifier(node.callee)) {
          context.report({
            node,
            messageId: "noNewString",
          });
        }
      },
    };
  },
});
