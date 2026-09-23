import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";

/**
 * File-convention favicon/app icon (issue #67).
 * Rendered on-demand by next/og — no binary asset in git.
 * Served at /icon as image/png.
 */
export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

/**
 * Load a local serif so the "D" monogram keeps its luxury serif character.
 * System-local font (no network fetch); falls back to the next/og default
 * font if unavailable — the mark stays legible either way.
 */
function loadSerif(): Buffer | undefined {
  try {
    return readFileSync(
      "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
    );
  } catch {
    return undefined;
  }
}

export default function Icon() {
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
          borderRadius: 110,
          position: "relative",
        }}
      >
        {/* Gold diamond */}
        <div
          style={{
            width: 236,
            height: 236,
            display: "flex",
            backgroundColor: "#d4af37",
            borderRadius: 16,
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
            fontSize: 176,
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
