"use client";

import { useState } from "react";
import { KeyRound, ShieldCheck, UserCheck, UserPlus, UserX } from "lucide-react";

export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR";
  isActive: boolean;
  totpEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

type Notice = { kind: "error"; text: string } | { kind: "password"; label: string; text: string } | null;

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

async function readError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
  return data?.error?.message ?? "Something went wrong. Please try again.";
}

export default function UsersPanel({ users: initial, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const [users, setUsers] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  async function changeRole(user: UserRow, role: "ADMIN" | "EDITOR") {
    if (user.role === role || busyId) return;
    setBusyId(user.id);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "set-role", role }),
      });
      if (!res.ok) {
        setNotice({ kind: "error", text: await readError(res) });
        return;
      }
      setUsers((prev) => prev.map((row) => (row.id === user.id ? { ...row, role } : row)));
    } catch {
      setNotice({ kind: "error", text: "Could not change the role. Check your connection and retry." });
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(user: UserRow) {
    const activating = !user.isActive;
    if (
      !activating &&
      !window.confirm(`Deactivate ${user.name}? Their sessions will end immediately.`)
    ) {
      return;
    }
    setBusyId(user.id);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: activating ? "activate" : "deactivate" }),
      });
      if (!res.ok) {
        setNotice({ kind: "error", text: await readError(res) });
        return;
      }
      setUsers((prev) => prev.map((row) => (row.id === user.id ? { ...row, isActive: activating } : row)));
    } catch {
      setNotice({ kind: "error", text: "Could not update the account. Check your connection and retry." });
    } finally {
      setBusyId(null);
    }
  }

  async function resetPassword(user: UserRow) {
    if (!window.confirm(`Reset the password for ${user.name}? They will be signed out everywhere.`)) {
      return;
    }
    setBusyId(user.id);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "reset-password" }),
      });
      const data = (await res.json().catch(() => null)) as
        | { displayOncePassword?: string; error?: { message?: string } }
        | null;
      if (!res.ok || !data?.displayOncePassword) {
        setNotice({ kind: "error", text: data?.error?.message ?? "Could not reset the password." });
        return;
      }
      setNotice({ kind: "password", label: `New password for ${user.email}`, text: data.displayOncePassword });
    } catch {
      setNotice({ kind: "error", text: "Could not reset the password. Check your connection and retry." });
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (creating) return;
    setCreating(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      const data = (await res.json().catch(() => null)) as
        | { id?: string; email?: string; name?: string; displayOncePassword?: string; error?: { message?: string } }
        | null;
      if (!res.ok || !data?.id || !data.displayOncePassword) {
        setNotice({ kind: "error", text: data?.error?.message ?? "Could not create the account." });
        return;
      }
      setUsers((prev) => [
        ...prev,
        {
          id: data.id!,
          email: data.email!,
          name: data.name ?? data.email!,
          role: "EDITOR",
          isActive: true,
          totpEnabled: false,
          lastLoginAt: null,
          createdAt: new Date().toISOString(),
        },
      ]);
      setNotice({ kind: "password", label: `One-time password for ${data.email}`, text: data.displayOncePassword });
      setEmail("");
      setName("");
    } catch {
      setNotice({ kind: "error", text: "Could not create the account. Check your connection and retry." });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Users</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {users.length} {users.length === 1 ? "account" : "accounts"}
          </p>
        </div>
      </header>

      {notice?.kind === "error" && (
        <div role="alert" className="rounded-lg border border-error/50 bg-error/10 px-4 py-3 text-sm text-error">
          {notice.text}
        </div>
      )}
      {notice?.kind === "password" && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-foreground"
        >
          <span className="font-medium">{notice.label}</span>
          <code className="rounded bg-background px-2 py-1 font-mono text-xs select-all">{notice.text}</code>
          <span className="text-xs text-on-surface-variant">Copy it now — it is shown only once.</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="ml-auto rounded-md px-2 py-1 text-xs text-on-surface-variant hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Dismiss
          </button>
        </div>
      )}

      <form
        onSubmit={(event) => void handleCreate(event)}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-outline-variant bg-background p-4"
      >
        <div className="min-w-40 flex-1">
          <label htmlFor="user-name" className="text-sm font-medium text-foreground">
            Name
          </label>
          <input
            id="user-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={2}
            maxLength={120}
            placeholder="Editor name"
            className="mt-1 w-full rounded-md border border-outline-variant bg-background px-3 py-2 text-sm text-foreground placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <div className="min-w-52 flex-1">
          <label htmlFor="user-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="user-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="editor@clinic.com"
            className="mt-1 w-full rounded-md border border-outline-variant bg-background px-3 py-2 text-sm text-foreground placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserPlus aria-hidden size={16} />
          {creating ? "Creating…" : "Create editor"}
        </button>
      </form>

      <ul className="space-y-3">
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          const busy = busyId === user.id;
          return (
            <li
              key={user.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-outline-variant bg-background p-4"
            >
              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate text-sm font-medium text-foreground">
                  {user.name}
                  {isSelf && <span className="ml-2 text-xs font-normal text-on-surface-variant">(you)</span>}
                </p>
                <p className="truncate text-xs text-on-surface-variant">{user.email}</p>
              </div>
              <span
                className={
                  user.role === "ADMIN"
                    ? "rounded-full bg-primary-fixed px-2.5 py-0.5 text-xs font-medium text-on-primary-fixed-variant"
                    : "rounded-full bg-surface-container-high px-2.5 py-0.5 text-xs font-medium text-on-surface-variant"
                }
              >
                {user.role}
              </span>
              <span
                className={
                  user.isActive
                    ? "text-xs text-on-surface-variant"
                    : "text-xs font-medium text-error"
                }
              >
                {user.isActive ? "Active" : "Inactive"}
              </span>
              <span className="text-xs text-on-surface-variant">
                Last sign-in {formatDate(user.lastLoginAt)}
              </span>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor={`role-${user.id}`}>
                  Role for {user.name}
                </label>
                <select
                  id={`role-${user.id}`}
                  value={user.role}
                  disabled={isSelf || busy}
                  onChange={(event) => void changeRole(user, event.target.value as "ADMIN" | "EDITOR")}
                  title={isSelf ? "You cannot change your own role." : undefined}
                  className="rounded-md border border-outline-variant bg-background px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="EDITOR">Editor</option>
                </select>
                <button
                  type="button"
                  onClick={() => void resetPassword(user)}
                  disabled={busy}
                  title="Reset password"
                  className="inline-flex items-center gap-1.5 rounded-md border border-outline-variant px-2.5 py-1.5 text-sm text-foreground hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <KeyRound aria-hidden size={14} />
                  Reset password
                </button>
                <button
                  type="button"
                  onClick={() => void toggleActive(user)}
                  disabled={isSelf || busy}
                  title={isSelf ? "You cannot deactivate your own account." : undefined}
                  className="inline-flex items-center gap-1.5 rounded-md border border-outline-variant px-2.5 py-1.5 text-sm text-foreground hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {user.isActive ? (
                    <>
                      <UserX aria-hidden size={14} />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck aria-hidden size={14} />
                      Activate
                    </>
                  )}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="flex items-center gap-2 text-xs text-on-surface-variant">
        <ShieldCheck aria-hidden size={14} />
        Role and password changes sign the person out of every session immediately.
      </p>
    </div>
  );
}
