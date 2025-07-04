import { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../create-rule.js";

type Options = Record<string, never>;

const defaultOptions: Options = {};

export default createRule<[Options], "noAsUnknownAs">({
  name: "no-as-unknown-as",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow 'as unknown as T' form casting and suggest using parse or type-guard functions",
    },
    messages: {
      noAsUnknownAs:
        "Avoid 'as unknown as T' casting. Use parse functions or type guards instead.",
    },
    schema: [],
    fixable: undefined,
    hasSuggestions: false,
  },
  defaultOptions: [defaultOptions],
  create(context) {
    return {
      TSAsExpression(node: TSESTree.TSAsExpression): void {
        // Check if this is an 'as unknown' expression
        if (
          node.typeAnnotation.type ===
            TSESTree.AST_NODE_TYPES.TSUnknownKeyword &&
          node.parent?.type === TSESTree.AST_NODE_TYPES.TSAsExpression
        ) {
          // This is the inner 'as unknown' part of 'expression as unknown as T'
          context.report({
            node: node.parent,
            messageId: "noAsUnknownAs",
          });
        }
      },
    };
  },
});
