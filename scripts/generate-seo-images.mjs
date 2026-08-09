/**
 * One-off: Ark Seedream → download → WebP → public/images/
 * Requires: ARK_API_KEY, ARK_IMAGE_ENDPOINT (ep-...)
 * Never commit keys.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "images");

const API_KEY = process.env.ARK_API_KEY;
const MODEL = process.env.ARK_IMAGE_ENDPOINT;
const API_URL =
  process.env.ARK_IMAGE_URL ||
  "https://ark.cn-beijing.volces.com/api/v3/images/generations";

if (!API_KEY || !MODEL) {
  console.error("Set ARK_API_KEY and ARK_IMAGE_ENDPOINT");
  process.exit(1);
}

const STYLE =
  "Editorial technical illustration for an SEO SaaS brand. Palette: deep slate, teal accents, soft off-white background. Flat geometric diagram style, clean vector-like shapes, subtle grain. No people faces, no readable text, no letters, no logos, no watermarks, no UI screenshots with words.";

/** @type {{ file: string; alt: string; prompt: string }[]} */
const JOBS = [
  {
    file: "blog/robots-txt-checker.webp",
    alt: "Abstract diagram of a robots.txt path test with allow and disallow routes",
    prompt: `${STYLE} Concept: robots.txt crawl rules. Abstract branching paths — one open teal path, one blocked slate barrier. Minimal technical poster, 16:9.`,
  },
  {
    file: "blog/accidental-noindex.webp",
    alt: "Illustration of a noindex warning sign blocking a webpage from search results",
    prompt: `${STYLE} Concept: accidental noindex. A simple document/page icon with a subtle stop/block badge, search rays deflected. Minimal technical poster, 16:9.`,
  },
  {
    file: "blog/meta-tag-checker.webp",
    alt: "Illustration of a search result snippet card with title and description lines",
    prompt: `${STYLE} Concept: meta titles and descriptions. Abstract SERP-like card silhouette with blank lines (no real text), teal accent bar. Minimal technical poster, 16:9.`,
  },
  {
    file: "blog/robots-vs-noindex.webp",
    alt: "Three-way diagram contrasting crawl, index, and canonical signals",
    prompt: `${STYLE} Concept: three distinct control signals — fetch gate, index gate, duplicate merge — as three abstract icons in a row. Minimal technical poster, 16:9.`,
  },
  {
    file: "blog/launch-checklist.webp",
    alt: "Illustration of a pre-launch technical checklist with HTTPS and crawl checks",
    prompt: `${STYLE} Concept: pre-launch technical checklist. Clipboard/checklist shapes with shield and lock motifs, teal checks. Minimal technical poster, 16:9.`,
  },
  {
    file: "blog/xml-sitemaps.webp",
    alt: "Illustration of an XML sitemap tree linking to page nodes",
    prompt: `${STYLE} Concept: XML sitemap as a clean tree/network of nodes connected to a root map file. Minimal technical poster, 16:9.`,
  },
  {
    file: "blog/ssl-security-headers.webp",
    alt: "Illustration of a TLS padlock and layered security header shields",
    prompt: `${STYLE} Concept: HTTPS lock plus layered shield panels suggesting security headers. Minimal technical poster, 16:9.`,
  },
  {
    file: "blog/domain-history.webp",
    alt: "Illustration of a domain timeline with archive chapters along a horizontal axis",
    prompt: `${STYLE} Concept: domain history timeline — horizontal axis with chapter blocks fading from old to new. Minimal technical poster, 16:9.`,
  },
  {
    file: "blog/geo-llms-txt.webp",
    alt: "Illustration of AI crawlers reading a structured site summary file",
    prompt: `${STYLE} Concept: GEO / llms.txt — abstract document feeding stylized bot nodes (geometric, not characters). Minimal technical poster, 16:9.`,
  },
  {
    file: "blog/adsense-readiness.webp",
    alt: "Illustration of site trust pages and content readiness for ad approval",
    prompt: `${STYLE} Concept: AdSense readiness — website house icon with trust/document tiles arranged neatly. Minimal technical poster, 16:9.`,
  },
  {
    file: "site/tools-hub.webp",
    alt: "Abstract toolkit illustration representing free SEO checker tools",
    prompt: `${STYLE} Concept: free SEO tools hub — arranged geometric tool tiles (wrench, gauge, map) without text. Minimal technical poster, 16:9.`,
  },
  {
    file: "site/guides-hub.webp",
    alt: "Abstract illustration of technical SEO guides and documentation",
    prompt: `${STYLE} Concept: SEO guides library — stacked document sheets and a soft teal bookmark ribbon, no text. Minimal technical poster, 16:9.`,
  },
];

async function generateOne(job) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: job.prompt,
      size: "2560x1440",
      response_format: "url",
      watermark: false,
      sequential_image_generation: "disabled",
      stream: false,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `${job.file}: HTTP ${res.status} ${JSON.stringify(body).slice(0, 400)}`
    );
  }

  const url = body?.data?.[0]?.url || body?.data?.[0]?.b64_json;
  if (!url) {
    throw new Error(`${job.file}: no image in response ${JSON.stringify(body).slice(0, 400)}`);
  }

  let buffer;
  if (String(url).startsWith("data:") || body.data[0].b64_json) {
    const b64 = body.data[0].b64_json || String(url).split(",")[1];
    buffer = Buffer.from(b64, "base64");
  } else {
    const imgRes = await fetch(url);
    if (!imgRes.ok) throw new Error(`${job.file}: download failed ${imgRes.status}`);
    buffer = Buffer.from(await imgRes.arrayBuffer());
  }

  const outPath = path.join(OUT_DIR, job.file);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(buffer)
    .resize(1600, 900, { fit: "cover" })
    .webp({ quality: 82 })
    .toFile(outPath);

  console.log("OK", job.file, `| alt: ${job.alt}`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const job of JOBS) {
    const outPath = path.join(OUT_DIR, job.file);
    if (fs.existsSync(outPath) && process.env.FORCE !== "1") {
      console.log("SKIP exists", job.file);
      continue;
    }
    try {
      await generateOne(job);
    } catch (err) {
      console.error("FAIL", err.message || err);
    }
    // gentle pacing for free tier
    await new Promise((r) => setTimeout(r, 1200));
  }
}

main();
