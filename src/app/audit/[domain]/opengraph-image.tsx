import { ImageResponse } from "next/og";
import { domainFromParam } from "@/lib/url";

export const runtime = "edge";
export const alt = "TheSeoSoul SEO Audit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ domain: string }>;
};

export default async function AuditOpenGraphImage({ params }: Props) {
  const { domain: raw } = await params;
  let domain = raw;
  try {
    domain = domainFromParam(raw).domain;
  } catch {
    domain = decodeURIComponent(raw);
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
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
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: -0.5,
          }}
        >
          <span style={{ color: "#ffffff" }}>the</span>
          <span style={{ color: "#2dd4bf" }}>SEO</span>
          <span style={{ color: "#ffffff" }}>soul</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: -1,
              maxWidth: 1000,
            }}
          >
            {domain}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 30,
              color: "#cbd5e1",
            }}
          >
            Free technical SEO audit report
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#94a3b8",
          }}
        >
          theseosoul.com/audit/{domain}
        </div>
      </div>
    ),
    { ...size }
  );
}
