import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../../src/rules/require-satisfies-in-tls";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

ruleTester.run("require-satisfies-in-tls", rule, {
  valid: [
    {
      code: "`Hello ${name satisfies string}`",
    },
    {
      code: "`Count: ${count satisfies number}`",
    },
    {
      code: "`BigInt: ${value satisfies bigint}`",
    },
    {
      code: "`Multiple ${name satisfies string} and ${count satisfies number}`",
    },
    {
      code: "`Custom ${value satisfies CustomType}`",
      options: [{ types: ["CustomType"] }],
    },
    {
      code: "`Plain template literal without expressions`",
    },
  ],
  invalid: [
    {
      code: "`Hello ${name}`",
      errors: [
        {
          messageId: "requireSatisfies",
        },
      ],
    },
    {
      code: "`Count: ${count}`",
      errors: [
        {
          messageId: "requireSatisfies",
        },
      ],
    },
    {
      code: "`Mixed ${name satisfies string} and ${count}`",
      errors: [
        {
          messageId: "requireSatisfies",
        },
      ],
    },
    {
      code: "`Custom type not allowed ${value satisfies CustomType}`",
      errors: [
        {
          messageId: "requireSatisfies",
        },
      ],
    },
  ],
});
