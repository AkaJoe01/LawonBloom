import { writeFileSync } from "node:fs";
import path from "node:path";
import { buildOgImage } from "../lib/og";

async function main(): Promise<void> {
  const response = buildOgImage({
    title: "Fertility guidance, written by the people who practise it",
    category: "Journal",
    logo: null,
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  const outPath = path.join(process.cwd(), "public", "og-fallback.png");
  writeFileSync(outPath, buffer);
  console.log(`wrote ${outPath} (${buffer.length} bytes)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
