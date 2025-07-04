import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../../src/rules/no-as-unknown-as";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

ruleTester.run("no-as-unknown-as", rule, {
  valid: [
    // Regular as usage is allowed
    {
      code: `const value = someValue as string;`,
    },
    // Single as unknown is allowed (not the complete pattern)
    {
      code: `const value = someValue as unknown;`,
    },
    // Using type guard functions
    {
      code: `
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
const value: unknown = getData();
if (isString(value)) {
  console.log(value); // value is safely typed as string
}
      `,
    },
    // Using parse functions
    {
      code: `
function parseString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  throw new Error('Not a string');
}
const value = parseString(getData());
      `,
    },
    // Type annotation syntax (not type assertion)
    {
      code: `const value: unknown = someValue;`,
    },
  ],
  invalid: [
    // Basic as unknown as pattern
    {
      code: `const value = someValue as unknown as string;`,
      errors: [
        {
          messageId: "noAsUnknownAs",
        },
      ],
    },
    // Complex type with as unknown as pattern
    {
      code: `const value = getData() as unknown as { name: string; age: number };`,
      errors: [
        {
          messageId: "noAsUnknownAs",
        },
      ],
    },
    // Array type with as unknown as pattern
    {
      code: `const arr = someArray as unknown as string[];`,
      errors: [
        {
          messageId: "noAsUnknownAs",
        },
      ],
    },
    // Generic type with as unknown as pattern
    {
      code: `const value = obj as unknown as Map<string, number>;`,
      errors: [
        {
          messageId: "noAsUnknownAs",
        },
      ],
    },
    // Usage in function return value
    {
      code: `
function getValue() {
  return someValue as unknown as string;
}
      `,
      errors: [
        {
          messageId: "noAsUnknownAs",
        },
      ],
    },
    // Usage in variable assignment
    {
      code: `
let value: string;
value = getData() as unknown as string;
      `,
      errors: [
        {
          messageId: "noAsUnknownAs",
        },
      ],
    },
  ],
});
