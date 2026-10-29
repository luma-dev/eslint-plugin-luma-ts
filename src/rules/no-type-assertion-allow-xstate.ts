import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../create-rule.js";

// Derived from @typescript-eslint/consistent-type-assertions with
// `assertionStyle: "never"`, plus an exception for XState's type-only
// `{} as T` pattern. Keep docs/rules/no-type-assertion-allow-xstate.md,
// README.md and the tests in sync when changing the allowed keys, default
// callees, or options.

export type Options = {
  // Function names whose direct object argument may contain the placeholder.
  // Matches `name(...)` and `obj.name(...)`. Replaces the default list.
  readonly callees?: ReadonlyArray<string>;
  // Skip the callee check and allow the placeholder in any object literal.
  readonly allowOutsideCall?: boolean;
};

const defaultOptions: Required<Options> = {
  callees: ["setup", "createMachine", "createStore"],
  allowOutsideCall: false,
};

// Keys whose value may itself be `{} as T`:
//   createMachine({ types: {} as { ... } })   (v5)
//   createMachine({ tsTypes: {} as Typegen }) (v4)
const DIRECT_KEYS: ReadonlySet<string> = new Set([
  "types",
  "schema",
  "tsTypes",
]);

// Keys whose object value may contain `{} as T` properties:
//   setup({ types: { context: {} as Ctx } })        (v5)
//   createMachine({ schema: { context: {} as Ctx } }) (v4)
const CONTAINER_KEYS: ReadonlySet<string> = new Set(["types", "schema"]);

const getStaticKeyName = (property: TSESTree.Property): string | undefined => {
  if (property.computed) return undefined;
  const { key } = property;
  if (key.type === AST_NODE_TYPES.Identifier) return key.name;
  if (key.type === AST_NODE_TYPES.Literal && typeof key.value === "string")
    return key.value;
  return undefined;
};

// Returns the property `{ key: node }` where `node` is the value, if any.
const getOwningProperty = (
  node: TSESTree.Node,
): TSESTree.Property | undefined => {
  const { parent } = node;
  return parent?.type === AST_NODE_TYPES.Property && parent.value === node
    ? parent
    : undefined;
};

const hasKeyIn = (
  property: TSESTree.Property | undefined,
  keys: ReadonlySet<string>,
): boolean => {
  if (property === undefined) return false;
  const name = getStaticKeyName(property);
  return name !== undefined && keys.has(name);
};

// Returns the top-level `types` / `schema` / `tsTypes` property of the
// machine config that contains the placeholder, if `node` is one.
const findConfigKeyProperty = (
  node: TSESTree.TSAsExpression,
): TSESTree.Property | undefined => {
  if (
    node.expression.type !== AST_NODE_TYPES.ObjectExpression ||
    node.expression.properties.length > 0
  )
    return undefined;

  const property = getOwningProperty(node);
  if (property === undefined || getStaticKeyName(property) === undefined)
    return undefined;
  if (hasKeyIn(property, DIRECT_KEYS)) return property;
  const container = getOwningProperty(property.parent);
  return hasKeyIn(container, CONTAINER_KEYS) ? container : undefined;
};

const getCalleeName = (callee: TSESTree.Expression): string | undefined => {
  if (callee.type === AST_NODE_TYPES.Identifier) return callee.name;
  if (
    callee.type === AST_NODE_TYPES.MemberExpression &&
    !callee.computed &&
    callee.property.type === AST_NODE_TYPES.Identifier
  )
    return callee.property.name;
  return undefined;
};

// Whether `config` is passed directly as an argument of an allowed callee.
const isArgumentOfCallee = (
  config: TSESTree.Node,
  callees: ReadonlySet<string>,
): boolean => {
  const { parent } = config;
  if (
    parent?.type !== AST_NODE_TYPES.CallExpression ||
    !parent.arguments.some((argument) => argument === config)
  )
    return false;
  const name = getCalleeName(parent.callee);
  return name !== undefined && callees.has(name);
};

const isConst = (node: TSESTree.TypeNode): boolean =>
  node.type === AST_NODE_TYPES.TSTypeReference &&
  node.typeName.type === AST_NODE_TYPES.Identifier &&
  node.typeName.name === "const";

export default createRule<[Options], "noTypeAssertion">({
  name: "no-type-assertion-allow-xstate",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow type assertions except `as const` and XState's `{} as T` type placeholders",
    },
    messages: {
      noTypeAssertion:
        "Do not use type assertions. Use type guards, parse functions, or `satisfies` instead.",
    },
    schema: [
      {
        type: "object",
        properties: {
          callees: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
          },
          allowOutsideCall: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [defaultOptions],
  create(context, [options]) {
    const callees: ReadonlySet<string> = new Set(
      options.callees ?? defaultOptions.callees,
    );
    const allowOutsideCall =
      options.allowOutsideCall ?? defaultOptions.allowOutsideCall;

    const isXStateTypePlaceholder = (
      node: TSESTree.TSAsExpression,
    ): boolean => {
      const configKeyProperty = findConfigKeyProperty(node);
      if (configKeyProperty === undefined) return false;
      return (
        allowOutsideCall ||
        isArgumentOfCallee(configKeyProperty.parent, callees)
      );
    };

    const report = (
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): void => {
      if (isConst(node.typeAnnotation)) return;
      context.report({ node, messageId: "noTypeAssertion" });
    };

    return {
      TSAsExpression(node: TSESTree.TSAsExpression): void {
        if (isXStateTypePlaceholder(node)) return;
        report(node);
      },
      TSTypeAssertion(node: TSESTree.TSTypeAssertion): void {
        report(node);
      },
    };
  },
});
