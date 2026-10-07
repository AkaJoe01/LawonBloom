import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Dashboard" };

const statusStyles: Record<string, string> = {
  DRAFT: "bg-surface-container-high text-on-surface-variant",
  PUBLISHED: "bg-primary-fixed text-on-primary-fixed-variant",
};

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const isAdmin = session.user.role === "ADMIN";

  const db = getDb();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [drafts, published, enquiriesThisMonth, recentPosts, recentEnquiries] = await Promise.all([
    db.post.count({ where: { status: "DRAFT" } }),
    db.post.count({ where: { status: "PUBLISHED" } }),
    isAdmin ? db.enquiry.count({ where: { createdAt: { gte: monthStart } } }) : Promise.resolve(null),
    db.post.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        category: { select: { name: true } },
      },
    }),
    isAdmin
      ? db.enquiry.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, name: true, message: true, createdAt: true },
        })
      : Promise.resolve([]),
  ]);

  const stats = [
    { label: "Drafts", value: drafts },
    { label: "Published", value: published },
    ...(enquiriesThisMonth !== null
      ? [{ label: "Enquiries this month", value: enquiriesThisMonth }]
      : []),
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Welcome back, {session.user.name ?? session.user.email}.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          New post
        </Link>
      </header>

      <ul className="grid gap-4 sm:grid-cols-3" aria-label="Publishing stats">
        {stats.map((stat) => (
          <li key={stat.label} className="rounded-xl border border-outline-variant bg-background p-5">
            <p className="text-sm text-on-surface-variant">{stat.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-foreground">{stat.value}</p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="recent-posts">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recent-posts" className="text-base font-semibold text-foreground">
            Recent posts
          </h2>
          <Link href="/admin/posts" className="text-sm text-primary underline-offset-4 hover:underline">
            All posts
          </Link>
        </div>
        {recentPosts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-outline-variant bg-background p-6 text-sm text-on-surface-variant">
            No posts yet. Create your first draft to get started.
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant rounded-xl border border-outline-variant bg-background">
            {recentPosts.map((post) => (
              <li key={post.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="block truncate text-sm font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {post.title}
                  </Link>
                  <p className="truncate text-xs text-on-surface-variant">
                    {post.category.name} · updated{" "}
                    <time dateTime={post.updatedAt.toISOString()}>
                      {post.updatedAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[post.status] ?? ""}`}
                >
                  {post.status === "PUBLISHED" ? "Published" : "Draft"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isAdmin ? (
        <section aria-labelledby="recent-enquiries">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="recent-enquiries" className="text-base font-semibold text-foreground">
              Recent enquiries
            </h2>
            <span className="text-xs text-on-surface-variant">Admin only</span>
          </div>
          {recentEnquiries.length === 0 ? (
            <p className="rounded-xl border border-dashed border-outline-variant bg-background p-6 text-sm text-on-surface-variant">
              No enquiries received this month.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant rounded-xl border border-outline-variant bg-background">
              {recentEnquiries.map((enquiry) => (
                <li key={enquiry.id} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{enquiry.name}</p>
                    <time
                      dateTime={enquiry.createdAt.toISOString()}
                      className="shrink-0 text-xs text-on-surface-variant"
                    >
                      {enquiry.createdAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </time>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-on-surface-variant">{enquiry.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
