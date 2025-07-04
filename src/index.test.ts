import { describe, it, expect } from "vitest";
import { rules, configs } from "./index.js";
import requireSatisfiesInTls from "./rules/require-satisfies-in-tls.js";
import noAsUnknownAs from "./rules/no-as-unknown-as.js";

describe("index exports", () => {
  it("exports all rules", () => {
    expect(rules).toEqual({
      "require-satisfies-in-tls": requireSatisfiesInTls,
      "no-as-unknown-as": noAsUnknownAs,
    });
  });

  it("exports recommended config", () => {
    expect(configs).toHaveProperty("recommended");
    expect(configs.recommended).toEqual({
      plugins: ["luma-ts"],
      rules: {
        "luma-ts/require-satisfies-in-tls": "error",
        "luma-ts/no-as-unknown-as": "error",
      },
    });
  });

  it("recommended config includes all rules", () => {
    const recommendedRules = Object.keys(configs.recommended.rules);
    const allRules = Object.keys(rules).map((rule) => `luma-ts/${rule}`);
    expect(recommendedRules.sort()).toEqual(allRules.sort());
  });
});
