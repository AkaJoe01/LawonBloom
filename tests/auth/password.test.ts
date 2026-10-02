import { describe, expect, it } from "vitest";
import {
  generatePassword,
  hashPassword,
  PASSWORD_ALPHABET,
  PASSWORD_ENTROPY_BITS,
  PASSWORD_LENGTH,
  verifyPassword,
} from "../../lib/auth/password";

describe("password primitives", () => {
  it("asserts entropy floor of 110 bits (Q47)", () => {
    expect(PASSWORD_ENTROPY_BITS).toBeGreaterThanOrEqual(110);
    expect(PASSWORD_ENTROPY_BITS).toBeGreaterThanOrEqual(116);
    expect(PASSWORD_ENTROPY_BITS).toBeLessThan(117);
  });

  it("generates 20-character passwords from the 57-symbol unambiguous alphabet", () => {
    expect(PASSWORD_ALPHABET).toHaveLength(57);
    expect(PASSWORD_ALPHABET).not.toMatch(/[lI0O1]/);
    for (let i = 0; i < 50; i += 1) {
      const password = generatePassword();
      expect(password).toHaveLength(PASSWORD_LENGTH);
      for (const char of password) {
        expect(PASSWORD_ALPHABET).toContain(char);
      }
    }
  });

  it("generates unique passwords across runs", () => {
    const seen = new Set(Array.from({ length: 200 }, () => generatePassword()));
    expect(seen.size).toBeGreaterThan(190);
  });

  it("round-trips a password through argon2id", async () => {
    const password = generatePassword();
    const hash = await hashPassword(password);
    expect(hash).toContain("$argon2id$");
    await expect(verifyPassword(hash, password)).resolves.toBe(true);
    await expect(verifyPassword(hash, `${password}x`)).resolves.toBe(false);
  });

  it("returns false (not throw) when the stored hash is malformed", async () => {
    await expect(verifyPassword("not-a-hash", generatePassword())).resolves.toBe(false);
  });
});
