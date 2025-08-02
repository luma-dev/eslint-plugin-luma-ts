import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../../src/rules/no-date";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

ruleTester.run("no-date", rule, {
  valid: [
    // Temporal API usage is allowed
    {
      code: `const now = Temporal.Now.instant();`,
    },
    {
      code: `const dateTime = Temporal.PlainDateTime.from({ year: 2023, month: 12, day: 25 });`,
    },
    {
      code: `const instant = Temporal.Instant.from("2023-12-25T00:00:00Z");`,
    },
    {
      code: `const timestamp = Temporal.Now.instant().epochMilliseconds;`,
    },
    // Other non-Date identifiers named Date in different contexts
    {
      code: `const MyDate = { now: () => 123 };`,
    },
    {
      code: `interface CustomDate { value: number; }`,
    },
    // Date in comments or strings is fine
    {
      code: `// This used to use Date but now uses Temporal`,
    },
    {
      code: `const message = "Don't use Date";`,
    },
  ],
  invalid: [
    // new Date() constructor - various forms
    {
      code: `const d = new Date();`,
      errors: [{ messageId: "noDateConstructor" }],
    },
    {
      code: `const d = new Date("2023-12-25");`,
      errors: [{ messageId: "noDateConstructor" }],
    },
    {
      code: `const d = new Date(1234567890);`,
      errors: [{ messageId: "noDateConstructor" }],
    },
    {
      code: `const d = new Date(2023, 11, 25);`,
      errors: [{ messageId: "noDateConstructor" }],
    },
    {
      code: `const d = new Date(2023, 11, 25, 14, 30, 0, 500);`,
      errors: [{ messageId: "noDateConstructor" }],
    },

    // Date.now()
    {
      code: `const timestamp = Date.now();`,
      errors: [
        {
          messageId: "noDateStatic",
          data: {
            method: "now",
            suggestion: "Temporal.Now.instant().epochMilliseconds",
          },
        },
      ],
      output: `const timestamp = Temporal.Now.instant().epochMilliseconds;`,
    },

    // Date.parse()
    {
      code: `const timestamp = Date.parse("2023-12-25");`,
      errors: [
        {
          messageId: "noDateStatic",
          data: { method: "parse", suggestion: "Temporal.Instant.from" },
        },
      ],
      output: `const timestamp = Temporal.Instant.from("2023-12-25");`,
    },

    // Date.UTC()
    {
      code: `const timestamp = Date.UTC(2023, 11, 25);`,
      errors: [
        {
          messageId: "noDateStatic",
          data: { method: "UTC", suggestion: "Temporal.ZonedDateTime.from" },
        },
      ],
      output: null,
    },

    // Date instance methods
    {
      code: `const time = new Date().getTime();`,
      errors: [
        { messageId: "noDateInstanceMethod" },
        { messageId: "noDateConstructor" },
      ],
    },
    {
      code: `const year = new Date().getFullYear();`,
      errors: [
        { messageId: "noDateInstanceMethod" },
        { messageId: "noDateConstructor" },
      ],
    },
    {
      code: `const iso = new Date().toISOString();`,
      errors: [
        { messageId: "noDateInstanceMethod" },
        { messageId: "noDateConstructor" },
      ],
    },

    // Date type annotations
    {
      code: `let d: Date;`,
      errors: [{ messageId: "noDateType" }],
    },
    {
      code: `function formatDate(date: Date): string { return date.toString(); }`,
      errors: [{ messageId: "noDateType" }],
    },
    {
      code: `interface User { createdAt: Date; }`,
      errors: [{ messageId: "noDateType" }],
    },
    {
      code: `type DateArray = Date[];`,
      errors: [{ messageId: "noDateType" }],
    },
    {
      code: `const dates: ReadonlyArray<Date> = [];`,
      errors: [{ messageId: "noDateType" }],
    },

    // instanceof Date
    {
      code: `if (value instanceof Date) { console.log("is date"); }`,
      errors: [{ messageId: "noDateInstanceOf" }],
    },
    {
      code: `const isDate = obj instanceof Date;`,
      errors: [{ messageId: "noDateInstanceOf" }],
    },

    // Date as value
    {
      code: `const DateConstructor = Date;`,
      errors: [{ messageId: "noDateConstructor" }],
    },
    {
      code: `const types = [String, Number, Date];`,
      errors: [{ messageId: "noDateConstructor" }],
    },
    {
      code: `validateType(Date);`,
      errors: [{ messageId: "noDateConstructor" }],
    },

    // Complex scenarios
    {
      code: `
        function processDate() {
          const now = new Date();
          const timestamp = Date.now();
          const parsed = Date.parse("2023-12-25");
          return now.getTime() === timestamp;
        }
      `,
      output: `
        function processDate() {
          const now = new Date();
          const timestamp = Temporal.Now.instant().epochMilliseconds;
          const parsed = Temporal.Instant.from("2023-12-25");
          return now.getTime() === timestamp;
        }
      `,
      errors: [
        { messageId: "noDateConstructor", line: 3 },
        { messageId: "noDateStatic", line: 4 },
        { messageId: "noDateStatic", line: 5 },
      ],
    },
    {
      code: `
        class TimeUtil {
          private lastUpdate: Date;
          
          constructor() {
            this.lastUpdate = new Date();
          }
          
          isRecent(date: Date): boolean {
            return date instanceof Date && date.getTime() > this.lastUpdate.getTime();
          }
        }
      `,
      errors: [
        { messageId: "noDateType", line: 3 },
        { messageId: "noDateConstructor", line: 6 },
        { messageId: "noDateType", line: 9 },
        { messageId: "noDateInstanceOf", line: 10 },
      ],
    },
  ],
});
