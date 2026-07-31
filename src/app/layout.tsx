import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist_Mono, Source_Sans_3 } from "next/font/google";
import { SiteShell } from "@/components/layout/site-shell";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/audit/types";
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
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        description:
          "Free technical SEO audit and inspection reports for any domain.",
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/audit/{search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        email: SITE_EMAIL,
        logo: `${SITE_URL}/icon`,
        contactPoint: {
          "@type": "ContactPoint",
          email: SITE_EMAIL,
          contactType: "customer support",
          url: `${SITE_URL}/contact`,
        },
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "Automated on-page SEO, GEO readiness, keyword density, WHOIS, and technical audits.",
        publisher: { "@id": `${SITE_URL}/#organization` },
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
