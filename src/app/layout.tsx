import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist_Mono, Source_Sans_3 } from "next/font/google";
import { SiteShell } from "@/components/layout/site-shell";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SITE_NAME, SITE_URL } from "@/lib/audit/types";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TheSeoSoul — Free Website SEO Checker & Shareable Audit Reports",
    template: `%s | TheSeoSoul`,
  },
  description:
    "Free website SEO checker with no signup. Check meta tags, headings, robots.txt, keyword density, Open Graph, TLS, DNS, WHOIS, and GEO readiness — then share an /audit report.",
  applicationName: SITE_NAME,
  keywords: [
    "free SEO audit",
    "technical SEO audit",
    "SEO checker",
    "meta tags checker",
    "robots.txt checker",
    "domain age",
    "WHOIS",
    "llms.txt",
    "AI crawler",
    "GEO SEO",
    "keyword density",
    "TheSeoSoul",
    "theseosoul",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "TheSeoSoul — Free Technical SEO Audit",
    description:
      "Paste a URL. Get a shareable technical SEO report: on-page, GEO, TLS, DNS, and domain age — free.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TheSeoSoul — Free Technical SEO Audit",
    description:
      "Shareable technical SEO reports for any domain. No signup. No fake traffic charts.",
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        description:
          "Free technical SEO audit and inspection reports for any domain.",
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/audit/{domain}`,
          "query-input": "required name=domain",
        },
      },
      {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "Automated on-page SEO, GEO readiness, keyword density, WHOIS, and technical audits.",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Is TheSeoSoul free — and what isn’t?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The technical SEO + GEO audit is free with no signup. Domain Authority, traffic charts, and backlink indexes need paid data and are planned for a later Pro tier — not invented on the free tier.",
            },
          },
          {
            "@type": "Question",
            name: "How does an audit work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "We fetch live HTML and related public resources, parse SEO and GEO signals server-side, score Meta / Structure / Technical / GEO, then publish a shareable dashboard at /audit/[domain].",
            },
          },
          {
            "@type": "Question",
            name: "How is this different from other free SEO tools?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Results live on a shareable report URL instead of a private popup, combining classic on-page SEO with GEO readiness and honest tech probes — without fake traffic or authority scores.",
            },
          },
          {
            "@type": "Question",
            name: "Are audit pages indexed by Google?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Reports are shareable for humans, but most use noindex; only curated example reports are listed in the sitemap.",
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bricolage.variable} ${sourceSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteShell>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
