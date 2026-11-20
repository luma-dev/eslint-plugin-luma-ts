import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../create-rule.js";

// Keep docs/rules/require-object-freeze.md, README.md and the tests in sync
// when changing the factory methods, transparent wrappers, or options.

export type Options = {
  // Allow object / array literals passed directly as call / new arguments,
  // including literals nested inside them (`fetch(url, { headers: { ... } })`).
  readonly allowCallArguments?: boolean;
};

const defaultOptions: Required<Options> = {
  allowCallArguments: false,
};

// `<global>.<name>(...)` calls that return a new mutable object or array.
// Instance methods (`xs.map(...)`) are not checked: without type information
// the receiver may not be an array.
const FACTORY_METHODS: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  [
    "Object",
    new Set([
      "fromEntries",
      "assign",
      "create",
      "groupBy",
      "keys",
      "values",
      "entries",
    ]),
  ],
  ["Array", new Set(["from", "of"])],
]);

const isStaticMethodCall = (
  node: TSESTree.Node | undefined,
  methods: ReadonlyMap<string, ReadonlySet<string>>,
): node is TSESTree.CallExpression =>
  node?.type === AST_NODE_TYPES.CallExpression &&
  node.callee.type === AST_NODE_TYPES.MemberExpression &&
  !node.callee.computed &&
  node.callee.object.type === AST_NODE_TYPES.Identifier &&
  node.callee.property.type === AST_NODE_TYPES.Identifier &&
  (methods.get(node.callee.object.name)?.has(node.callee.property.name) ??
    false);

const FREEZE: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  ["Object", new Set(["freeze"])],
]);
const ASSIGN: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  ["Object", new Set(["assign"])],
]);

// Type-only wrappers: erased at runtime and `as const` must stay directly on
// the literal, so the suggestion wraps the whole chain.
const getTsWrapperParent = (node: TSESTree.Node): TSESTree.Node | undefined => {
  const { parent } = node;
  switch (parent?.type) {
    case AST_NODE_TYPES.TSAsExpression:
    case AST_NODE_TYPES.TSSatisfiesExpression:
    case AST_NODE_TYPES.TSNonNullExpression:
    case AST_NODE_TYPES.TSTypeAssertion:
      return parent;
    default:
      return undefined;
  }
};

// Expressions whose value may be `node` itself at runtime.
const getTransparentParent = (
  node: TSESTree.Node,
): TSESTree.Node | undefined => {
  const tsWrapper = getTsWrapperParent(node);
  if (tsWrapper !== undefined) return tsWrapper;
  const { parent } = node;
  switch (parent?.type) {
    case AST_NODE_TYPES.ConditionalExpression:
      return parent.test === node ? undefined : parent;
    case AST_NODE_TYPES.LogicalExpression:
      return parent;
    case AST_NODE_TYPES.SequenceExpression:
      return parent.expressions.at(-1) === node ? parent : undefined;
    default:
      return undefined;
  }
};

const climb = (
  node: TSESTree.Node,
  getParent: (node: TSESTree.Node) => TSESTree.Node | undefined,
): TSESTree.Node => {
  const parent = getParent(node);
  return parent === undefined ? node : climb(parent, getParent);
};

const isFirstArgumentOf = (
  node: TSESTree.Node,
  call: TSESTree.CallExpression,
): boolean => call.arguments[0] === node;

// `Object.freeze(x)`, or the target of an `Object.assign` that is itself frozen.
const isFrozenPosition = (node: TSESTree.Node): boolean => {
  const outer = climb(node, getTransparentParent);
  const { parent } = outer;
  if (isStaticMethodCall(parent, FREEZE))
    return isFirstArgumentOf(outer, parent);
  if (isStaticMethodCall(parent, ASSIGN) && isFirstArgumentOf(outer, parent))
    return isFrozenPosition(parent);
  return false;
};

