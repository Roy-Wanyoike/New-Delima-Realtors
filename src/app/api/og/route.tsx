import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";

/**
 * Social share card (Delima Realtors 3.0) — served at /api/og and referenced
 * by the root layout's openGraph/twitter metadata.
 *
 * 1200x630 branded frame: evergreen gradient field (#0C3B2E → #072A20),
 * a warm "sun" amber (#E8A33D) accent system — inset rounded hairline border,
 * roofline mark, eyebrow, and CTA pill — plus a soft amber glow sweeping the
 * top-right corner.
 *
 * Fonts: uses the system-local Liberation Sans (no external fetch, safe for
 * ImageResponse); falls back to the next/og default font when unavailable.
 */
export const runtime = "nodejs";
export const dynamic = "force-static";

const BRAND = "#0C3B2E";
const BRAND_DEEP = "#072A20";
const SUN = "#E8A33D";
const SUN_SOFT = "rgba(232, 163, 61, 0.42)";
const PAPER = "#FAFAF7";
const CREAM_MUTED = "rgba(250, 250, 247, 0.72)";

function loadSans(): Buffer | undefined {
  try {
    return readFileSync(
      "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
    );
  } catch {
    return undefined;
  }
}

/** Amber rounded-square mark with a chevron roofline — pure flex geometry. */
function RoofMark({ size }: { size: number }) {
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: size,
        height: size,
        backgroundColor: SUN,
        borderRadius: size * 0.28,
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          width: size * 0.5,
          height: size * 0.11,
          backgroundColor: BRAND,
          top: size * 0.3,
          left: size * 0.24,
          transform: "rotate(-38deg)",
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          width: size * 0.5,
          height: size * 0.11,
          backgroundColor: BRAND,
          top: size * 0.3,
          left: size * 0.5,
          transform: "rotate(38deg)",
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          width: size * 0.14,
          height: size * 0.22,
          backgroundColor: BRAND,
          top: size * 0.56,
          left: size * 0.43,
          borderRadius: 2,
        }}
      />
    </div>
  );
}

export async function GET() {
  const sans = loadSans();

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: BRAND,
          backgroundImage: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DEEP} 100%)`,
          padding: 28,
          position: "relative",
        }}
      >
        {/* Soft amber glow, top-right */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: -180,
            right: -140,
            width: 560,
            height: 560,
            borderRadius: 9999,
            backgroundColor: SUN_SOFT,
          }}
        />
        {/* Second, fainter glow lower-left for depth */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: -220,
            left: -160,
            width: 460,
            height: 460,
            borderRadius: 9999,
            backgroundColor: "rgba(232, 163, 61, 0.14)",
          }}
        />

        {/* Inset rounded hairline frame */}
        <div
          style={{
            display: "flex",
            flex: 1,
            border: `2px solid ${SUN_SOFT}`,
            borderRadius: 26,
            padding: 10,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              flex: 1,
              padding: "44px 72px 40px",
            }}
          >
            {/* Brand row */}
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <RoofMark size={52} />
              <div
                style={{
                  display: "flex",
                  color: PAPER,
                  fontSize: 30,
                  fontWeight: 700,
                  letterSpacing: 7,
                }}
              >
                DELIMA REALTORS
              </div>
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
                  color: PAPER,
                  fontSize: 84,
                  lineHeight: 1.16,
                  fontWeight: 700,
                  textAlign: "center",
                  letterSpacing: -1,
                }}
              >
                Find a home you&apos;ll love in Nairobi
              </div>

              {/* Amber rule + diamond accents */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 30,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: 150,
                    height: 2,
                    backgroundColor: SUN_SOFT,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    width: 12,
                    height: 12,
                    margin: "0 20px",
                    backgroundColor: SUN,
                    transform: "rotate(45deg)",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    width: 150,
                    height: 2,
                    backgroundColor: SUN_SOFT,
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 24,
                  color: CREAM_MUTED,
                  fontSize: 27,
                  letterSpacing: 1,
                }}
              >
                Karen · Runda · Kilimani · Westlands · Muthaiga — verified
                listings, expert agents
              </div>
            </div>

            {/* CTA pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: SUN,
                color: BRAND_DEEP,
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: 2,
                padding: "16px 38px",
                borderRadius: 9999,
              }}
            >
              delimarealtors.co.ke
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: sans
        ? [
            {
              name: "Liberation Sans",
              data: sans,
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
