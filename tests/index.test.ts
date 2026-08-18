import { describe, it, expect } from "vitest";
import { rules, configs } from "../src/index";
import requireSatisfiesInTls from "../src/rules/require-satisfies-in-tls";
import noAsUnknownAs from "../src/rules/no-as-unknown-as";
import noExplicitReturnIs from "../src/rules/no-explicit-return-is";
import preferImmutable from "../src/rules/prefer-immutable";
import noDate from "../src/rules/no-date";
import noString from "../src/rules/no-string";
import noTsPrivate from "../src/rules/no-ts-private";

describe("index exports", () => {
  it("exports all rules", () => {
    expect(rules).toEqual({
      "require-satisfies-in-tls": requireSatisfiesInTls,
      "no-as-unknown-as": noAsUnknownAs,
      "no-explicit-return-is": noExplicitReturnIs,
      "prefer-immutable": preferImmutable,
      "no-date": noDate,
      "no-string": noString,
      "no-ts-private": noTsPrivate,
    });
  });

  it("exports recommended config in flat config format", () => {
    expect(configs).toHaveProperty("recommended");
    expect(configs.recommended).toEqual({
      plugins: {
        "luma-ts": { rules },
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
    });
  });

  it("recommended config includes all rules", () => {
    const recommendedRules = Object.keys(configs.recommended.rules);
    const allRules = Object.keys(rules).map((rule) => `luma-ts/${rule}`);
    expect(recommendedRules.sort()).toEqual(allRules.sort());
  });
});
