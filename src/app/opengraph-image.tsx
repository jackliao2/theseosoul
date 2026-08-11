import { ImageResponse } from "next/og";

export const alt = "TheSeoSoul — Free Technical SEO Audit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background:
            "linear-gradient(135deg, #042f2e 0%, #0f172a 45%, #083344 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 68,
            fontWeight: 800,
            letterSpacing: -1.5,
          }}
        >
          <span style={{ color: "#ffffff" }}>The</span>
          <span style={{ color: "#2dd4bf" }}>Seo</span>
          <span style={{ color: "#ffffff" }}>Soul</span>
          <span style={{ color: "#64748b", fontSize: 42, marginLeft: 4 }}>
            .com
          </span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 32,
            color: "#99f6e4",
            maxWidth: 920,
            lineHeight: 1.35,
          }}
        >
          Free technical SEO audits with shareable domain reports
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 22,
            color: "#94a3b8",
          }}
        >
          No signup · On-page · GEO · TLS · DNS · WHOIS
        </div>
      </div>
    ),
    { ...size }
  );
}
