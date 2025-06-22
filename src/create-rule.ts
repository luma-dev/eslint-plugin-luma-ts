import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/luma-dev/eslint-plugin-luma-ts/blob/main/docs/rules/${name}.md`,
);

export { createRule };
