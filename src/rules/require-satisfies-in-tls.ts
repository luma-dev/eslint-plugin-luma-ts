import { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../create-rule";

export type Options = {
  readonly types: readonly string[];
};

const defaultOptions: Required<Options> = {
  types: ["string", "number", "bigint"],
};

export default createRule<[Options], "requireSatisfies">({
  name: "require-satisfies-in-tls",
  meta: {
    type: "problem",
    docs: {
      description: "Requires satisfies in Template-Literal-Strings",
    },
    messages: {
      requireSatisfies:
        "Template literal expressions must use satisfies with allowed types ({{allowedTypes}})",
    },
    schema: [
      {
        type: "object",
        properties: {
          types: {
            type: "array",
            items: {
              type: "string",
            },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [defaultOptions],
  create(context, [options]) {
    const allowedTypes = options.types;

    function checkTemplateLiteralExpression(node: TSESTree.TemplateLiteral) {
      for (const expression of node.expressions) {
        if (expression.type !== TSESTree.AST_NODE_TYPES.TSSatisfiesExpression) {
          context.report({
            node: expression,
            messageId: "requireSatisfies",
            data: {
              allowedTypes: allowedTypes.join(", "),
            },
          });
        } else if (
          expression.type === TSESTree.AST_NODE_TYPES.TSSatisfiesExpression
        ) {
          const typeAnnotation = expression.typeAnnotation;
          if (
            typeAnnotation.type === TSESTree.AST_NODE_TYPES.TSTypeReference &&
            typeAnnotation.typeName.type === TSESTree.AST_NODE_TYPES.Identifier
          ) {
            const typeName = typeAnnotation.typeName.name;
            if (!allowedTypes.includes(typeName)) {
              context.report({
                node: expression,
                messageId: "requireSatisfies",
                data: {
                  allowedTypes: allowedTypes.join(", "),
                },
              });
            }
          }
        }
      }
    }

    return {
      TemplateLiteral: checkTemplateLiteralExpression,
    };
  },
});
