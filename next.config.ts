import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["cheerio"],
  async redirects() {
    return [
      {
        source: "/tools/serp-preview",
        destination: "/tools/meta-tag-checker",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
