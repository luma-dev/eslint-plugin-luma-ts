import { describe, it, expect } from "vitest";
import { rules, configs } from "../src/index";
import requireSatisfiesInTls from "../src/rules/require-satisfies-in-tls";
import noAsUnknownAs from "../src/rules/no-as-unknown-as";
import noExplicitReturnIs from "../src/rules/no-explicit-return-is";
import preferImmutable from "../src/rules/prefer-immutable";

describe("index exports", () => {
  it("exports all rules", () => {
    expect(rules).toEqual({
      "require-satisfies-in-tls": requireSatisfiesInTls,
      "no-as-unknown-as": noAsUnknownAs,
      "no-explicit-return-is": noExplicitReturnIs,
      "prefer-immutable": preferImmutable,
    });
  });

  it("exports recommended config", () => {
    expect(configs).toHaveProperty("recommended");
    expect(configs.recommended).toEqual({
      plugins: ["luma-ts"],
      rules: {
        "luma-ts/require-satisfies-in-tls": "error",
        "luma-ts/no-as-unknown-as": "error",
        "luma-ts/no-explicit-return-is": "error",
        "luma-ts/prefer-immutable": "error",
      },
    });
  });

  it("recommended config includes all rules", () => {
    const recommendedRules = Object.keys(configs.recommended.rules);
    const allRules = Object.keys(rules).map((rule) => `luma-ts/${rule}`);
    expect(recommendedRules.sort()).toEqual(allRules.sort());
  });
});
