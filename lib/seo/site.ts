export const APEX = "https://lawonbloomfertilitycentre.com";
export const ORG_NAME = "Lawon Bloom Fertility Centre";
export const ORG_ID = `${APEX}/#organization`;
export const ORG_LOGO_URL = `${APEX}/logo/logo.png`;
export const OG_IMAGE_PATH = "/og-fallback.png";
export const OG_FALLBACK_URL = `${APEX}${OG_IMAGE_PATH}`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const SITE_NAME = "Lawon Bloom Fertility Centre Journal";
export const RSS_URL = `${APEX}/blog/rss.xml`;
export const WEBSITE_ID = `${APEX}/#website`;
export const CLINIC_ID = `${APEX}/#clinic`;
export const PHONE = "+2349132504126";
export const EMAIL = "lawonbloomfertilitycentre@gmail.com";
export const ADDRESS = {
  street: "No. 6, Canon Odusanwo Street, off Deji Oyelese Street, Old Bodija Avenue",
  locality: "Ibadan",
  region: "Oyo",
  country: "NG",
} as const;

export const TITLE_SUFFIX = ` | ${ORG_NAME}`;
export const TITLE_TEMPLATE = `%s${TITLE_SUFFIX}`;
export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 160;
export const DEFAULT_TITLE = "Lawon Bloom Fertility Centre | IVF Clinic in Ibadan";
export const DEFAULT_DESCRIPTION =
  "Lawon Bloom Fertility Centre offers IVF, IUI, egg freezing, and fertility testing in Ibadan. Personalized care with advanced technology. Book a consultation.";

export const SITE = {
  name: ORG_NAME,
  url: APEX,
  logo: ORG_LOGO_URL,
  ogImage: OG_IMAGE_PATH,
  phone: PHONE,
  email: EMAIL,
  address: ADDRESS,
  titleTemplate: TITLE_TEMPLATE,
  defaultTitle: DEFAULT_TITLE,
  defaultDescription: DEFAULT_DESCRIPTION,
} as const;

export function apexUrl(path: string): string {
  if (path === "/" || path === "") return APEX;
  return `${APEX}${path.startsWith("/") ? path : `/${path}`}`;
}

export function postUrl(slug: string): string {
  return apexUrl(`/blog/${slug}`);
}

export function postOgImageUrl(slug: string): string {
  return apexUrl(`/blog/${slug}/opengraph-image`);
}
