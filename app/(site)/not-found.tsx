import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-primary">404</p>
      <h1 className="mt-6 font-serif text-4xl leading-tight tracking-[-0.03em] text-foreground md:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
        The page you were looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/blog"
          className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Browse the journal
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full border border-outline-variant px-6 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
