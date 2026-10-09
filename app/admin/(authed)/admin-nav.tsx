"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  adminOnly?: boolean;
  exact?: boolean;
}

const ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/enquiries", label: "Enquiries", adminOnly: true },
  { href: "/admin/users", label: "Users", adminOnly: true },
  { href: "/admin/account", label: "Account" },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function AdminNav({
  role,
  name,
  email,
}: {
  role: "ADMIN" | "EDITOR";
  name: string | null;
  email: string;
}) {
  const pathname = usePathname();
  const items = ITEMS.filter((item) => !item.adminOnly || role === "ADMIN");

  return (
    <nav
      aria-label="Admin"
      className="flex flex-col border-b border-outline-variant bg-background md:min-h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r"
    >
      <div className="border-b border-outline-variant px-4 py-4 md:border-b-0 md:px-4 md:py-6">
        <p className="text-sm font-semibold tracking-tight text-foreground">
          Lawon Bloom <span className="text-primary">Admin</span>
        </p>
        <p className="mt-1 truncate text-xs text-on-surface-variant">
          {name ?? email}
          <span className="ml-1.5 rounded bg-surface-container-high px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
            {role === "ADMIN" ? "Admin" : "Editor"}
          </span>
        </p>
      </div>

      <ul className="flex gap-1 overflow-x-auto px-2 py-2 md:flex-col md:gap-0.5 md:overflow-visible md:px-2 md:py-0">
        {items.map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.label} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active
                    ? "bg-primary-container font-medium text-on-primary-fixed"
                    : "text-foreground hover:bg-surface-container-low hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
        <li key="signout" className="shrink-0 md:pt-4">
          <button
            type="button"
            onClick={() => void signOut({ redirectTo: "/" })}
            className="w-full whitespace-nowrap rounded-md px-3 py-2 text-left text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Sign out
          </button>
        </li>
      </ul>
    </nav>
  );
}
