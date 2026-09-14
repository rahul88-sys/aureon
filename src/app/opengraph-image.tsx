import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — We build systems`;
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
          justifyContent: "space-between",
          background: "#050505",
          padding: "72px",
          color: "#ECEAE4",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 20,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#C8FF3A",
          }}
        >
          Aureon // SYS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 72,
              lineHeight: 0.95,
              maxWidth: 900,
              textTransform: "uppercase",
              letterSpacing: "-0.04em",
            }}
          >
            We build systems.
          </div>
          <div style={{ fontSize: 22, color: "#C8FF3A" }}>
            web · .net · ai · cloud
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
