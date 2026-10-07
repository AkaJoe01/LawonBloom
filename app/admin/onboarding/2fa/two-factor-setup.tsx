"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Phase = "loading" | "qr" | "code" | "backups" | "error";

const inputClass =
  "mt-1 w-full rounded-md border border-outline-variant bg-background px-3 py-2 text-sm text-foreground placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export default function TwoFactorSetup({ email }: { email: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string>("");
  const [showSecret, setShowSecret] = useState(false);
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fetched = useRef(false);

  const setup = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/totp/setup", { method: "POST" });
      if (res.status === 403) {
        router.replace("/admin");
        return;
      }
      if (!res.ok) {
        setPhase("error");
        setError("Could not start setup. Refresh to try again.");
        return;
      }
      const data = (await res.json()) as { qrDataUrl: string; secretBase32: string };
      setQrDataUrl(data.qrDataUrl);
      setSecret(data.secretBase32);
      setPhase("qr");
    } catch {
      setPhase("error");
      setError("Could not reach the server. Check your connection and retry.");
    }
  }, [router]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    void setup();
  }, [setup]);

  async function verify(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/totp/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: code.replace(/\s/g, "") }),
      });
      const payload = (await res.json().catch(() => null)) as
        | { ok?: boolean; backupCodes?: string[]; error?: { message?: string } }
        | null;
      if (res.ok && payload?.ok && Array.isArray(payload.backupCodes)) {
        setBackupCodes(payload.backupCodes);
        setPhase("backups");
        return;
      }
      if (res.status === 403) {
        router.replace("/admin");
        return;
      }
      setError(payload?.error?.message ?? "That code is not valid. Try the next code from your app.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (phase === "loading") {
    return <p className="mt-6 text-sm text-on-surface-variant">Preparing your QR code…</p>;
  }

  if (phase === "error") {
    return (
      <div className="mt-6 space-y-4">
        <p role="alert" className="rounded-md border border-error/40 bg-error-container/30 px-3 py-2 text-sm text-on-error-container">
          {error}
        </p>
        <Button type="button" onClick={() => { setPhase("loading"); void setup(); }} variant="outline">
          Retry setup
        </Button>
      </div>
    );
  }

  if (phase === "backups") {
    return (
      <div className="mt-6 space-y-4">
        <div role="dialog" aria-label="Save your backup codes" className="rounded-lg border border-primary/40 bg-primary-fixed/30 p-4">
          <h2 className="text-base font-semibold text-foreground">Save your backup codes</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Each code works once if you lose your authenticator. They are shown only now — store them somewhere safe.
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm text-foreground" data-testid="backup-codes">
            {backupCodes.map((c) => (
              <li key={c} className="rounded border border-outline-variant bg-background px-2 py-1">
                {c}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={copyAll}>
              {copied ? "Copied" : "Copy all codes"}
            </Button>
          </div>
          <label className="mt-4 flex items-start gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
            />
            I have saved these backup codes somewhere safe.
          </label>
        </div>
        <Button
          type="button"
          disabled={!acknowledged}
          onClick={() => {
            router.push("/admin");
            router.refresh();
          }}
          className="w-full"
        >
          Continue to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- QR data URL is generated server-side; next/image does not optimize data URLs
          <img
            src={qrDataUrl}
            alt={`QR code for ${email} — scan with your authenticator app`}
            width={168}
            height={168}
            className="h-42 w-42 rounded-lg border border-outline-variant bg-white p-2"
          />
        ) : null}
        <div className="min-w-0 flex-1 text-sm text-on-surface-variant">
          <p>
            Can&apos;t scan? Enter this secret manually in your authenticator app&apos;s “enter setup key” option.
          </p>
          <button
            type="button"
            onClick={() => setShowSecret((v) => !v)}
            className="mt-2 text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-expanded={showSecret}
          >
            {showSecret ? "Hide secret" : "Show secret"}
          </button>
          {showSecret ? (
            <p className="mt-1 break-all font-mono text-sm text-foreground" data-testid="totp-secret">
              {secret}
            </p>
          ) : null}
        </div>
      </div>

      <form onSubmit={verify} className="space-y-4" noValidate>
        {error ? (
          <p role="alert" className="rounded-md border border-error/40 bg-error-container/30 px-3 py-2 text-sm text-on-error-container">
            {error}
          </p>
        ) : null}
        <div>
          <label htmlFor="code" className="text-sm font-medium text-foreground">
            6-digit code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={7}
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={busy}
            aria-invalid={error !== null ? true : undefined}
            placeholder="123456"
            className={inputClass}
          />
        </div>
        <Button type="submit" disabled={busy || code.replace(/\s/g, "").length !== 6} className="w-full">
          {busy ? "Verifying…" : "Verify and activate"}
        </Button>
      </form>
    </div>
  );
}
