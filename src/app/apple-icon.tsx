import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";

/**
 * Apple touch icon (issue #67) — same espresso/gold diamond monogram
 * as src/app/icon.tsx, rendered at the iOS-requested 180x180.
 * Served at /apple-icon as image/png.
 */
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

function loadSerif(): Buffer | undefined {
  try {
    return readFileSync(
      "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
    );
  } catch {
    return undefined;
  }
}

export default function AppleIcon() {
  const serif = loadSerif();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1f1810",
          borderRadius: 40,
          position: "relative",
        }}
      >
        {/* Gold diamond */}
        <div
          style={{
            width: 84,
            height: 84,
            display: "flex",
            backgroundColor: "#d4af37",
            borderRadius: 6,
            transform: "rotate(45deg)",
          }}
        />
        {/* Serif "D" monogram, kept upright over the diamond */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1f1810",
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1,
            fontFamily: '"Liberation Serif", Georgia, serif',
          }}
        >
          D
        </div>
      </div>
    ),
    {
      ...size,
      fonts: serif
        ? [
            {
              name: "Liberation Serif",
              data: serif,
              weight: 700,
              style: "normal",
            },
          ]
        : undefined,
    }
  );
}
