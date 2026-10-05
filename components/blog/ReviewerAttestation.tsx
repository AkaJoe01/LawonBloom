function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ReviewerAttestation({
  name,
  credential,
  reviewedAt,
}: {
  name: string;
  credential: string | null;
  reviewedAt: Date | string | null;
}) {
  return (
    <p className="rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
      <span className="text-xs font-medium uppercase tracking-widest text-primary">
        Medically reviewed
      </span>
      <span className="mt-1 block text-foreground">
        <strong className="font-semibold">{name}</strong>
        {credential ? `, ${credential}` : ""}
        {reviewedAt ? <> · {formatDate(reviewedAt)}</> : null}
      </span>
      <span className="mt-1 block text-xs">
        This is an author attestation — not a licensure verification.
      </span>
    </p>
  );
}
