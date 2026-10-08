import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { headers } from "next/headers";
import { authorizeCredentials } from "@/lib/auth/authorize";
import { getDb } from "@/lib/db";
import { ridOf } from "@/lib/observability/log";
import { loginSchema } from "@/lib/validation/auth";

const ABSOLUTE_SESSION_SECONDS = 12 * 60 * 60;

// 2FA-DISABLED: re-enable together with the two_factor branch in authorize().
// class TwoFactorRequired extends CredentialsSignin {
//   code = "two_factor";
// }

class AccountLocked extends CredentialsSignin {
  code = "locked";
}

async function clientIp(headerStore: Headers): Promise<string> {
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headerStore.get("x-real-ip")?.trim() || "unknown";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: ABSOLUTE_SESSION_SECONDS,
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        // 2FA-DISABLED: totp: {},
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }
        const headerStore = await headers();
        const ip = await clientIp(headerStore);
        const rid = ridOf(headerStore) ?? undefined;
        const outcome = await authorizeCredentials({ ...parsed.data, ip, rid });
        if (outcome.status === "ok") {
          return {
            id: outcome.user.id,
            email: outcome.user.email,
            name: outcome.user.name,
            role: outcome.user.role,
            sessionEpoch: outcome.user.sessionEpoch,
            totpEnabled: outcome.user.totpEnabled,
            needsEnrollment: outcome.user.needsEnrollment,
          };
        }
        // 2FA-DISABLED: outcome can no longer be "two_factor" while the
        // second-factor block in authorize() is commented out.
        // if (outcome.status === "two_factor") {
        //   throw new TwoFactorRequired();
        // }
        if (outcome.status === "locked") {
          throw new AccountLocked();
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.epoch = user.sessionEpoch;
        token.totpEnabled = user.totpEnabled;
        token.needsEnrollment = user.needsEnrollment;
        token.absStart = Math.floor(Date.now() / 1000);
        token.lastActivity = token.absStart;
        token.exp = token.absStart + ABSOLUTE_SESSION_SECONDS;
        return token;
      }

      const db = getDb();
      const fresh = await db.user.findUnique({
        where: { id: token.sub },
        select: { sessionEpoch: true, isActive: true, role: true, totpEnabled: true },
      });
      if (!fresh || !fresh.isActive || fresh.sessionEpoch !== token.epoch) {
        return null;
      }

      token.role = fresh.role;
      token.totpEnabled = fresh.totpEnabled;
      if (fresh.role !== "ADMIN" || fresh.totpEnabled) {
        token.needsEnrollment = false;
      }

      const now = Math.floor(Date.now() / 1000);
      const absStart = token.absStart as number;
      if (now - absStart >= ABSOLUTE_SESSION_SECONDS) {
        return null;
      }
      if (now - (token.lastActivity as number) > 3600) {
        token.lastActivity = now;
      }
      token.exp = absStart + ABSOLUTE_SESSION_SECONDS;
      return token;
    },
    session: async ({ token, session }) => {
      session.user.id = token.sub as string;
      session.user.role = token.role as "ADMIN" | "EDITOR";
      session.user.totpEnabled = Boolean(token.totpEnabled);
      session.user.needsEnrollment = Boolean(token.needsEnrollment);
      return session;
    },
  },
});
