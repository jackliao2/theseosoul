import { submitSitemapToIndexNow } from "../src/lib/indexnow";

async function main() {
  const result = await submitSitemapToIndexNow();
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}

main();
