export default function MedicalDisclaimer({ text }: { text: string }) {
  return (
    <aside
      aria-label="Medical disclaimer"
      className="rounded-xl border-l-4 border-primary bg-primary-fixed/30 px-5 py-4"
    >
      <p className="text-xs font-medium uppercase tracking-widest text-primary">
        Medical disclaimer
      </p>
      <p className="mt-2 text-sm leading-relaxed text-foreground">{text}</p>
    </aside>
  );
}
