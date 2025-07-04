import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../../src/rules/no-explicit-return-is";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

ruleTester.run("no-explicit-return-is", rule, {
  valid: [
    // Inferred return type (OK)
    {
      code: `const f = (a: string) => a === 'b';`,
    },
    // Using satisfies (OK)
    {
      code: `const f = ((a: string) => a === 'b') satisfies ((a: string) => a is 'b');`,
    },
    // Type annotation on variable (OK)
    {
      code: `const f: (a: string) => a is 'b' = (a: string) => a === 'b';`,
    },
    // Regular function without type predicate
    {
      code: `function isString(value: unknown): boolean {
  return typeof value === 'string';
}`,
    },
    // Arrow function without type predicate
    {
      code: `const isNumber = (value: unknown): boolean => typeof value === 'number';`,
    },
    // Function expression without type predicate
    {
      code: `const func = function(x: any): string {
  return x.toString();
};`,
    },
    // No return type annotation
    {
      code: `function test(x: string) {
  return x === 'test';
}`,
    },
    // Type predicate in type alias (not in function declaration)
    {
      code: `type Predicate = (x: unknown) => x is string;`,
    },
    // Type predicate in interface (not in function declaration)
    {
      code: `interface Checker {
  check(x: unknown): x is string;
}`,
    },
  ],
  invalid: [
    // Basic case: arrow function with explicit type predicate
    {
      code: `const f = (a: string): a is 'b' => a === 'b';`,
      errors: [
        {
          messageId: "noExplicitReturnIs",
        },
      ],
    },
    // Function declaration with type predicate
    {
      code: `function isString(value: unknown): value is string {
  return typeof value === 'string';
}`,
      errors: [
        {
          messageId: "noExplicitReturnIs",
        },
      ],
    },
    // Function expression with type predicate
    {
      code: `const isNumber = function(value: unknown): value is number {
  return typeof value === 'number';
};`,
      errors: [
        {
          messageId: "noExplicitReturnIs",
        },
      ],
    },
    // Complex type predicate
    {
      code: `const isArray = <T>(x: unknown): x is T[] => Array.isArray(x);`,
      errors: [
        {
          messageId: "noExplicitReturnIs",
        },
      ],
    },
    // Type predicate with union type
    {
      code: `function isStringOrNumber(x: unknown): x is string | number {
  return typeof x === 'string' || typeof x === 'number';
}`,
      errors: [
        {
          messageId: "noExplicitReturnIs",
        },
      ],
    },
    // Nested function with type predicate
    {
      code: `
const outer = () => {
  const inner = (x: unknown): x is boolean => {
    return typeof x === 'boolean';
  };
  return inner;
};`,
      errors: [
        {
          messageId: "noExplicitReturnIs",
        },
      ],
    },
  ],
});
