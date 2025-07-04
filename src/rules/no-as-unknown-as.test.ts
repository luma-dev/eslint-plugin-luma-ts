import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "./no-as-unknown-as.js";

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
    // 通常のas使用は許可
    {
      code: `const value = someValue as string;`,
    },
    // 単独のas unknownは許可（完全な形ではないため）
    {
      code: `const value = someValue as unknown;`,
    },
    // 型ガード関数の使用
    {
      code: `
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
const value: unknown = getData();
if (isString(value)) {
  console.log(value); // string型として扱える
}
      `,
    },
    // パース関数の使用
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
    // 型アサーションではない構文
    {
      code: `const value: unknown = someValue;`,
    },
  ],
  invalid: [
    // 基本的な as unknown as パターン
    {
      code: `const value = someValue as unknown as string;`,
      errors: [
        {
          messageId: "noAsUnknownAs",
        },
      ],
    },
    // 複雑な型での as unknown as パターン
    {
      code: `const value = getData() as unknown as { name: string; age: number };`,
      errors: [
        {
          messageId: "noAsUnknownAs",
        },
      ],
    },
    // 配列型での as unknown as パターン
    {
      code: `const arr = someArray as unknown as string[];`,
      errors: [
        {
          messageId: "noAsUnknownAs",
        },
      ],
    },
    // ジェネリック型での as unknown as パターン
    {
      code: `const value = obj as unknown as Map<string, number>;`,
      errors: [
        {
          messageId: "noAsUnknownAs",
        },
      ],
    },
    // 関数の戻り値での使用
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
    // 変数代入での使用
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
