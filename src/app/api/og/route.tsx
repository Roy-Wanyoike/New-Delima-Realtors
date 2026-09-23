import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";

/**
 * Social share card (issue #67) — served at /api/og and referenced by the
 * root layout's openGraph/twitter metadata.
 *
 * 1200x630 branded frame: espresso field, thin gold double border inset,
 * letterspaced gold eyebrow, serif headline, sand subline, and a bottom row
 * of small gold diamond separators.
 *
 * Fonts: uses the system-local Liberation Serif (no external fetch, safe for
 * ImageResponse); falls back to the next/og default font when unavailable.
 */
export const runtime = "nodejs";
export const dynamic = "force-static";

const ESPRESSO = "#1f1810";
const GOLD = "#c9a227";
const GOLD_BRIGHT = "#d4af37";
const GOLD_MUTED = "rgba(201, 162, 39, 0.55)";
const CREAM = "#f7f3ea";
const SAND = "#d9cfb4";

function loadSerif(): Buffer | undefined {
  try {
    return readFileSync(
      "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
    );
  } catch {
    return undefined;
  }
}

export async function GET() {
  const serif = loadSerif();

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: ESPRESSO,
          padding: 28,
        }}
      >
        {/* Outer border of the double frame */}
        <div
          style={{
            flex: 1,
            display: "flex",
            border: `2px solid ${GOLD}`,
            padding: 10,
          }}
        >
          {/* Inner border + content stage */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              border: `1px solid ${GOLD}`,
              padding: "64px 80px 52px",
            }}
          >
            {/* Eyebrow */}
            <div
              style={{
                display: "flex",
                color: GOLD_BRIGHT,
                fontSize: 24,
                letterSpacing: 10,
                paddingLeft: 10, // optical centering: satori letterspaces the trailing char too
              }}
            >
              DELIMA REALTORS · NAIROBI
            </div>

            {/* Headline block */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  color: CREAM,
                  fontSize: 96,
                  lineHeight: 1.12,
                  fontWeight: 700,
                  textAlign: "center",
                  fontFamily: '"Liberation Serif", Georgia, serif',
                }}
              >
                Find Your Signature Address
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 28,
                  color: SAND,
                  fontSize: 30,
                  letterSpacing: 1,
                  paddingLeft: 1,
                }}
              >
                Luxury homes across Karen · Muthaiga · Runda · Kilimani
              </div>
            </div>

            {/* Bottom row: small gold diamond separators */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 140,
                  height: 1,
                  backgroundColor: GOLD_MUTED,
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18,
                  height: 18,
                  marginLeft: 16,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    display: "flex",
                    backgroundColor: GOLD_BRIGHT,
                    transform: "rotate(45deg)",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  width: 140,
                  height: 1,
                  backgroundColor: GOLD_MUTED,
                  marginLeft: 16,
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18,
                  height: 18,
                  marginLeft: 16,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    display: "flex",
                    backgroundColor: GOLD_BRIGHT,
                    transform: "rotate(45deg)",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  width: 140,
                  height: 1,
                  backgroundColor: GOLD_MUTED,
                  marginLeft: 16,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
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

  // Long-lived share-card caching (image content is fully static).
  image.headers.set(
    "Cache-Control",
    "public, max-age=86400, stale-while-revalidate"
  );

  return image;
}
