"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function AccountForm({ email, role, initialName }: { email: string; role: string; initialName: string }) {
  const [name, setName] = useState(initialName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError(null);
    setSaved(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const body: Record<string, unknown> = {};
    if (name.trim() !== initialName) body.name = name.trim();
    if (newPassword) {
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }
    if (Object.keys(body).length === 0) {
      setSaved("Nothing to save.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; reauth?: boolean; error?: { message?: string; fieldErrors?: Record<string, string> } }
        | null;
      if (!res.ok || !data?.ok) {
        setError(
          data?.error?.fieldErrors?.currentPassword ??
            data?.error?.fieldErrors?.name ??
            data?.error?.message ??
            "Could not save your account. Please try again.",
        );
        return;
      }
      if (data.reauth) {
        await signOut({ redirectTo: "/admin/login" });
        return;
      }
      setSaved("Saved.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Could not save your account. Check your connection and retry.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-outline-variant bg-background px-3 py-2 text-sm text-foreground placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:text-on-surface-variant";
  const labelClass = "text-sm font-medium text-foreground";

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="max-w-lg space-y-5">
      {error && (
        <div role="alert" className="rounded-lg border border-error/50 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}
      {saved && (
        <div
          role="status"
          className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-foreground"
        >
          {saved}
        </div>
      )}

      <div>
        <label htmlFor="account-email" className={labelClass}>
          Email
        </label>
        <input id="account-email" value={email} disabled className={inputClass} />
        <p className="mt-1 text-xs text-on-surface-variant">Your sign-in email cannot be changed here.</p>
      </div>

      <div>
        <label htmlFor="account-role" className={labelClass}>
          Role
        </label>
        <input id="account-role" value={role === "ADMIN" ? "Admin" : "Editor"} disabled className={inputClass} />
      </div>

      <div>
        <label htmlFor="account-name" className={labelClass}>
          Name
        </label>
        <input
          id="account-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          minLength={2}
          maxLength={120}
          className={inputClass}
        />
      </div>

      <fieldset className="space-y-4 border-t border-outline-variant pt-5">
        <legend className="text-sm font-semibold text-foreground">Change password</legend>
        <div>
          <label htmlFor="account-current-password" className={labelClass}>
            Current password
          </label>
          <input
            id="account-current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="account-new-password" className={labelClass}>
            New password
          </label>
          <input
            id="account-new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            minLength={12}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-on-surface-variant">At least 12 characters.</p>
        </div>
        <div>
          <label htmlFor="account-confirm-password" className={labelClass}>
            Confirm new password
          </label>
          <input
            id="account-confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={12}
            className={inputClass}
          />
        </div>
        <p className="text-xs text-on-surface-variant">
          Changing your password signs you out of every session, including this one.
        </p>
      </fieldset>

      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
