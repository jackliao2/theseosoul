import { ImageResponse } from "next/og";
import {
  MARK_BAR_1,
  MARK_BAR_2,
  MARK_BAR_3,
  MARK_FLAME,
  MARK_FLAME_INNER,
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
        <svg width="26" height="26" viewBox={MARK_VIEWBOX} fill="none">
          <path d={MARK_BAR_1} fill="#2dd4bf" fillOpacity="0.45" />
          <path d={MARK_BAR_2} fill="#2dd4bf" fillOpacity="0.72" />
          <path d={MARK_BAR_3} fill="#2dd4bf" />
          <path d={MARK_FLAME} fill="#5eead4" />
          <path d={MARK_FLAME_INNER} fill="#0b1220" fillOpacity="0.35" />
          <path d={MARK_SPARK} fill="#ccfbf1" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
