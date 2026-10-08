"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// 2FA-DISABLED: second-factor sign-in step — re-enable with the markers below.
// type Step = "credentials" | "code";

const inputClass =
  "mt-1 w-full rounded-md border border-outline-variant bg-background px-3 py-2 text-sm text-foreground placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export default function LoginForm() {
  const router = useRouter();
  // 2FA-DISABLED: const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // 2FA-DISABLED: const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        // 2FA-DISABLED: ...(step === "code" ? { totp: code.replace(/\s/g, "") } : {}),
        redirect: false,
        redirectTo: "/admin",
      });
      if (res?.ok && !res.error) {
        router.push("/admin");
        router.refresh();
        return;
      }
      // 2FA-DISABLED: server never returns "two_factor" while authorize.ts is commented.
      // if (res?.code === "two_factor") {
      //   setStep("code");
      //   return;
      // }
      if (res?.code === "locked") {
        setError("Account temporarily locked. Try again in 10 minutes.");
        return;
      }
      // 2FA-DISABLED: if (step === "code") {
      //   setError("That code is not valid. Try again, or use a 10-character backup code.");
      //   return;
      // }
      setError("Invalid email or password.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
      {error ? (
        <p role="alert" className="rounded-md border border-error/40 bg-error-container/30 px-3 py-2 text-sm text-on-error-container">
          {error}
        </p>
      ) : null}

      <div>
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
          aria-invalid={error !== null ? true : undefined}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          aria-invalid={error !== null ? true : undefined}
          className={inputClass}
        />
      </div>

      {/* 2FA-DISABLED: authenticator/backup-code input step.
      {step === "code" ? (
        <div>
          <label htmlFor="totp" className="text-sm font-medium text-foreground">
            Authenticator or backup code
          </label>
          <input
            id="totp"
            name="totp"
            type="text"
            inputMode="text"
            autoComplete="one-time-code"
            autoFocus
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={busy}
            aria-invalid={error !== null ? true : undefined}
            aria-describedby="totp-hint"
            placeholder="123456 or ABCD2345EF"
            className={inputClass}
          />
          <p id="totp-hint" className="mt-1 text-xs text-on-surface-variant">
            Enter the 6-digit code from your authenticator app, or one of your saved backup codes.
          </p>
        </div>
      ) : null}
      */}

      <Button type="submit" disabled={busy || !email || !password} className="w-full">
        {busy ? "Signing in…" : "Sign in"}
      </Button>

      {/* 2FA-DISABLED: back link for the code step.
      {step === "code" ? (
        <button
          type="button"
          onClick={() => {
            setStep("credentials");
            setCode("");
            setError(null);
          }}
          className="w-full text-center text-sm text-on-surface-variant underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          disabled={busy}
        >
          Back to email and password
        </button>
      ) : null}
      */}
    </form>
  );
}
