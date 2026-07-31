import { ImageResponse } from "next/og";

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
          borderRadius: 7,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <circle
            cx="16"
            cy="16"
            r="11"
            stroke="#5eead4"
            strokeWidth="1.6"
            strokeOpacity="0.35"
          />
          <path
            d="M16 5a11 11 0 0 1 9.5 5.5"
            stroke="#2dd4bf"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="16" cy="16" r="4.2" fill="#2dd4bf" />
          <circle cx="16" cy="16" r="1.6" fill="#0b1220" />
          <circle cx="25.5" cy="10.5" r="1.7" fill="#99f6e4" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
