import { describe, expect, it } from "vitest";
import { cn } from "../lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("keeps the last conflicting tailwind utility", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles conditional values", () => {
    expect(cn("btn", false && "hidden", { active: true })).toBe(
      "btn active",
    );
  });

  it("returns an empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});