// The `Object.assign` call is the same object as its target, so only the call
// is checked.
const isAssignTarget = (node: TSESTree.Node): boolean => {
  const outer = climb(node, getTransparentParent);
  return (
    isStaticMethodCall(outer.parent, ASSIGN) &&
    isFirstArgumentOf(outer, outer.parent)
  );
};

const isPattern = (node: TSESTree.Node): boolean =>
  node.type === AST_NODE_TYPES.ObjectPattern ||
  node.type === AST_NODE_TYPES.ArrayPattern;

// Consumed without being exposed: spread sources (`{ ...x }`, `[...x]`,
// `f(...x)`), `Object.assign(t, x)` sources, destructuring sources
// (`const [a] = x`, `[a, b] = x`), and `for (... of x)`.
const isConsumedPosition = (node: TSESTree.Node): boolean => {
  const outer = climb(node, getTransparentParent);
  const { parent } = outer;
  switch (parent?.type) {
    case AST_NODE_TYPES.SpreadElement:
      return true;
    case AST_NODE_TYPES.VariableDeclarator:
      return parent.init === outer && isPattern(parent.id);
    case AST_NODE_TYPES.AssignmentExpression:
      return parent.right === outer && isPattern(parent.left);
    case AST_NODE_TYPES.ForOfStatement:
      return parent.right === outer;
    default:
      return (
        isStaticMethodCall(parent, ASSIGN) &&
        parent.arguments.some(
          (argument, index) => index > 0 && argument === outer,
        )
      );
  }
};

// Direct call / new argument, or a literal nested inside one.
const isInCallArgument = (node: TSESTree.Node): boolean => {
  const outer = climb(node, getTransparentParent);
  const { parent } = outer;
  switch (parent?.type) {
    case AST_NODE_TYPES.CallExpression:
    case AST_NODE_TYPES.NewExpression:
      return parent.arguments.some((argument) => argument === outer);
    case AST_NODE_TYPES.Property:
      return (
        parent.value === outer &&
        parent.parent.type === AST_NODE_TYPES.ObjectExpression &&
        isInCallArgument(parent.parent)
      );
    case AST_NODE_TYPES.ArrayExpression:
      return isInCallArgument(parent);
    default:
      return false;
  }
};

export default createRule<
  [Options],
  "requireObjectFreeze" | "wrapWithObjectFreeze"
>({
  name: "require-object-freeze",
  meta: {
    type: "suggestion",
    hasSuggestions: true,
    docs: {
      description:
        "Require new objects and arrays (`{}`, `[]`, `Object.fromEntries(...)`, `Array.from(...)`, etc.) to be wrapped with `Object.freeze`",
    },
    messages: {
      requireObjectFreeze:
        "Wrap this object / array with `Object.freeze(...)`. `readonly` and `as const` are not enforced at runtime.",
      wrapWithObjectFreeze: "Wrap with `Object.freeze(...)`.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allowCallArguments: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [defaultOptions],
  create(context, [options]) {
    const allowCallArguments =
      options.allowCallArguments ?? defaultOptions.allowCallArguments;

    const isAllowed = (node: TSESTree.Node): boolean =>
      isFrozenPosition(node) ||
      isAssignTarget(node) ||
      isConsumedPosition(node) ||
      (allowCallArguments && isInCallArgument(node));

    const check = (
      node:
        | TSESTree.ObjectExpression
        | TSESTree.ArrayExpression
        | TSESTree.CallExpression,
    ): void => {
      if (isAllowed(node)) return;
      const target = climb(node, getTsWrapperParent);
      context.report({
        node,
        messageId: "requireObjectFreeze",
        suggest: [
          {
            messageId: "wrapWithObjectFreeze",
            fix: (fixer) =>
              fixer.replaceText(
                target,
                `Object.freeze(${context.sourceCode.getText(target)})`,
              ),
          },
        ],
      });
    };

    return {
      ObjectExpression: check,
      ArrayExpression: check,
      CallExpression(node: TSESTree.CallExpression): void {
        if (isStaticMethodCall(node, FACTORY_METHODS)) check(node);
      },
    };
  },
});
