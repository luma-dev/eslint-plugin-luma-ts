import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../../src/rules/no-type-assertion-allow-xstate";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

ruleTester.run("no-type-assertion-allow-xstate", rule, {
  valid: [
    // `as const` is allowed (same as upstream assertionStyle: "never")
    {
      code: `const a = [1, 2] as const;`,
    },
    {
      code: `const a = <const>[1, 2];`,
    },
    // xstate v5: setup({ types: { ... } })
    {
      code: `setup({ types: { context: {} as Ctx, events: {} as Ev, input: {} as In } });`,
    },
    // xstate v5: createMachine({ types: {} as { ... } })
    {
      code: `createMachine({ types: {} as { context: Ctx; events: Ev } });`,
    },
    // xstate v4: schema + tsTypes
    {
      code: `createMachine({ schema: { context: {} as Ctx, events: {} as Ev }, tsTypes: {} as import("./m.typegen").Typegen0 });`,
    },
    // String-literal keys
    {
      code: `setup({ "types": { "context": {} as Ctx } });`,
    },
    // Chained setup(...).createMachine(...)
    {
      code: `setup({}).createMachine({ types: {} as { context: Ctx } });`,
    },
    // Namespace import: xstate.createMachine(...)
    {
      code: `xstate.createMachine({ types: { context: {} as Ctx } });`,
    },
    // @xstate/store
    {
      code: `createStore({ types: { emitted: {} as Em } });`,
    },
    // Custom callees
    {
      code: `myCreateMachine({ types: { context: {} as Ctx } });`,
      options: [{ callees: ["myCreateMachine"] }],
    },
    // allowOutsideCall: machine config declared outside the call
    {
      code: `const config = { types: { context: {} as Ctx } };`,
      options: [{ allowOutsideCall: true }],
    },
    // allowOutsideCall: any callee
    {
      code: `foo({ types: {} as T });`,
      options: [{ allowOutsideCall: true }],
    },
  ],
  invalid: [
    // Plain assertion
    {
      code: `const a = b as string;`,
      errors: [{ messageId: "noTypeAssertion" }],
    },
    // Angle-bracket assertion
    {
      code: `const a = <string>b;`,
      errors: [{ messageId: "noTypeAssertion" }],
    },
    // Angle-bracket is not allowed even in the xstate position
    {
      code: `setup({ types: { context: <Ctx>{} } });`,
      errors: [{ messageId: "noTypeAssertion" }],
    },
    // Non-empty object is not the xstate pattern
    {
      code: `setup({ types: { context: { a: 1 } as Ctx } });`,
      errors: [{ messageId: "noTypeAssertion" }],
    },
    // Non-object expression is not the xstate pattern
    {
      code: `setup({ types: { context: ctx as Ctx } });`,
      errors: [{ messageId: "noTypeAssertion" }],
    },
    // Unrelated key
    {
      code: `const a = { foo: {} as Foo };`,
      errors: [{ messageId: "noTypeAssertion" }],
    },
    // Unrelated outer key
    {
      code: `const a = { foo: { context: {} as Ctx } };`,
      errors: [{ messageId: "noTypeAssertion" }],
    },
    // Too deeply nested under `types`
    {
      code: `setup({ types: { context: { inner: {} as Ctx } } });`,
      errors: [{ messageId: "noTypeAssertion" }],
    },
    // Computed key is not the xstate pattern
    {
      code: `setup({ [types]: {} as Ctx });`,
      errors: [{ messageId: "noTypeAssertion" }],
    },
    // Chained assertion: neither `as` matches the `{} as T` pattern
    {
      code: `setup({ types: { context: {} as unknown as Ctx } });`,
      errors: [
        { messageId: "noTypeAssertion" },
        { messageId: "noTypeAssertion" },
      ],
    },
    // Default: machine config declared outside the call is not allowed
    {
      code: `const config = { types: { context: {} as Ctx } };`,
      errors: [{ messageId: "noTypeAssertion" }],
    },
    // Default: unknown callee
    {
      code: `foo({ types: {} as T, schema: { context: {} as Ctx } });`,
      errors: [
        { messageId: "noTypeAssertion" },
        { messageId: "noTypeAssertion" },
      ],
    },
    // Default callees are replaced (not merged) by the option
    {
      code: `setup({ types: {} as T });`,
      options: [{ callees: ["myCreateMachine"] }],
      errors: [{ messageId: "noTypeAssertion" }],
    },
    // Config must be a direct argument, not wrapped
    {
      code: `setup(wrap({ types: {} as T }));`,
      errors: [{ messageId: "noTypeAssertion" }],
    },
    // Computed member callee is not matched
    {
      code: `xstate["createMachine"]({ types: {} as T });`,
      errors: [{ messageId: "noTypeAssertion" }],
    },
    // allowOutsideCall still rejects non-placeholder assertions
    {
      code: `const a = { foo: {} as Foo };`,
      options: [{ allowOutsideCall: true }],
      errors: [{ messageId: "noTypeAssertion" }],
    },
    // Shorthand-like variable is not the xstate pattern
    {
      code: `const types = {} as Ctx;`,
      errors: [{ messageId: "noTypeAssertion" }],
    },
  ],
});
