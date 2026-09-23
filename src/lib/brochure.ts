// Delima Realtors Platform 2.0 — printable brochure HTML builder (Task 1B)
//
// Pure helper: given a PropertyDTO + optional AgentDTO, returns a fully
// self-contained HTML string (inline CSS, no external assets) for an A4
// portrait print-ready brochure. The browser's native print dialog handles
// PDF generation (Ctrl+P → Save as PDF). The route handler appends a
// `window.print()` script only when `?print=1` is present so plain previews
// don't auto-trigger the dialog.
//
// Security: ALL user-controlled content (title, description, neighborhood,
// amenities, agent fields, image URLs) is passed through escapeHtml() so
// the brochure HTML cannot be used as an XSS vector via crafted DB rows.
//
// Palette (warm luxury):
//   cream    #FBF7EF  page background
//   espresso #3D2817  primary text
//   cocoa    #6B4E35  secondary text
//   gold     #C9A24B  accent / wordmark
//   sand     #F5EBD3  card / agent block fill
import type { PropertyDTO, AgentDTO } from '@/lib/types'
import { formatPriceForStatus, formatSqm, typeLabel } from '@/lib/format'

/**
 * Escape the five HTML-significant characters so user content can never break
 * out of its containing element/attribute. Exported for reuse + unit testing.
 */
export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Inline SVG placeholder used when a property has no images. */
const FALLBACK_HERO_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">` +
      `<rect width="1200" height="800" fill="#3D2817"/>` +
      `<text x="600" y="370" text-anchor="middle" font-family="Georgia, serif" font-size="72" fill="#C9A24B" letter-spacing="10">DELIMA</text>` +
      `<text x="600" y="430" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="#FBF7EF" letter-spacing="6">REALTORS</text>` +
      `<text x="600" y="500" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="#C9A24B" letter-spacing="3">Luxury Homes in Nairobi</text>` +
      `</svg>`,
  )

/** Inline SVG placeholder used when an agent has no photo. */
const FALLBACK_AGENT_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">` +
      `<rect width="200" height="200" fill="#F5EBD3"/>` +
      `<circle cx="100" cy="78" r="34" fill="#C9A24B"/>` +
      `<path d="M40 180 C40 130 160 130 160 180 Z" fill="#C9A24B"/>` +
      `</svg>`,
  )

/** Build the 4-stat card row markup. */
function buildStatsGrid(p: PropertyDTO): string {
  const stats: Array<{ num: string; label: string }> = [
    { num: String(p.bedrooms), label: 'Bedrooms' },
    { num: String(p.bathrooms), label: 'Bathrooms' },
    { num: escapeHtml(formatSqm(p.sqm)), label: 'Interior Size' },
    { num: String(p.yearBuilt), label: 'Year Built' },
  ]
  return (
    `<section class="stats-grid">` +
    stats
      .map(
        (s) =>
          `<div class="stat"><div class="stat-num">${s.num}</div><div class="stat-label">${s.label}</div></div>`,
      )
      .join('') +
    `</section>`
  )
}

/** Build the 2-column amenity list markup. */
function buildAmenitiesSection(amenities: string[]): string {
  if (!amenities.length) {
    return (
      `<section class="amenities"><h2>Amenities</h2>` +
      `<p class="muted">Full amenity list available on request from your Delima agent.</p></section>`
    )
  }
  const items = amenities
    .map(
      (a) =>
        `<li><span class="bullet">&#10022;</span><span>${escapeHtml(a)}</span></li>`,
    )
    .join('')
  return (
    `<section class="amenities"><h2>Amenities</h2><ul class="amenity-grid">${items}</ul></section>`
  )
}

/** Build the agent contact block markup. Returns '' when agent is null. */
function buildAgentBlock(agent: AgentDTO | null): string {
  if (!agent) return ''
  const photo = agent.photo ? escapeHtml(agent.photo) : FALLBACK_AGENT_IMG
  return (
    `<section class="agent-block">` +
    `<img src="${photo}" alt="${escapeHtml(agent.name)}" class="agent-photo"/>` +
    `<div class="agent-info">` +
    `<div class="agent-label">Your Delima Agent</div>` +
    `<div class="agent-name">${escapeHtml(agent.name)}</div>` +
    `<div class="agent-title">${escapeHtml(agent.title)}</div>` +
    `<div class="agent-contact">` +
    `<div class="agent-line"><span class="agent-k">Phone</span> ${escapeHtml(agent.phone)}</div>` +
    `<div class="agent-line"><span class="agent-k">Email</span> ${escapeHtml(agent.email)}</div>` +
    `</div>` +
    `</div>` +
    `</section>`
  )
}

/**
 * Build a self-contained, print-ready A4 portrait brochure HTML document for
 * the given property. Inline CSS only — no external stylesheets, fonts, or
 * scripts — so the rendered HTML can be saved standalone or piped straight to
 * the browser print dialog (which produces the PDF).
 */
