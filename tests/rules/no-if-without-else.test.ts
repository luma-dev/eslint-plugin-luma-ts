import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../../src/rules/no-if-without-else";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

const error = { messageId: "noIfWithoutElse" as const };

ruleTester.run("no-if-without-else", rule, {
  valid: [
    // if with else
    { code: `if (a) { f(); } else { g(); }` },
    { code: `if (a) f(); else g();` },
    // else-if chain ending with else
    { code: `if (a) { f(); } else if (b) { g(); } else { h(); }` },
    // Early return / throw without else
    { code: `function f() { if (a) return; g(); }` },
    { code: `function f() { if (a) return 1; return 2; }` },
    { code: `function f() { if (a) { return; } g(); }` },
    { code: `if (a) throw new Error();` },
    { code: `if (a) { throw new Error(); }` },
    // Block whose last statement exits
    { code: `function f() { if (a) { g(); return; } h(); }` },
    // Nested if/else where every branch exits
    {
      code: `function f() { if (a) { if (b) return 1; else throw e; } g(); }`,
    },
    // Nested block whose last statement exits
    { code: `function f() { if (a) { { return; } } }` },
    // else-if branches that exit
    {
      code: `function f() { if (a) return 1; else if (b) return 2; return 3; }`,
    },
  ],
  invalid: [
    // Plain if without else
    { code: `if (a) { f(); }`, errors: [error] },
    { code: `if (a) f();`, errors: [error] },
    // Empty consequent
    { code: `if (a) {}`, errors: [error] },
    // return / throw not at the end of the block
    { code: `function f() { if (a) { return; g(); } }`, errors: [error] },
    // Exit only inside a nested if without else
    {
      code: `function f() { if (a) { if (b) return; } }`,
      errors: [error],
    },
    // Nested if/else where only one branch exits
    {
      code: `function f() { if (a) { if (b) return; else g(); } }`,
      errors: [error],
    },
    // break / continue are not return / throw
    { code: `for (;;) { if (a) break; }`, errors: [error] },
    { code: `for (;;) { if (a) continue; }`, errors: [error] },
    // else-if chain without final else
    {
      code: `if (a) { f(); } else if (b) { g(); }`,
      errors: [error],
    },
    // Each if without else is reported
    {
      code: `if (a) { if (b) { f(); } } else { g(); }`,
      errors: [error],
    },
  ],
});
