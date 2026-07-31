import { redirect } from "next/navigation";

/** Legacy URL — Meta Tag Checker includes SERP preview + live fetch. */
export default function SerpPreviewRedirectPage() {
  redirect("/tools/meta-tag-checker");
}
