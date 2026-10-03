export const SITE_ROUTES = [
  "/",
  "/about",
  "/clinical-excellence",
  "/clinical-excellence/fertility-preservation",
  "/clinical-excellence/genetic-testing",
  "/clinical-excellence/holistic-support",
  "/clinical-excellence/iui",
  "/clinical-excellence/ivf",
  "/clinical-excellence/journal",
  "/concierge",
  "/concierge/contact",
  "/faq",
  "/journey",
  "/journey/consultation",
  "/journey/stories",
  "/legal/ethics",
  "/legal/privacy",
  "/legal/terms",
  "/path",
  "/sanctuary",
  "/sanctuary/services",
  "/sanctuary/services/surrogacy",
  "/sanctuary/team",
  "/admin",
  "/admin/login",
  "/admin/onboarding/2fa",
  "/admin/posts",
  "/admin/posts/new",
  "/admin/posts/[id]",
  "/admin/preview/[id]",
] as const;

export type SiteRoute = (typeof SITE_ROUTES)[number];

export function filePathToRoute(filePath: string): string {
  const normalized = filePath.replaceAll("\\", "/");
  const withoutApp = normalized.replace(/^(\.\/)?app\//, "");
  const withoutPage = withoutApp.replace(/\/?page\.tsx?$/, "");
  const segments = withoutPage
    .split("/")
    .filter((segment) => segment.length > 0 && !/^\(.*\)$/.test(segment));
  return "/" + segments.join("/");
}

export function findRouteDrift(
  routes: readonly string[],
  appFiles: readonly string[],
): { declaredNotInApp: string[]; appNotDeclared: string[] } {
  const fromFiles = new Set(appFiles.map((file) => filePathToRoute(file)));
  const declared = new Set(routes);
  return {
    declaredNotInApp: routes.filter((route) => !fromFiles.has(route)),
    appNotDeclared: [...fromFiles].filter((route) => !declared.has(route)),
  };
}
