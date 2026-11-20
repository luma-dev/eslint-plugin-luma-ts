import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../../src/rules/require-object-freeze";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
    },
  },
});

// Builds the single expected error with its `Object.freeze(...)` suggestion.
const wrapped = (output: string) => ({
  messageId: "requireObjectFreeze" as const,
  suggestions: [{ messageId: "wrapWithObjectFreeze" as const, output }],
});

ruleTester.run("require-object-freeze", rule, {
  valid: [
    // Object literal passed to Object.freeze
    { code: `const a = Object.freeze({});` },
    { code: `const a = Object.freeze({ b: 1 });` },
    // Nested literals frozen individually
    { code: `const a = Object.freeze({ b: Object.freeze({ c: 1 }) });` },
    // Object factory methods passed to Object.freeze
    { code: `const a = Object.freeze(Object.fromEntries(entries));` },
    { code: `const a = Object.freeze(Object.create(null));` },
    { code: `const a = Object.freeze(Object.groupBy(xs, f));` },
    // Object.assign target inside Object.freeze
    { code: `const a = Object.freeze(Object.assign({}, b, c));` },
    // TS-only wrappers are transparent
    { code: `const a = Object.freeze({ b: 1 } as const);` },
    { code: `const a = Object.freeze({ b: 1 } satisfies Foo);` },
    { code: `const a = Object.freeze({ b: 1 }!);` },
    // Conditional / logical / sequence branches are transparent
    { code: `const a = Object.freeze(c ? { b: 1 } : { b: 2 });` },
    { code: `const a = Object.freeze(b ?? {});` },
    { code: `const a = Object.freeze((f(), {}));` },
    // Spread source is copied, never exposed
    { code: `const a = Object.freeze({ ...{ b: 1 } });` },
    // Object.assign sources are copied, never exposed
    { code: `const a = Object.freeze(Object.assign({}, { b: 1 }));` },
    // Patterns and types are not object expressions
    { code: `const { a } = b;` },
    { code: `({ a } = b);` },
    { code: `type A = { b: number };` },
    // Other Object static methods are not factories
    { code: `const p = Object.getPrototypeOf(a);` },
    // Non-Object callee with the same method name
    { code: `const a = Foo.fromEntries(entries);` },
    { code: `const a = Foo.from(xs);` },
    // Arrays passed to Object.freeze
    { code: `const a = Object.freeze([]);` },
    { code: `const a = Object.freeze([1, 2] as const);` },
    { code: `const a = Object.freeze(Array.from(xs));` },
    { code: `const a = Object.freeze(Array.of(1, 2));` },
    { code: `const a = Object.freeze(Object.keys(b));` },
    { code: `const a = Object.freeze(Object.values(b));` },
    { code: `const a = Object.freeze(Object.entries(b));` },
    { code: `const a = Object.freeze([Object.freeze({ b: 1 })]);` },
    // Spread sources are copied, never exposed
    { code: `const a = Object.freeze([...[1, 2]]);` },
    { code: `f(...[a, b]);` },
    // Destructuring sources are never exposed
    { code: `const [a, b] = [1, 2];` },
    { code: `const { a } = { a: 1 };` },
    { code: `[a, b] = [b, a];` },
    { code: `({ a } = { a: 1 });` },
    // for...of iterable is never exposed
    { code: `for (const x of [1, 2]) {}` },
    // Array patterns are not array expressions
    { code: `const [a] = b;` },
    // allowCallArguments: direct argument and its literal tree
    {
      code: `fetch(url, { method: "POST", headers: { a: "b" } });`,
      options: [{ allowCallArguments: true }],
    },
    {
      code: `new Foo({ a: [{ b: 1 }] });`,
      options: [{ allowCallArguments: true }],
    },
    {
      code: `f({ a: 1 } satisfies Foo);`,
      options: [{ allowCallArguments: true }],
    },
  ],
  invalid: [
    // Bare array literals
    {
      code: `const a = [];`,
      errors: [wrapped(`const a = Object.freeze([]);`)],
    },
    {
      code: `const a = [1, 2] as const;`,
      errors: [wrapped(`const a = Object.freeze([1, 2] as const);`)],
    },
    // Array factory methods
    {
      code: `const a = Array.from(xs);`,
      errors: [wrapped(`const a = Object.freeze(Array.from(xs));`)],
    },
    {
      code: `const a = Array.of(1, 2);`,
      errors: [wrapped(`const a = Object.freeze(Array.of(1, 2));`)],
    },
    {
      code: `const a = Object.keys(b);`,
      errors: [wrapped(`const a = Object.freeze(Object.keys(b));`)],
    },
    {
      code: `const a = Object.entries(b);`,
      errors: [wrapped(`const a = Object.freeze(Object.entries(b));`)],
    },
    // Nested array inside a frozen object (freeze is shallow)
    {
      code: `const a = Object.freeze({ b: [1] });`,
      errors: [wrapped(`const a = Object.freeze({ b: Object.freeze([1]) });`)],
    },
    // Nested array inside a frozen array
    {
      code: `const a = Object.freeze([[1]]);`,
      errors: [wrapped(`const a = Object.freeze([Object.freeze([1])]);`)],
    },
    // Array spread result is still a new array
    {
      code: `const a = [...b];`,
      errors: [wrapped(`const a = Object.freeze([...b]);`)],
    },
    // Destructuring default is exposed
    {
      code: `const [a = []] = b;`,
      errors: [wrapped(`const [a = Object.freeze([])] = b;`)],
    },
    // Bare object literals
    {
      code: `const a = {};`,
      errors: [wrapped(`const a = Object.freeze({});`)],
    },
    {
      code: `const a = { b: 1 };`,
      errors: [wrapped(`const a = Object.freeze({ b: 1 });`)],
    },
    // Object factory methods
    {
      code: `const a = Object.fromEntries(entries);`,
      errors: [
        wrapped(`const a = Object.freeze(Object.fromEntries(entries));`),
      ],
    },
    {
      code: `const a = Object.create(null);`,
      errors: [wrapped(`const a = Object.freeze(Object.create(null));`)],
    },
    {
      code: `const a = Object.groupBy(xs, f);`,
      errors: [wrapped(`const a = Object.freeze(Object.groupBy(xs, f));`)],
    },
    // Object.assign is reported once; its `{}` target is the same object
    {
      code: `const a = Object.assign({}, b);`,
      errors: [wrapped(`const a = Object.freeze(Object.assign({}, b));`)],
    },
    // Nested literal inside a frozen object (freeze is shallow)
    {
      code: `const a = Object.freeze({ b: { c: 1 } });`,
      errors: [
        wrapped(`const a = Object.freeze({ b: Object.freeze({ c: 1 }) });`),
      ],
    },
    // Nested literal inside an array
    {
      code: `const a = Object.freeze([{ b: 1 }]);`,
      errors: [wrapped(`const a = Object.freeze([Object.freeze({ b: 1 })]);`)],
    },
    // Suggestion wraps TS-only wrappers so `as const` stays valid
    {
      code: `const a = { b: 1 } as const;`,
      errors: [wrapped(`const a = Object.freeze({ b: 1 } as const);`)],
    },
    {
      code: `const a = { b: 1 } satisfies Foo;`,
      errors: [wrapped(`const a = Object.freeze({ b: 1 } satisfies Foo);`)],
    },
    // Each branch of a conditional is reported
    {
      code: `const a = c ? {} : { b: 1 };`,
      errors: [
        wrapped(`const a = c ? Object.freeze({}) : { b: 1 };`),
        wrapped(`const a = c ? {} : Object.freeze({ b: 1 });`),
      ],
    },
    // Logical fallback
    {
      code: `const a = b ?? {};`,
      errors: [wrapped(`const a = b ?? Object.freeze({});`)],
    },
    // Return value and arrow body
    {
      code: `const f = () => ({ a: 1 });`,
      errors: [wrapped(`const f = () => (Object.freeze({ a: 1 }));`)],
    },
    {
      code: `function f() { return { a: 1 }; }`,
      errors: [wrapped(`function f() { return Object.freeze({ a: 1 }); }`)],
    },
    // Default parameter
    {
      code: `function f(a = {}) {}`,
      errors: [wrapped(`function f(a = Object.freeze({})) {}`)],
    },
    // Object literal containing a spread is still a new object
    {
      code: `const a = { ...b };`,
      errors: [wrapped(`const a = Object.freeze({ ...b });`)],
    },
    // Call arguments are reported by default
    {
      code: `f({ a: 1 });`,
      errors: [wrapped(`f(Object.freeze({ a: 1 }));`)],
    },
    // allowCallArguments does not cover non-argument positions
    {
      code: `const a = { b: 1 };`,
      options: [{ allowCallArguments: true }],
      errors: [wrapped(`const a = Object.freeze({ b: 1 });`)],
    },
    // allowCallArguments does not cover objects returned from a callback
    {
      code: `f(() => ({ a: 1 }));`,
      options: [{ allowCallArguments: true }],
      errors: [wrapped(`f(() => (Object.freeze({ a: 1 })));`)],
    },
    // Object.assign sources outside of freeze are still copied, only the call is reported
    {
      code: `const a = Object.assign(b, { c: 1 });`,
      errors: [wrapped(`const a = Object.freeze(Object.assign(b, { c: 1 }));`)],
    },
  ],
});
