import type { Metadata } from "next";

import { SITE_NAME } from "@/lib/audit/types";

type SocialImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

type SocialMetadataInput = {
  title: string;
  description: string;
  url: string;
  image?: SocialImage;
};

const DEFAULT_SOCIAL_IMAGE: SocialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "TheSeoSoul — Free technical SEO audit and practical SEO tools",
};
const DEFAULT_TWITTER_IMAGE = "/twitter-image";

/**
 * Return complete page-level social metadata. Next.js shallow-merges nested
 * metadata, so a page that declares only an Open Graph title would otherwise
 * lose the root image/site fields and inherit an unrelated Twitter title.
 */
export function createSocialMetadata({
  title,
  description,
  url,
  image,
}: SocialMetadataInput): Pick<Metadata, "openGraph" | "twitter"> {
  const resolvedImage = image ?? DEFAULT_SOCIAL_IMAGE;

  return {
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [resolvedImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image?.url ?? DEFAULT_TWITTER_IMAGE],
    },
  };
}
