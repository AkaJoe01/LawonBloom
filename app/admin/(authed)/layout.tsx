import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminNav from "./admin-nav";

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  if (session.user.needsEnrollment) {
    redirect("/admin/onboarding/2fa");
  }

  return (
    <div className="min-h-screen md:flex">
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-on-primary"
      >
        Skip to content
      </a>
      <AdminNav
        role={session.user.role}
        name={session.user.name ?? null}
        email={session.user.email ?? ""}
      />
      <main id="admin-content" className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
        {children}
      </main>
    </div>
  );
}
