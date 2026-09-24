// Delima Realtors 3.0 — client testimonials data (pure module)
// Owner: REV-2 (homepage engineer).
// Pure data — no React, no client directives. Consumed by the Testimonials
// presentational component in src/components/delima/testimonials.tsx.

export interface Testimonial {
  /** Stable unique id (kebab-case, used as React key). */
  id: string
  /** 2–3 sentences, first-person, specific to the Nairobi market. */
  quote: string
  /** Full client name (Kenyan). */
  name: string
  /** Short deal type line, e.g. "Bought a villa", "Sold a home". */
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
 * Six curated client stories spanning the Delima book: an off-market Karen
 * family villa, a data-first Kilimani investment play, a diaspora penthouse
 * purchase in Westlands, a discreet Muthaiga sale, a first-time buyer in
 * Kileleshwa and a family relocation rental in Lavington.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'otieno-karen-villa',
    quote:
      'Delima showed us an off-market Karen villa with a half-acre garden that never appeared on any portal. They negotiated KES 8M off the asking price and coordinated the title search, lawyers and handover. Six weeks after our first viewing, our girls were riding bikes under the jacarandas.',
    name: 'Wanjiku & Brian Otieno',
    role: 'Bought a villa',
    location: 'Karen',
    rating: 5,
    photo:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    dealValueKes: 118_000_000,
    dateIso: '2026-08-12',
  },
  {
    id: 'hassan-kilimani-investment',
    quote:
      'I asked for numbers, not brochures — and got a full yield breakdown, service-charge history and short-let licensing risk before I viewed anything. Both Kilimani apartments were tenanted within three weeks of completion. That is what paying for expertise feels like.',
    name: 'Amina Hassan',
    role: 'Invested in rentals',
    location: 'Kilimani',
    rating: 5,
    photo:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&auto=format&fit=crop',
    dealValueKes: 26_500_000,
    dateIso: '2026-07-21',
  },
  {
    id: 'kariuki-westlands-penthouse',
    quote:
      'I bought my Westlands penthouse sight unseen while living in London. A live video walkthrough at 6pm Nairobi time, a ring-fenced deposit through their escrow partner, and keys collected on a single flying visit. Flawless from offer to handover.',
    name: 'David Kariuki',
    role: 'Bought a penthouse',
    location: 'Westlands',
    rating: 5,
    photo:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    dealValueKes: 45_000_000,
    dateIso: '2026-06-30',
  },
  {
    id: 'wambui-muthaiga-sale',
    quote:
      'Three sealed bids above asking in eleven days — and not a single signboard went up on our gate. Delima staged our Muthaiga home discreetly, screened every viewer, and kept the whole sale quiet until the money landed.',
    name: 'Grace Wambui',
    role: 'Sold a home',
    location: 'Muthaiga',
    rating: 5,
    photo:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    dealValueKes: 187_000_000,
    dateIso: '2026-05-14',
  },
  {
    id: 'mwangi-kileleshwa-first-home',
    quote:
      'As first-time buyers we had a hundred questions and no patience for jargon. Our agent held our hand through every clause and counter-offer, even sitting with us at the bank for the mortgage pre-approval. We got the keys in April and still text her when the geyser misbehaves.',
    name: 'James & Lydia Mwangi',
    role: 'First home',
    location: 'Kileleshwa',
    rating: 5,
    photo:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    dealValueKes: 14_800_000,
    dateIso: '2026-04-02',
  },
  {
    id: 'njoroge-lavington-rental',
    quote:
      'Relocating from Mombasa with three kids and a dog, we needed a pet-friendly compound with space — fast. Delima shortlisted six homes in a day, negotiated a twelve-month lease with a break clause, and we moved in the following weekend.',
    name: 'Samuel & Fatuma Njoroge',
    role: 'Rented a home',
    location: 'Lavington',
    rating: 5,
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    dateIso: '2026-03-18',
  },
]
