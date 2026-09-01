import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist_Mono, Source_Sans_3 } from "next/font/google";
import { AnalyticsConsent } from "@/components/layout/analytics-consent";
import { SiteShell } from "@/components/layout/site-shell";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/audit/types";
import { HOME_SEO_DESCRIPTION, HOME_SEO_TITLE } from "@/lib/home-seo";
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
    default: HOME_SEO_TITLE,
    template: `%s | TheSeoSoul`,
  },
  description: HOME_SEO_DESCRIPTION,
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
    title: HOME_SEO_TITLE,
    description: HOME_SEO_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_SEO_TITLE,
    description: HOME_SEO_DESCRIPTION,
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
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        email: SITE_EMAIL,
        logo: {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          url: `${SITE_URL}/apple-icon`,
          contentUrl: `${SITE_URL}/apple-icon`,
          width: 180,
          height: 180,
          caption: SITE_NAME,
        },
        contactPoint: {
          "@type": "ContactPoint",
          email: SITE_EMAIL,
          contactType: "customer support",
          url: `${SITE_URL}/contact`,
        },
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
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteShell>{children}</SiteShell>
          <AnalyticsConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
