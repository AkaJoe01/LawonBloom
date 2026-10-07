import { REDACTED, redactDeep, redactString } from "./pii";

type Dict = Record<string, unknown>;

function scrubUrl(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    const url = new URL(value);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return redactString(value);
  }
}

export function scrubBreadcrumb(breadcrumb: Dict): Dict {
  const out: Dict = { ...breadcrumb };
  if (typeof out.message === "string") out.message = redactString(out.message);
  if (out.data && typeof out.data === "object") {
    const data: Dict = { ...(redactDeep(out.data) as Dict) };
    if (data.url !== undefined) data.url = scrubUrl(data.url);
    out.data = data;
  }
  return out;
}

export function scrubEvent<T extends Dict>(event: T): T {
  const out: Dict = { ...event };
  if (out.user && typeof out.user === "object") out.user = redactDeep(out.user);
  if (out.request && typeof out.request === "object") {
    const request: Dict = { ...(out.request as Dict) };
    if (request.headers && typeof request.headers === "object") request.headers = redactDeep(request.headers);
    if (request.cookies !== undefined) request.cookies = REDACTED;
    if (request.query_string !== undefined) request.query_string = REDACTED;
    if (request.url !== undefined) request.url = scrubUrl(request.url);
    out.request = request;
  }
  if (Array.isArray(out.breadcrumbs)) {
    out.breadcrumbs = out.breadcrumbs.map((entry) =>
      entry && typeof entry === "object" ? scrubBreadcrumb(entry as Dict) : entry,
    );
  }
  if (out.extra !== undefined) out.extra = redactDeep(out.extra);
  if (out.contexts !== undefined) out.contexts = redactDeep(out.contexts);
  if (out.tags !== undefined) out.tags = redactDeep(out.tags);
  if (typeof out.message === "string") out.message = redactString(out.message);
  if (typeof out.transaction === "string") out.transaction = scrubUrl(out.transaction);
  if (typeof out.culprit === "string") out.culprit = redactString(out.culprit);
  return out as T;
}
