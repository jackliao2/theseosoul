import { ImageResponse } from "next/og";
import {
  MARK_SOUL,
  MARK_SOUL_INNER,
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
        <svg width="24" height="24" viewBox={MARK_VIEWBOX} fill="none">
          <path d={MARK_SOUL} fill="#2dd4bf" />
          <path d={MARK_SOUL_INNER} fill="#0b1220" fillOpacity="0.42" />
          <path d={MARK_SPARK} fill="#ccfbf1" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
