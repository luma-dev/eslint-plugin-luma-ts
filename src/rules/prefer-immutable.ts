import { AST_NODE_TYPES, TSESTree, TSESLint } from "@typescript-eslint/utils";
import { createRule } from "../create-rule.js";

type Options = Record<string, never>;
const defaultOptions: Options = {};

export default createRule<
  [Options],
  | "preferImmutableProperty"
  | "preferImmutableArray"
  | "preferImmutableArrayGeneric"
  | "preferImmutableIndexSignature"
  | "preferImmutableMappedType"
>({
  name: "prefer-immutable",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefer immutable types by enforcing readonly modifiers on all type properties and arrays",
    },
    messages: {
      preferImmutableProperty:
        "Property should be marked as readonly for immutability",
      preferImmutableArray:
        "Array type should use readonly modifier for immutability",
      preferImmutableArrayGeneric:
        "Use ReadonlyArray<T> instead of Array<T> for immutability",
      preferImmutableIndexSignature:
        "Index signature should be marked as readonly for immutability",
      preferImmutableMappedType:
        "Mapped type should use readonly modifier for immutability",
    },
    schema: [],
    fixable: "code",
    hasSuggestions: false,
  },
  defaultOptions: [defaultOptions],
  create(context) {
    const sourceCode = context.sourceCode;

    function addReadonlyToProperty(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.TSPropertySignature | TSESTree.TSIndexSignature,
    ) {
      const firstToken = sourceCode.getFirstToken(node);
      if (!firstToken) return null;

      // Check if readonly already exists
      if (node.readonly) return null;

      return fixer.insertTextBefore(firstToken, "readonly ");
    }

    function fixArrayType(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.TSArrayType,
    ) {
      const elementType = sourceCode.getText(node.elementType);
      const start = node.range[0];
      const end = node.range[1];

      return fixer.replaceTextRange(
        [start, end],
        `readonly (${elementType})[]`,
      );
    }

    function fixArrayReference(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.TSTypeReference,
    ) {
      if (
        node.typeName.type === AST_NODE_TYPES.Identifier &&
        node.typeName.name === "Array"
      ) {
        const typeParams = node.typeArguments?.params;
        if (typeParams && typeParams.length > 0) {
          const typeParam = sourceCode.getText(typeParams[0]);
          const start = node.range[0];
          const end = node.range[1];
          return fixer.replaceTextRange(
            [start, end],
            `ReadonlyArray<${typeParam}>`,
          );
        }
      }
      return null;
    }

    function checkTypeLiteral(node: TSESTree.TSTypeLiteral) {
      for (const member of node.members) {
        if (member.type === AST_NODE_TYPES.TSPropertySignature) {
          if (!member.readonly) {
            context.report({
              node: member,
              messageId: "preferImmutableProperty",
              fix: (fixer) => addReadonlyToProperty(fixer, member),
            });
          }
        } else if (member.type === AST_NODE_TYPES.TSIndexSignature) {
          if (!member.readonly) {
            context.report({
              node: member,
              messageId: "preferImmutableIndexSignature",
              fix: (fixer) => addReadonlyToProperty(fixer, member),
            });
          }
        }
      }
    }

    function checkType(node: TSESTree.TypeNode) {
      switch (node.type) {
        case AST_NODE_TYPES.TSTypeLiteral:
          checkTypeLiteral(node);
          break;

        case AST_NODE_TYPES.TSMappedType:
          if (!node.readonly) {
            context.report({
              node,
              messageId: "preferImmutableMappedType",
              fix: (fixer) => {
                // For mapped types, we need to insert 'readonly' before the opening bracket '['
                const openBracket = sourceCode.getFirstToken(node, {
                  filter: (token) => token.value === "[",
                });
                if (!openBracket) return null;
                return fixer.insertTextBefore(openBracket, "readonly ");
              },
            });
          }
          break;

        case AST_NODE_TYPES.TSArrayType:
          context.report({
            node,
            messageId: "preferImmutableArray",
            fix: (fixer) => fixArrayType(fixer, node),
          });
          break;

        case AST_NODE_TYPES.TSTypeReference:
          if (
            node.typeName.type === AST_NODE_TYPES.Identifier &&
            node.typeName.name === "Array"
          ) {
            context.report({
              node,
              messageId: "preferImmutableArrayGeneric",
              fix: (fixer) => fixArrayReference(fixer, node),
            });
          }
          break;
      }
    }

    return {
      TSTypeAliasDeclaration(node: TSESTree.TSTypeAliasDeclaration) {
        if (node.typeAnnotation) {
          checkType(node.typeAnnotation);
        }
      },
    };
  },
});
