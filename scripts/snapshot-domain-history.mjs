import { writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { register } from "node:module";

register("./test/tsconfig-paths-loader.mjs", pathToFileURL("./"));

const { checkDomainHistory } = await import(
  "../src/lib/tools/check-domain-history.ts"
);

const result = await checkDomainHistory("theseosoul.com");
const out = path.join("src", "lib", "tools", "theseosoul-history-fallback.json");
await writeFile(out, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(
  JSON.stringify(
    {
      out,
      verdict: result.verdict.id,
      chapters: result.stats.chapterCount,
      months: result.stats.activeMonths,
      first: result.stats.firstLabel,
      last: result.stats.lastLabel,
    },
    null,
    2
  )
);