export function buildBrochureHtml(p: PropertyDTO, agent: AgentDTO | null): string {
  const heroImage = p.images?.[0] ? escapeHtml(p.images[0]) : FALLBACK_HERO_IMG
  const priceStr = escapeHtml(formatPriceForStatus(p.priceKes, p.status))
  const typeStr = escapeHtml(typeLabel[p.type] ?? p.type)
  const neighborhoodStr = escapeHtml(p.neighborhood)
  const titleStr = escapeHtml(p.title)
  const descriptionStr = escapeHtml(p.description)
  const dateStr = new Date().toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const css = `
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      color: #3D2817;
      background: #FBF7EF;
      font-size: 15px;
      line-height: 1.55;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 32px 36px 28px;
      background: #FBF7EF;
    }
    .brand-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      border-bottom: 2px solid #C9A24B;
      padding-bottom: 14px;
      margin-bottom: 22px;
    }
    .wordmark {
      font-size: 26px;
      letter-spacing: 6px;
      color: #3D2817;
      font-weight: bold;
    }
    .tagline {
      font-size: 12px;
      letter-spacing: 2px;
      color: #C9A24B;
      font-family: Helvetica, Arial, sans-serif;
      text-transform: uppercase;
    }
    .hero { margin: 0 0 24px; }
    .hero-img {
      width: 100%;
      height: 380px;
      object-fit: cover;
      display: block;
      border-radius: 4px;
      background: #3D2817;
    }
    .title-block { margin-bottom: 22px; }
    .title {
      font-size: 30px;
      line-height: 1.2;
      margin: 0 0 6px;
      color: #3D2817;
    }
    .meta {
      font-size: 14px;
      color: #6B4E35;
      font-family: Helvetica, Arial, sans-serif;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }
    .meta .dot { margin: 0 8px; color: #C9A24B; }
    .price {
      font-size: 26px;
      color: #C9A24B;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 0 0 26px;
    }
    .stat {
      background: #F5EBD3;
      border-radius: 6px;
      padding: 14px 10px;
      text-align: center;
    }
    .stat-num {
      font-size: 20px;
      color: #3D2817;
      font-weight: bold;
      line-height: 1.1;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #6B4E35;
      font-family: Helvetica, Arial, sans-serif;
    }
    h2 {
      font-size: 16px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #3D2817;
      margin: 0 0 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #C9A24B;
    }
    .description { margin-bottom: 26px; }
    .description p {
      margin: 0;
      color: #3D2817;
      white-space: pre-line;
    }
    .amenities { margin-bottom: 26px; }
    .amenity-grid {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 24px;
    }
    .amenity-grid li {
      display: flex;
      align-items: baseline;
      gap: 8px;
      color: #3D2817;
      font-size: 14px;
      line-height: 1.6;
    }
    .bullet { color: #C9A24B; font-size: 12px; }
    .muted { color: #6B4E35; font-style: italic; margin: 0; }
    .agent-block {
      display: flex;
      align-items: center;
      gap: 18px;
      background: #F5EBD3;
      border-left: 4px solid #C9A24B;
      border-radius: 6px;
      padding: 18px 22px;
      margin-bottom: 24px;
    }
    .agent-photo {
      width: 84px;
      height: 84px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      background: #C9A24B;
    }
    .agent-info { flex: 1; }
    .agent-label {
      font-size: 10px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #C9A24B;
      font-family: Helvetica, Arial, sans-serif;
      margin-bottom: 2px;
    }
    .agent-name {
      font-size: 20px;
      color: #3D2817;
      font-weight: bold;
      line-height: 1.2;
    }
    .agent-title {
      font-size: 13px;
      color: #6B4E35;
      font-family: Helvetica, Arial, sans-serif;
      margin-bottom: 8px;
    }
    .agent-contact { font-size: 13px; color: #3D2817; }
    .agent-line { margin-bottom: 2px; }
    .agent-k {
      font-family: Helvetica, Arial, sans-serif;
      font-size: 10px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #6B4E35;
      margin-right: 6px;
    }
    .footer {
      border-top: 1px solid #C9A24B;
      padding-top: 12px;
      text-align: center;
    }
    .footer-main {
      font-size: 12px;
      color: #3D2817;
      letter-spacing: 0.5px;
      font-family: Helvetica, Arial, sans-serif;
    }
    .footer-meta {
      font-size: 10px;
      color: #6B4E35;
      margin-top: 4px;
      font-style: italic;
    }
    @media print {
      @page { size: A4 portrait; margin: 1.5cm; }
      body { background: #fff; }
      .page {
        max-width: none;
        margin: 0;
        padding: 0;
      }
      .hero-img { height: 320px; }
      section, .agent-block, .stats-grid, .amenity-grid {
        page-break-inside: avoid;
      }
      .hero { page-break-after: avoid; }
      .title-block { page-break-after: avoid; }
      h2 { page-break-after: avoid; }
    }
  `

  return (
    `<!DOCTYPE html>` +
    `<html lang="en">` +
    `<head>` +
    `<meta charset="UTF-8"/>` +
    `<meta name="viewport" content="width=device-width, initial-scale=1.0"/>` +
    `<title>${titleStr} &mdash; Delima Realtors Brochure</title>` +
    `<style>${css}</style>` +
    `</head>` +
    `<body>` +
    `<main class="page">` +
    `<header class="brand-header">` +
    `<div class="wordmark">DELIMA REALTORS</div>` +
    `<div class="tagline">Luxury Homes in Nairobi</div>` +
    `</header>` +
    `<section class="hero">` +
    `<img src="${heroImage}" alt="${titleStr}" class="hero-img"/>` +
    `</section>` +
    `<section class="title-block">` +
    `<h1 class="title">${titleStr}</h1>` +
    `<div class="meta"><span>${typeStr}</span><span class="dot">&middot;</span><span>${neighborhoodStr}</span></div>` +
    `<div class="price">${priceStr}</div>` +
    `</section>` +
    buildStatsGrid(p) +
    `<section class="description"><h2>About this property</h2><p>${descriptionStr}</p></section>` +
    buildAmenitiesSection(p.amenities ?? []) +
    buildAgentBlock(agent) +
    `<footer class="footer">` +
    `<div class="footer-main">Delima Realtors &middot; Nairobi &middot; +254 727 523 752 &middot; delima.co.ke</div>` +
    `<div class="footer-meta">Brochure generated ${escapeHtml(dateStr)}</div>` +
    `</footer>` +
    `</main>` +
    `</body>` +
    `</html>`
  )
}
