import requireSatisfiesInTls from "./rules/require-satisfies-in-tls";
import noAsUnknownAs from "./rules/no-as-unknown-as";
import noExplicitReturnIs from "./rules/no-explicit-return-is";
import preferImmutable from "./rules/prefer-immutable";
import noDate from "./rules/no-date";
import noString from "./rules/no-string";
import noTsPrivate from "./rules/no-ts-private";
import noTypeAssertionAllowXstate from "./rules/no-type-assertion-allow-xstate";
import type { TSESLint } from "@typescript-eslint/utils";

export const rules = {
  "require-satisfies-in-tls": requireSatisfiesInTls,
  "no-as-unknown-as": noAsUnknownAs,
  "no-explicit-return-is": noExplicitReturnIs,
  "prefer-immutable": preferImmutable,
  "no-date": noDate,
  "no-string": noString,
  "no-ts-private": noTsPrivate,
  "no-type-assertion-allow-xstate": noTypeAssertionAllowXstate,
};

// Rules intentionally excluded from `configs.recommended` (opt-in only).
// tests/index.test.ts checks that recommended covers every other rule.
export const optInRules: ReadonlyArray<keyof typeof rules> = [
  "no-type-assertion-allow-xstate",
];

const plugin = {
  rules,
} satisfies TSESLint.Linter.Plugin;

export const configs = {
  recommended: {
    plugins: {
      "luma-ts": plugin,
    },
    rules: {
      "luma-ts/require-satisfies-in-tls": "error",
      "luma-ts/no-as-unknown-as": "error",
      "luma-ts/no-explicit-return-is": "error",
      "luma-ts/prefer-immutable": "error",
      "luma-ts/no-date": "error",
      "luma-ts/no-string": "error",
      "luma-ts/no-ts-private": "error",
    },
  } satisfies TSESLint.FlatConfig.Config,
};
