import requireSatisfiesInTls from "./rules/require-satisfies-in-tls";
import noAsUnknownAs from "./rules/no-as-unknown-as";

export const rules = {
  "require-satisfies-in-tls": requireSatisfiesInTls,
  "no-as-unknown-as": noAsUnknownAs,
};

export const configs = {
  recommended: {
    plugins: ["luma-ts"],
    rules: {
      "luma-ts/require-satisfies-in-tls": "error",
      "luma-ts/no-as-unknown-as": "error",
    },
  },
};
