import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("target") ?? "site";
  let label = raw;
  try {
    label = decodeURIComponent(raw);
  } catch {
    /* keep raw */
  }
  const display = label.length > 48 ? `${label.slice(0, 45)}…` : label;

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
              marginBottom: 18,
              color: "#5eead4",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Shareable Site Soul report
          </div>
          <div
            style={{
              display: "flex",
              fontSize: display.length > 28 ? 40 : 56,
              fontWeight: 800,
              letterSpacing: -1,
              maxWidth: 1000,
            }}
          >
            {display}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 30,
              color: "#cbd5e1",
            }}
          >
            Meta · Structure · Technical · GEO
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#94a3b8",
          }}
        >
          theseosoul.com/audit/{display}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
