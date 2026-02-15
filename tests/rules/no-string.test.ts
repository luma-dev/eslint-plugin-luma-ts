import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../../src/rules/no-string";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

ruleTester.run("no-string", rule, {
  valid: [
    // .toString() usage is allowed
    {
      code: `const s = value.toString();`,
    },
    // Template literal conversion is allowed
    {
      code: "const s = `${value}`;",
    },
    // String static methods are allowed
    {
      code: `const s = String.fromCharCode(65);`,
    },
    {
      code: `const s = String.fromCodePoint(9731);`,
    },
    {
      code: "const s = String.raw`hello\\nworld`;",
    },
    // String as a type is allowed
    {
      code: `const s: string = "hello";`,
    },
    // Other function calls are allowed
    {
      code: `const s = Number(value);`,
    },
    {
      code: `const s = myString(value);`,
    },
    // String.prototype usage is allowed
    {
      code: `const p = String.prototype.trim;`,
    },
    // Accessing String properties is allowed
    {
      code: `const len = String.length;`,
    },
  ],
  invalid: [
    // Basic String() call
    {
      code: `const s = String(value);`,
      errors: [{ messageId: "noStringCall" }],
    },
    // String() with numeric literal
    {
      code: `const s = String(42);`,
      errors: [{ messageId: "noStringCall" }],
    },
    // String() with boolean
    {
      code: `const s = String(true);`,
      errors: [{ messageId: "noStringCall" }],
    },
    // String() with no arguments
    {
      code: `const s = String();`,
      errors: [{ messageId: "noStringCall" }],
    },
    // String() in expression
    {
      code: `console.log(String(value));`,
      errors: [{ messageId: "noStringCall" }],
    },
    // String() in template literal
    {
      code: "const s = `prefix-${String(value)}`;",
      errors: [{ messageId: "noStringCall" }],
    },
    // String() in array
    {
      code: `const arr = [String(a), String(b)];`,
      errors: [{ messageId: "noStringCall" }, { messageId: "noStringCall" }],
    },
    // String() as argument
    {
      code: `fn(String(x));`,
      errors: [{ messageId: "noStringCall" }],
    },
    // new String() wrapper object
    {
      code: `const s = new String(value);`,
      errors: [{ messageId: "noNewString" }],
    },
    // new String() with no arguments
    {
      code: `const s = new String();`,
      errors: [{ messageId: "noNewString" }],
    },
  ],
});
