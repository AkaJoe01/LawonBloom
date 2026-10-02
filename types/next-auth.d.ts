import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "EDITOR";
      totpEnabled: boolean;
      needsEnrollment: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "EDITOR";
    sessionEpoch: number;
    totpEnabled: boolean;
    needsEnrollment: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "EDITOR";
    epoch?: number;
    absStart?: number;
    lastActivity?: number;
    totpEnabled?: boolean;
    needsEnrollment?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: "ADMIN" | "EDITOR";
    epoch?: number;
    absStart?: number;
    lastActivity?: number;
    totpEnabled?: boolean;
    needsEnrollment?: boolean;
  }
}
