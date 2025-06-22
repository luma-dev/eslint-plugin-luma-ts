import requireSatisfiesInTls from "./rules/require-satisfies-in-tls";

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
