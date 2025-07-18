import requireSatisfiesInTls from "./rules/require-satisfies-in-tls";
import noAsUnknownAs from "./rules/no-as-unknown-as";
import noExplicitReturnIs from "./rules/no-explicit-return-is";
import preferImmutable from "./rules/prefer-immutable";

export const rules = {
  "require-satisfies-in-tls": requireSatisfiesInTls,
  "no-as-unknown-as": noAsUnknownAs,
  "no-explicit-return-is": noExplicitReturnIs,
  "prefer-immutable": preferImmutable,
};

export const configs = {
  recommended: {
    plugins: ["luma-ts"],
    rules: {
      "luma-ts/require-satisfies-in-tls": "error",
      "luma-ts/no-as-unknown-as": "error",
      "luma-ts/no-explicit-return-is": "error",
      "luma-ts/prefer-immutable": "error",
    },
  },
};
