"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "partial" | "failure";

const PHONE_HREF = "tel:+2349132504126";
const HIDDEN_FIELDS = new Set(["startedAt", "website"]);

const inputClass =
  "mt-1 w-full rounded-md border border-outline-variant bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const labelClass = "text-sm font-medium text-foreground";

function validate(values: {
  name: string;
  email: string;
  message: string;
  consent: boolean;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.name.trim().length < 2) errors.name = "Enter your name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter a valid email address";
  if (values.message.trim().length < 10) errors.message = "Tell us a little more (10+ characters)";
  if (!values.consent) errors.consent = "Consent is required";
  return errors;
}

export default function EnquiryForm({
  variant,
  postSlug,
}: {
  variant: "compact" | "inline";
  postSlug?: string;
}) {
  const startedAtRef = useRef(0);
  const websiteRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [banner, setBanner] = useState<{ kind: "alert" | "status"; text: string } | null>(null);

  const headingId = `enquiry-${variant}-heading`;
  const compact = variant === "compact";

  async function submit() {
    if (status === "submitting") return;

    setBanner(null);
    const errors = validate({ name, email, message, consent });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/blog-enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          message: message.trim(),
          postSlug: postSlug ?? null,
          consent: true,
          website: websiteRef.current?.value ?? "",
          startedAt: startedAtRef.current,
        }),
      });

      if (res.status === 201) {
        const data = (await res.json().catch(() => null)) as { mailFailed?: boolean } | null;
        if (data?.mailFailed) {
          setStatus("partial");
          setBanner({
            kind: "status",
            text: "We've received your enquiry and we'll follow up personally. Prefer to talk now?",
          });
        } else {
          setStatus("success");
          setBanner({
            kind: "status",
            text: "We've received your enquiry. Our team will review it and get back to you.",
          });
        }
        return;
      }

      if (res.status === 429) {
        const data = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        setStatus("failure");
        setBanner({
          kind: "alert",
          text: data?.error?.message ?? "Too many enquiries right now. Please try again later.",
        });
        return;
      }

      if (res.status === 400) {
        const data = (await res.json().catch(() => null)) as
          | { error?: { fieldErrors?: Record<string, string>; message?: string } }
          | null;
        const serverErrors = data?.error?.fieldErrors ?? {};
        const visible: Record<string, string> = {};
        let hiddenOnly = true;
        for (const [key, value] of Object.entries(serverErrors)) {
          if (HIDDEN_FIELDS.has(key)) continue;
          visible[key] = value;
          hiddenOnly = false;
        }
        setFieldErrors(visible);
        setStatus("failure");
        if (hiddenOnly) {
          setBanner({
            kind: "alert",
            text: "That was submitted a little too quickly. Please try again in a moment.",
          });
        } else {
          setBanner({ kind: "alert", text: data?.error?.message ?? "Please correct the highlighted fields." });
        }
        return;
      }

      setStatus("failure");
      setBanner({
        kind: "alert",
        text: "Something went wrong sending your enquiry. Please try again, or call us directly.",
      });
    } catch {
      setStatus("failure");
      setBanner({
        kind: "alert",
        text: "We couldn't reach the server. Check your connection and try again, or call us directly.",
      });
    }
  }

  const submitting = status === "submitting";
  const done = status === "success" || status === "partial";

  return (
    <section
      aria-labelledby={headingId}
      className={`rounded-2xl border border-outline-variant bg-surface-container-low p-6 md:p-8 ${
        compact ? "" : "mt-10"
      }`}
    >
      <h2 id={headingId} className="font-serif text-2xl text-foreground md:text-3xl">
        {compact ? "Ask us anything" : "Questions about this article?"}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
        {compact
          ? "Send a note to the clinic — we read every message."
          : "Send your question about this topic. Our team reads every message and replies as soon as we can."}
      </p>

      {banner ? (
        <div className="mt-4 space-y-2">
          <p
            role={banner.kind === "alert" ? "alert" : "status"}
            className={`rounded-lg px-4 py-3 text-sm ${
              banner.kind === "alert"
                ? "border border-error/40 bg-error-container/30 text-on-error-container"
                : "border border-primary/40 bg-primary-fixed/40 text-foreground"
            }`}
          >
            {banner.text}
            {status === "partial" ? (
              <>
                {" "}
                <a href={PHONE_HREF} className="font-medium underline underline-offset-2">
                  Call +234 913 250 4126
                </a>
                .
              </>
            ) : null}
          </p>
          {status === "failure" ? (
            <button
              type="button"
              onClick={() => void submit()}
              className="text-sm font-medium text-primary underline underline-offset-2"
            >
              Try again
            </button>
          ) : null}
        </div>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="mt-6 space-y-4"
        noValidate
      >
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={`enquiry-website-${variant}`}>Leave this field empty</label>
          <input
            id={`enquiry-website-${variant}`}
            ref={websiteRef}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        <div className={`grid gap-4 ${compact ? "sm:grid-cols-2" : ""}`}>
          <div>
            <label htmlFor={`enquiry-name-${variant}`} className={labelClass}>
              Name
            </label>
            <input
              id={`enquiry-name-${variant}`}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setFieldErrors((previous) => {
                  if (!previous.name) return previous;
                  const next = { ...previous };
                  delete next.name;
                  return next;
                });
              }}
              maxLength={120}
              autoComplete="name"
              required
              aria-invalid={fieldErrors.name ? true : undefined}
              aria-describedby={fieldErrors.name ? `enquiry-name-${variant}-error` : undefined}
              className={inputClass}
            />
            {fieldErrors.name ? (
              <p id={`enquiry-name-${variant}-error`} role="alert" className="mt-1 text-xs text-error">
                {fieldErrors.name}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor={`enquiry-email-${variant}`} className={labelClass}>
              Email
            </label>
            <input
              id={`enquiry-email-${variant}`}
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldErrors((previous) => {
                  if (!previous.email) return previous;
                  const next = { ...previous };
                  delete next.email;
                  return next;
                });
              }}
              maxLength={254}
              autoComplete="email"
              required
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={fieldErrors.email ? `enquiry-email-${variant}-error` : undefined}
              className={inputClass}
            />
            {fieldErrors.email ? (
              <p id={`enquiry-email-${variant}-error`} role="alert" className="mt-1 text-xs text-error">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor={`enquiry-phone-${variant}`} className={labelClass}>
            Phone <span className="font-normal text-on-surface-variant">(optional)</span>
          </label>
          <input
            id={`enquiry-phone-${variant}`}
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            maxLength={20}
            autoComplete="tel"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`enquiry-message-${variant}`} className={labelClass}>
            Message
          </label>
          <textarea
            id={`enquiry-message-${variant}`}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setFieldErrors((previous) => {
                if (!previous.message) return previous;
                const next = { ...previous };
                delete next.message;
                return next;
              });
            }}
            rows={compact ? 3 : 5}
            maxLength={3000}
            required
            aria-invalid={fieldErrors.message ? true : undefined}
            aria-describedby={fieldErrors.message ? `enquiry-message-${variant}-error` : undefined}
            className={inputClass}
          />
          <div className="mt-1 flex items-start justify-between gap-3">
            <span>
              {fieldErrors.message ? (
                <span
                  id={`enquiry-message-${variant}-error`}
                  role="alert"
                  className="block text-xs text-error"
                >
                  {fieldErrors.message}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 text-xs text-on-surface-variant">{message.length}/3000</span>
          </div>
        </div>

        <div>
          <label className="flex items-start gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked);
                setFieldErrors((previous) => {
                  if (!previous.consent) return previous;
                  const next = { ...previous };
                  delete next.consent;
                  return next;
                });
              }}
              aria-invalid={fieldErrors.consent ? true : undefined}
              aria-describedby={fieldErrors.consent ? `enquiry-consent-${variant}-error` : undefined}
              className="mt-0.5 size-4 accent-primary"
            />
            <span>
              I consent to Lawon Bloom contacting me about this enquiry, as described in the{" "}
              <a
                href="/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                privacy policy
              </a>
              .
            </span>
          </label>
          {fieldErrors.consent ? (
            <p
              id={`enquiry-consent-${variant}-error`}
              role="alert"
              className="mt-1 text-xs text-error"
            >
              {fieldErrors.consent}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting || done}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {submitting ? (
            <>
              <svg aria-hidden="true" className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
              Sending…
            </>
          ) : (
            <>
              <Send size={15} aria-hidden="true" />
              Send enquiry
            </>
          )}
        </button>
      </form>
    </section>
  );
}
