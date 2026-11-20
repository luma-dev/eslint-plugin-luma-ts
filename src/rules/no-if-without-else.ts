import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../create-rule.js";

// Keep docs/rules/no-if-without-else.md, README.md and the tests in sync when
// changing which statements count as an exit.

type Options = Record<string, never>;
const defaultOptions: Options = {};

// Whether control never falls through `node`: it always ends with `return` or
// `throw`. `break` / `continue` do not count.
const alwaysExits = (node: TSESTree.Statement): boolean => {
  switch (node.type) {
    case AST_NODE_TYPES.ReturnStatement:
    case AST_NODE_TYPES.ThrowStatement:
      return true;
    case AST_NODE_TYPES.BlockStatement: {
      const last = node.body.at(-1);
      return last !== undefined && alwaysExits(last);
    }
    case AST_NODE_TYPES.IfStatement:
      return (
        node.alternate !== null &&
        alwaysExits(node.consequent) &&
        alwaysExits(node.alternate)
      );
    default:
      return false;
  }
};

export default createRule<[Options], "noIfWithoutElse">({
  name: "no-if-without-else",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow `if` without `else` unless the `if` branch always ends with `return` or `throw`",
    },
    messages: {
      noIfWithoutElse:
        "Add an `else` branch, or end the `if` branch with `return` / `throw` (early exit).",
    },
    schema: [],
  },
  defaultOptions: [defaultOptions],
  create(context) {
    return {
      IfStatement(node: TSESTree.IfStatement): void {
        if (node.alternate !== null) return;
        if (alwaysExits(node.consequent)) return;
        context.report({ node, messageId: "noIfWithoutElse" });
      },
    };
  },
});
