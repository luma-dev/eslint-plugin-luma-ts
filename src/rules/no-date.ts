import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../create-rule.js";

type Options = Record<string, never>;
const defaultOptions: Options = {};

interface DateMethodReplacement {
  readonly pattern: string;
  readonly replacement: string;
  readonly requiresInstant?: boolean;
}

const dateMethodReplacements: ReadonlyArray<DateMethodReplacement> = [
  { pattern: "now", replacement: "Temporal.Now.instant().epochMilliseconds" },
  { pattern: "parse", replacement: "Temporal.Instant.from" },
  { pattern: "UTC", replacement: "Temporal.ZonedDateTime.from" },
] as const;

const dateInstanceReplacements = new Map<string, string>([
  ["getTime", ".epochMilliseconds"],
  ["getFullYear", ".year"],
  ["getMonth", ".month - 1"], // Temporal months are 1-based
  ["getDate", ".day"],
  ["getDay", ".dayOfWeek % 7"], // Temporal dayOfWeek is 1-7, Date getDay is 0-6
  ["getHours", ".hour"],
  ["getMinutes", ".minute"],
  ["getSeconds", ".second"],
  ["getMilliseconds", ".millisecond"],
  ["toISOString", ".toString()"],
  ["toJSON", ".toJSON()"],
]);

export default createRule<
  [Options],
  | "noDateConstructor"
  | "noDateStatic"
  | "noDateInstanceMethod"
  | "noDateType"
  | "noDateInstanceOf"
  | "suggestPlainDateTime"
  | "suggestInstant"
  | "suggestZonedDateTime"
>({
  name: "no-date",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow usage of Date in runtime code and suggest using Temporal API instead",
    },
    messages: {
      noDateConstructor:
        "Avoid using Date constructor. Use Temporal API instead (e.g., Temporal.Now.plainDateTime() or Temporal.Instant.from()).",
      noDateStatic:
        "Avoid using Date.{{method}}(). Use {{suggestion}} instead.",
      noDateInstanceMethod:
        "Avoid using Date instance methods. Consider using Temporal API instead.",
      noDateType:
        "Avoid using Date type. Use Temporal types instead (e.g., Temporal.Instant, Temporal.PlainDateTime).",
      noDateInstanceOf:
        "Avoid instanceof Date checks. Use Temporal type checks instead.",
      suggestPlainDateTime: "Replace with Temporal.PlainDateTime",
      suggestInstant: "Replace with Temporal.Instant",
      suggestZonedDateTime: "Replace with Temporal.ZonedDateTime",
    },
    schema: [],
    fixable: "code",
    hasSuggestions: false,
  },
  defaultOptions: [defaultOptions],
  create(context) {
    const sourceCode = context.sourceCode;

    function isDateIdentifier(node: TSESTree.Node): boolean {
      return node.type === AST_NODE_TYPES.Identifier && node.name === "Date";
    }

    return {
      // new Date() constructor
      NewExpression(node: TSESTree.NewExpression): void {
        if (isDateIdentifier(node.callee)) {
          context.report({
            node,
            messageId: "noDateConstructor",
          });
        }
      },

      // Date.method() static calls
      CallExpression(node: TSESTree.CallExpression): void {
        if (
          node.callee.type === AST_NODE_TYPES.MemberExpression &&
          isDateIdentifier(node.callee.object) &&
          node.callee.property.type === AST_NODE_TYPES.Identifier
        ) {
          const methodName = node.callee.property.name;
          const replacement = dateMethodReplacements.find(
            (r) => r.pattern === methodName,
          );

          if (replacement) {
            context.report({
              node,
              messageId: "noDateStatic",
              data: { method: methodName, suggestion: replacement.replacement },
              fix: (fixer) => {
                if (methodName === "now") {
                  return fixer.replaceText(node, replacement.replacement);
                } else if (
                  methodName === "parse" &&
                  node.arguments.length > 0
                ) {
                  const arg = sourceCode.getText(node.arguments[0]);
                  return fixer.replaceText(
                    node,
                    `${replacement.replacement}(${arg})`,
                  );
                }
                return null;
              },
            });
          }
        }

        // Check for instance method calls
        if (
          node.callee.type === AST_NODE_TYPES.MemberExpression &&
          node.callee.property.type === AST_NODE_TYPES.Identifier
        ) {
          const methodName = node.callee.property.name;
          if (dateInstanceReplacements.has(methodName)) {
            // We can't determine if the object is a Date without type info,
            // but we can report if it's obviously a Date (e.g., new Date().getTime())
            if (
              node.callee.object.type === AST_NODE_TYPES.NewExpression &&
              isDateIdentifier(node.callee.object.callee)
            ) {
              context.report({
                node,
                messageId: "noDateInstanceMethod",
              });
            }
          }
        }
      },

      // Date type annotations
      TSTypeReference(node: TSESTree.TSTypeReference): void {
        if (
          node.typeName.type === AST_NODE_TYPES.Identifier &&
          node.typeName.name === "Date"
        ) {
          context.report({
            node,
            messageId: "noDateType",
          });
        }
      },

      // instanceof Date checks
      BinaryExpression(node: TSESTree.BinaryExpression): void {
        if (node.operator === "instanceof" && isDateIdentifier(node.right)) {
          context.report({
            node,
            messageId: "noDateInstanceOf",
          });
        }
      },

      // Date identifier usage (catches remaining cases)
      Identifier(node: TSESTree.Identifier): void {
        if (
          node.name === "Date" &&
          node.parent?.type !== AST_NODE_TYPES.NewExpression &&
          node.parent?.type !== AST_NODE_TYPES.TSTypeReference &&
          !(
            node.parent?.type === AST_NODE_TYPES.MemberExpression &&
            node.parent.object === node
          ) &&
          !(
            node.parent?.type === AST_NODE_TYPES.BinaryExpression &&
            node.parent.operator === "instanceof" &&
            node.parent.right === node
          )
        ) {
          // This catches cases like passing Date as a value
          context.report({
            node,
            messageId: "noDateConstructor",
          });
        }
      },
    };
  },
});
