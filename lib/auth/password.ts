import argon2 from "argon2";
import { randomInt } from "node:crypto";

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
} as const;

const DUMMY_HASH =
  "$argon2id$v=19$m=65536,p=4,t=3$cfQf7ldsVygDv7XLUR7sLA$C+/bhmQF5QNEfijWjCD4XDDalc3wH+I0UxCM9YT687Q";

export const PASSWORD_ALPHABET =
  "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const PASSWORD_LENGTH = 20;
export const PASSWORD_ENTROPY_BITS = Math.log2(PASSWORD_ALPHABET.length) * PASSWORD_LENGTH;

export async function hashPassword(plaintext: string): Promise<string> {
  return argon2.hash(plaintext, ARGON2_OPTIONS);
}

export async function verifyPassword(hash: string, plaintext: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plaintext);
  } catch {
    try {
      await argon2.verify(DUMMY_HASH, plaintext);
    } catch {
      // malformed stored hash — dummy path already equalized timing
    }
    return false;
  }
}

export function generatePassword(): string {
  let out = "";
  for (let i = 0; i < PASSWORD_LENGTH; i += 1) {
    out += PASSWORD_ALPHABET[randomInt(PASSWORD_ALPHABET.length)];
  }
  return out;
}
