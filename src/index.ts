import { ESLintUtils } from "@typescript-eslint/utils";
import requireSatisfiesInTls from "./rules/require-satisfies-in-tls";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/luma-dev/eslint-plugin-luma-ts/blob/main/docs/rules/${name}.md`,
);

export { createRule };

export const rules = {
  "require-satisfies-in-tls": requireSatisfiesInTls,
};

export const configs = {
  recommended: {
    plugins: ["luma-ts"],
    rules: {
      "luma-ts/require-satisfies-in-tls": "error",
    },
  },
};
