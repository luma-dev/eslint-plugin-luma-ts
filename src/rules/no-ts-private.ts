import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../create-rule.js";

type Options = Record<string, never>;
const defaultOptions: Options = {};

export default createRule<
  [Options],
  "noTsPrivateProperty" | "noTsPrivateMethod" | "noTsPrivateParameterProperty"
>({
  name: "no-ts-private",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow TypeScript `private` modifier. Use ECMAScript `#` private fields instead.",
    },
    messages: {
      noTsPrivateProperty:
        "Use ECMAScript private field `#` instead of TypeScript `private` modifier. The `private` keyword is not enforced at runtime.",
      noTsPrivateMethod:
        "Use ECMAScript private method `#` instead of TypeScript `private` modifier. The `private` keyword is not enforced at runtime.",
      noTsPrivateParameterProperty:
        "Avoid `private` parameter property. Declare the field with `#` prefix and assign it manually in the constructor body.",
    },
    schema: [],
  },
  defaultOptions: [defaultOptions],
  create(context) {
    function isConstructor(node: TSESTree.MethodDefinition): boolean {
      return (
        node.kind === "constructor" ||
        (node.key.type === AST_NODE_TYPES.Identifier &&
          node.key.name === "constructor")
      );
    }

    return {
      PropertyDefinition(node: TSESTree.PropertyDefinition): void {
        if (node.accessibility === "private") {
          context.report({
            node,
            messageId: "noTsPrivateProperty",
          });
        }
      },

      MethodDefinition(node: TSESTree.MethodDefinition): void {
        if (node.accessibility === "private" && !isConstructor(node)) {
          context.report({
            node,
            messageId: "noTsPrivateMethod",
          });
        }
      },

      TSParameterProperty(node: TSESTree.TSParameterProperty): void {
        if (node.accessibility === "private") {
          context.report({
            node,
            messageId: "noTsPrivateParameterProperty",
          });
        }
      },
    };
  },
});
