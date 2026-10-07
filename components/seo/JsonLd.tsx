import { headers } from "next/headers";
import { serializeJsonLd, type JsonLd } from "@/lib/seo";

export default async function JsonLd({ data }: { data: JsonLd }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
