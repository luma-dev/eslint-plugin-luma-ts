import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../../src/rules/prefer-immutable.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

ruleTester.run("prefer-immutable", rule, {
  valid: [
    // Already has readonly
    "type A = { readonly age: number };",
    "type A = { readonly [a in string]: string };",
    "type A = readonly number[];",
    "type A = ReadonlyArray<number>;",
    // Nested readonly
    `type A = {
      readonly foo: {
        readonly bar: number;
      };
      readonly baz: {
        readonly bar: readonly (readonly number[])[];
      };
    };`,
    // Optional properties with readonly
    "type A = { readonly age?: number };",
    "type A = { readonly name?: string | undefined };",
    // Union and intersection types (not checked by this rule)
    "type A = { foo: number } | { bar: string };",
    "type A = { foo: number } & { bar: string };",
    // Tuple types (not checked by this rule)
    "type A = [number, string];",
    // Function types (not checked by this rule)
    "type A = (x: number) => string;",
    // Primitive types (not checked by this rule)
    "type A = string;",
    "type A = number;",
    "type A = boolean;",
    // Method signatures (method shorthand cannot have readonly, only property syntax)
    "type A = { foo(): void };", // TSMethodSignature - cannot have readonly
    "type A = { readonly foo: () => void };", // TSPropertySignature - can have readonly
    // Mapped types with optional
    "type A = { readonly [K in string]?: number };",
    // Index signatures with readonly
    "type A = { readonly [key: string]: number };",
    "type A = { readonly [index: number]: string };",
    // Mixed readonly and non-array types
    "type A = { readonly items: Set<number> };",
    "type A = { readonly data: Map<string, number> };",
  ],
  invalid: [
    {
      code: "type A = { age: number };",
      output: "type A = { readonly age: number };",
      errors: [{ messageId: "preferImmutableProperty" }],
    },
    {
      code: "type A = { [a in string]: string };",
      output: "type A = { readonly [a in string]: string };",
      errors: [{ messageId: "preferImmutableMappedType" }],
    },
    {
      code: "type A = number[];",
      output: "type A = readonly (number)[];",
      errors: [{ messageId: "preferImmutableArray" }],
    },
    {
      code: "type A = Array<number>;",
      output: "type A = ReadonlyArray<number>;",
      errors: [{ messageId: "preferImmutableArrayGeneric" }],
    },
    {
      code: `type A = {
  foo: {
    bar: number;
  };
  baz: {
    bar: number[][];
  };
};`,
      output: `type A = {
  readonly foo: {
    bar: number;
  };
  readonly baz: {
    bar: number[][];
  };
};`,
      errors: [
        { messageId: "preferImmutableProperty", line: 2 }, // foo property
        { messageId: "preferImmutableProperty", line: 5 }, // baz property
      ],
    },
    {
      code: `type A = {
  hello: number;
  // eslint-ignore-next-line ...
  world: number;
};`,
      output: `type A = {
  readonly hello: number;
  // eslint-ignore-next-line ...
  readonly world: number;
};`,
      errors: [
        { messageId: "preferImmutableProperty", line: 2 }, // hello property
        { messageId: "preferImmutableProperty", line: 4 }, // world property
      ],
    },
    // Optional properties
    {
      code: "type A = { age?: number };",
      output: "type A = { readonly age?: number };",
      errors: [{ messageId: "preferImmutableProperty" }],
    },
    {
      code: "type A = { name?: string | undefined };",
      output: "type A = { readonly name?: string | undefined };",
      errors: [{ messageId: "preferImmutableProperty" }],
    },
    // Method signature as property
    {
      code: "type A = { foo: () => void };",
      output: "type A = { readonly foo: () => void };",
      errors: [{ messageId: "preferImmutableProperty" }],
    },
    // Mixed optional and required properties
    {
      code: `type A = {
  name: string;
  age?: number;
  address?: {
    street: string;
    city?: string;
  };
};`,
      output: `type A = {
  readonly name: string;
  readonly age?: number;
  readonly address?: {
    street: string;
    city?: string;
  };
};`,
      errors: [
        { messageId: "preferImmutableProperty", line: 2 },
        { messageId: "preferImmutableProperty", line: 3 },
        { messageId: "preferImmutableProperty", line: 4 },
      ],
    },
    // Index signatures
    {
      code: "type A = { [key: string]: number };",
      output: "type A = { readonly [key: string]: number };",
      errors: [{ messageId: "preferImmutableIndexSignature" }],
    },
    {
      code: "type A = { [index: number]: string };",
      output: "type A = { readonly [index: number]: string };",
      errors: [{ messageId: "preferImmutableIndexSignature" }],
    },
    // Mapped types with optional
    {
      code: "type A = { [K in string]?: number };",
      output: "type A = { readonly [K in string]?: number };",
      errors: [{ messageId: "preferImmutableMappedType" }],
    },
    // Complex nested arrays
    {
      code: "type A = Array<Array<number>>;",
      output: "type A = ReadonlyArray<Array<number>>;",
      errors: [{ messageId: "preferImmutableArrayGeneric" }],
    },
    {
      code: "type A = number[][][];",
      output: "type A = readonly (number[][])[];",
      errors: [{ messageId: "preferImmutableArray" }],
    },
    {
      code: "type A = (string | number)[];",
      output: "type A = readonly (string | number)[];",
      errors: [{ messageId: "preferImmutableArray" }],
    },
    // Properties with array values
    {
      code: "type A = { items: string[] };",
      output: "type A = { readonly items: string[] };",
      errors: [{ messageId: "preferImmutableProperty" }],
    },
    {
      code: "type A = { data: Array<{ id: number }> };",
      output: "type A = { readonly data: Array<{ id: number }> };",
      errors: [{ messageId: "preferImmutableProperty" }],
    },
    // Computed property names
    {
      code: "type A = { [Symbol.iterator]: () => Iterator<number> };",
      output:
        "type A = { readonly [Symbol.iterator]: () => Iterator<number> };",
      errors: [{ messageId: "preferImmutableProperty" }],
    },
    // String literal properties
    {
      code: 'type A = { "foo-bar": number };',
      output: 'type A = { readonly "foo-bar": number };',
      errors: [{ messageId: "preferImmutableProperty" }],
    },
    {
      code: "type A = { 123: string };",
      output: "type A = { readonly 123: string };",
      errors: [{ messageId: "preferImmutableProperty" }],
    },
    // Mixed regular and index signatures
    {
      code: `type A = {
  foo: string;
  [key: string]: string;
};`,
      output: `type A = {
  readonly foo: string;
  readonly [key: string]: string;
};`,
      errors: [
        { messageId: "preferImmutableProperty", line: 2 },
        { messageId: "preferImmutableIndexSignature", line: 3 },
      ],
    },
  ],
});
