import { ImageResponse } from "next/og";
import {
  MARK_E,
  MARK_O,
  MARK_S,
  MARK_SPARK,
  MARK_VIEWBOX,
} from "@/components/brand/mark-geometry";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b1220",
          borderRadius: 8,
        }}
      >
        <svg width="28" height="28" viewBox={MARK_VIEWBOX} fill="none">
          <g
            stroke="#2dd4bf"
            strokeWidth="2.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={MARK_S} />
            <path d={MARK_E} />
            <path d={MARK_O} />
          </g>
          <path d={MARK_SPARK} fill="#ccfbf1" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
