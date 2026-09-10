export interface BlogPost {
	slug: string;
	title: string;
	excerpt: string;
	content: string[];
	category: string;
	author: string;
	authorRole: string;
	date: string;
	readTime: string;
	image: string;
	tags: string[];
}

/**
 * Curated blog posts. In production these would come from Supabase (a `posts`
 * table) or markdown files; for now they're static to power /blog + /blog/[slug].
 */
export const blogPosts: BlogPost[] = [
	{
		slug: 'buying-first-home-nairobi',
		title: 'Buying Your First Home in Nairobi: A Step-by-Step Guide',
		excerpt: 'From financing to handover — everything a first-time Nairobi buyer needs to know, demystified.',
		category: 'Buying Guide',
		author: 'Aisha Mohamed',
		authorRole: 'Senior Property Consultant',
		date: 'March 15, 2026',
		readTime: '8 min read',
		image: '/lib/assets/about-img-1.jpg',
		tags: ['First-time buyer', 'Mortgage', 'Westlands'],
		content: [
			'Buying your first home in Nairobi is exciting — but the process can feel opaque if you don’t know the steps. This guide walks you through everything from budgeting to handover, so you can move in with confidence.',
			'**Step 1 — Know your budget.** Most Kenyan banks require a 10–20% deposit and will lend 3–4× your gross annual income. Get a pre-approval letter before you start viewing; it strengthens your offer and saves time.',
			'**Step 2 — Pick the right neighborhood.** Westlands and Kilimani suit young professionals who value walkability and nightlife. Karen and Loresho offer space and quiet for growing families. Our neighborhood guide breaks down prices, schools, and lifestyle for each area.',
			'**Step 3 — View with a critical eye.** Look past fresh paint. Check water pressure, test all sockets, ask about the backup generator, and verify the title is clean (your lawyer will do a search at the Lands Registry).',
			'**Step 4 — Make an offer.** Your agent will draft an Offer Letter; once accepted, you pay a booking deposit (usually 1–2% of the price) to take the property off the market while due diligence completes.',
			'**Step 5 — Due diligence + financing.** Your lawyer confirms title, the bank values the property, and your mortgage is finalized. This typically takes 3–6 weeks.',
			'**Step 6 — Completion + handover.** The transfer is registered at the Lands Office, the balance is paid, and you receive keys. Congratulations — you’re a homeowner!',
			'Need help navigating any of this? Our first-time-buyer specialists (Aisha and the team) walk clients through every step at no cost. Reach out via /contact.'
		]
	},
	{
		slug: 'nairobi-property-market-2026',
		title: 'Nairobi Property Market Outlook 2026',
		excerpt: 'Prices, hot neighborhoods, and where the smart money is flowing this year.',
		category: 'Market Analysis',
		author: 'David Kamau',
		authorRole: 'Commercial & Investment Specialist',
		date: 'March 8, 2026',
		readTime: '6 min read',
		image: '/lib/assets/about-img-2.jpg',
		tags: ['Investment', 'Market trends', 'ROI'],
		content: [
			'Nairobi’s property market enters 2026 with steady appreciation and a few emerging hotspots worth watching. Here’s our read on where things are heading.',
			'**Residential appreciation.** Prime areas (Westlands, Kilimani, Karen) saw 6–9% year-on-year growth in 2025. We expect a similar trajectory in 2026, supported by infrastructure investment and a growing middle class.',
			'**Emerging corridors.** Thika Road, Syokimau, and the Ruaka bypass continue to attract first-time buyers priced out of the inner suburbs. Off-plan purchases here can yield 15–20% on completion.',
			'**Commercial demand.** Upper Hill remains the CBD of choice for corporates, with Grade A office rents holding firm at KES 120–180/sqft/month. Hybrid work has softened demand slightly, but quality space still leases quickly.',
			'**What to watch.** Interest rates (CBK held at 10.5% in Q1), the shilling’s stability, and the rollout of the Affordable Housing Programme. All three will shape buyer sentiment through the year.',
			'Looking to invest? David and our commercial desk run ROI models for every listing — book a consultation to see the numbers behind a property before you commit.'
		]
	},
	{
		slug: 'dsq-what-to-know',
		title: 'DSQs Explained: What Domestic Servant Quarters Add to a Property',
		excerpt: 'A DSQ can add 8–12% to resale value — but not all DSQs are created equal.',
		category: 'Buying Guide',
		author: 'Roy Wanyoike',
		authorRole: 'Founder & Lead Realtor',
		date: 'February 28, 2026',
		readTime: '5 min read',
		image: '/lib/assets/about-img-3.jpg',
		tags: ['DSQ', 'Apartments', 'Valuation'],
		content: [
			'If you’re apartment-hunting in Kilimani, Kileleshwa, or Westlands, you’ll see "DSQ" on many listings. A Domestic Servant Quarter is a small self-contained unit — usually on the ground floor or rooftop — that comes with the main apartment.',
			'**Why they matter.** A DSQ gives you flexibility: live-in help, a home office, a teenage retreat, or rental income (KES 15–25k/month in Kilimani). They typically add 8–12% to resale value.',
			'**What to check.** Is the DSQ en-suite? Does it have its own entrance? Is it legally part of the title (some are "temporary" structures that don’t transfer)? Your lawyer should confirm this during due diligence.',
			'**The trade-off.** DSQ apartments cost more upfront and carry slightly higher service charges. But for families or investors, the flexibility usually pays for itself within 3–5 years.',
			'See our Kilimani and Kileleshwa listings for apartments with DSQs — filter by "DSQ" in the amenities.'
		]
	}
];

export function getPostBySlug(slug: string): BlogPost | undefined {
	return blogPosts.find((p) => p.slug === slug);
}
