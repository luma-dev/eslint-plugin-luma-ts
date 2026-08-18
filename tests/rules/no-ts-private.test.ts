import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../../src/rules/no-ts-private";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

ruleTester.run("no-ts-private", rule, {
  valid: [
    // ECMAScript private fields are allowed
    {
      code: `class Foo { #bar = 1; }`,
    },
    // ECMAScript private methods are allowed
    {
      code: `class Foo { #bar() {} }`,
    },
    // Public fields are allowed
    {
      code: `class Foo { bar = 1; }`,
    },
    // Public methods are allowed
    {
      code: `class Foo { bar() {} }`,
    },
    // Protected is not targeted by this rule
    {
      code: `class Foo { protected bar = 1; }`,
    },
    // Protected methods are not targeted
    {
      code: `class Foo { protected bar() {} }`,
    },
    // Static fields without private are allowed
    {
      code: `class Foo { static bar = 1; }`,
    },
    // Readonly fields without private are allowed
    {
      code: `class Foo { readonly bar = 1; }`,
    },
    // Private constructor is allowed (cannot use #constructor)
    {
      code: `class Foo { private constructor() {} }`,
    },
  ],
  invalid: [
    // Private property
    {
      code: `class Foo { private bar = 1; }`,
      errors: [{ messageId: "noTsPrivateProperty" }],
    },
    // Private method
    {
      code: `class Foo { private bar() {} }`,
      errors: [{ messageId: "noTsPrivateMethod" }],
    },
    // Private readonly property
    {
      code: `class Foo { private readonly bar = 1; }`,
      errors: [{ messageId: "noTsPrivateProperty" }],
    },
    // Private static property
    {
      code: `class Foo { private static bar = 1; }`,
      errors: [{ messageId: "noTsPrivateProperty" }],
    },
    // Private static method
    {
      code: `class Foo { private static bar() {} }`,
      errors: [{ messageId: "noTsPrivateMethod" }],
    },
    // Private getter
    {
      code: `class Foo { private get bar() { return 1; } }`,
      errors: [{ messageId: "noTsPrivateMethod" }],
    },
    // Private setter
    {
      code: `class Foo { private set bar(v: number) {} }`,
      errors: [{ messageId: "noTsPrivateMethod" }],
    },
    // Parameter property with private
    {
      code: `class Foo { constructor(private bar: number) {} }`,
      errors: [{ messageId: "noTsPrivateParameterProperty" }],
    },
    // Multiple private members
    {
      code: `class Foo { private a = 1; private b() {} }`,
      errors: [
        { messageId: "noTsPrivateProperty" },
        { messageId: "noTsPrivateMethod" },
      ],
    },
    // Private with type annotation
    {
      code: `class Foo { private bar: string = "hello"; }`,
      errors: [{ messageId: "noTsPrivateProperty" }],
    },
  ],
});
