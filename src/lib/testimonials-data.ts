// Delima Realtors Platform 2.0 — client testimonials data (pure module)
// Owner: principal-engineer-testimonials (Task 1D).
// Pure data — no React, no client directives. Consumed by the Testimonials
// presentational component in src/components/delima/testimonials.tsx.

export interface Testimonial {
  /** Stable unique id (kebab-case, used as React key). */
  id: string
  /** 2–4 sentences, first-person, specific to the Nairobi luxury market. */
  quote: string
  /** Full client name (Kenyan). */
  name: string
  /** Short role line, e.g. "Bought in Karen", "Sold in Muthaiga". */
  role: string
  /** Nairobi neighbourhood the deal closed in. */
  location: string
  /** Always 5 — premium feel. Rendered as a 5-star row. */
  rating: number
  /** Unsplash portrait URL (200px crop, rounded by Avatar). */
  photo: string
  /** Optional closed deal value in KES — surfaced for impact when present. */
  dealValueKes?: number
  /** ISO date the deal closed (YYYY-MM-DD). */
  dateIso: string
}

/**
 * Six curated client stories spanning the Delima portfolio: a Karen family
 * villa, a UK-diaspora penthouse purchase, a discreet Muthaiga sale, a
 * Kilimani investment play, a first-time buyer in Kileleshwa, and a
 * commercial office closing in Westlands. Agent names match the seeded
 * agent roster in prisma/seed.ts.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'karen-villa-wanjiku-hassan',
    quote:
      'Amara Otieno showed us a Karen manor that was not even on the portals — a half-acre garden, four en-suites, and a kitchen that opens onto the lawn. The schools run was on her mind before it was on ours; she timed our viewing against the Braeburn term calendar. We signed in three weeks and our girls now ride their bikes under the jacarandas every evening.',
    name: 'Wanjiku & Daniel Hassan',
    role: 'Bought in Karen',
    location: 'Karen',
    rating: 5,
    photo:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
    dealValueKes: 128_000_000,
    dateIso: '2026-08-12',
  },
  {
    id: 'westlands-penthouse-priya-patel',
    quote:
      'From Croydon to a Westlands penthouse, sight unseen — Xavier Kariuki ran a live video walkthrough at 6pm Nairobi time, walked me through every switch and tap, and held the unit while my lawyer verified the title. Delima\'s escrow partner kept my deposit ring-fenced right up to completion. I collected my keys on a flying visit and have not second-guessed a single shilling.',
    name: 'Priya Patel',
    role: 'Bought in Westlands',
    location: 'Westlands',
    rating: 5,
    photo:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    dealValueKes: 45_000_000,
    dateIso: '2026-07-04',
  },
  {
    id: 'muthaiga-sale-achieng-mwangi',
    quote:
      'I expected a slow, noisy sale for our Muthaiga home; Brian Kimani delivered the opposite. He staged it discreetly, screened fourteen viewers down to four serious buyers, and ran a sealed-bid round that landed three offers above asking in eleven days. The discretion was total — not a single board went up on our gate.',
    name: 'Achieng Mwangi',
    role: 'Sold in Muthaiga',
    location: 'Muthaiga',
    rating: 5,
    photo:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=200&auto=format&fit=crop',
    dealValueKes: 195_000_000,
    dateIso: '2026-06-19',
  },
  {
    id: 'kilimani-investment-idris-hassan',
    quote:
      'Zawadi Njoroge handed me a spreadsheet before she handed me a brochure — yields, service-charge leaks, short-let licensing risk, the lot. I closed on two Kilimani apartments in the same quarter and both were tenanted within nine days at eight percent gross. Her market intel paid for itself before the stamp duty cleared.',
    name: 'Idris Hassan',
    role: 'Invested in Kilimani',
    location: 'Kilimani',
    rating: 5,
    photo:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    dealValueKes: 56_000_000,
    dateIso: '2026-05-22',
  },
  {
    id: 'kileleshwa-first-home-mary-otieno',
    quote:
      'As a first-time buyer I had a hundred anxieties and very little patience for jargon. Neema Wanjiru held my hand through every viewing, every clause, every counter-offer — she even sat with me at my bank to untangle the mortgage pre-approval. I now own a two-bedroom in Kileleshwa and I still text her when the geyser misbehaves.',
    name: 'Mary Otieno',
    role: 'Bought in Kileleshwa',
    location: 'Kileleshwa',
    rating: 5,
    photo:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    dealValueKes: 14_500_000,
    dateIso: '2026-04-08',
  },
  {
    id: 'westlands-office-imran-njoroge',
    quote:
      'Finding 240 square metres of grade-A office in Westlands for our fintech HQ was going to be a six-month distraction. David Mwangi had three shortlisted in a week, negotiated eight months rent-free on a five-year lease, and coordinated the fit-out approvals with the landlord. We moved in ahead of schedule and our board now asks for Delima by name.',
    name: 'Imran Njoroge',
    role: 'Leased in Westlands',
    location: 'Westlands',
    rating: 5,
    photo:
      'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=200&auto=format&fit=crop',
    dealValueKes: 220_000_000,
    dateIso: '2026-03-15',
  },
]
