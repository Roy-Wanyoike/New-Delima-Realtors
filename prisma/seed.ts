// Delima Realtors 3.0 — seed pipeline (REV-6 enriched dataset)
// Run: bun prisma/seed.ts
//
// Dataset shape (all image IDs verified to return HTTP 200 — audit log in worklog):
//   - 9 neighborhoods (1 hero image each)
//   - 6 agents (1 portrait each)
//   - 42 properties: 27 FOR_SALE · 8 FOR_RENT · 3 SOLD · 4 NEW_DEVELOPMENT
//     · every property carries 4–5 gallery images
//   - 16 CRM leads across all statuses/sources
//   - 5 newsletter subscribers
//   - 108 market stats (9 neighborhoods × 12 months)
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`

const S = (...ids: string[]) => ids.map(id => U(id))

const neighborhoods = [
  {
    slug: 'westlands', name: 'Westlands', lat: -1.2673, lng: 36.8065, avgPricePerSqm: 168000,
    description: 'Nairobi\'s vibrant commercial heartbeat — glass towers, rooftop lounges, and the city\'s most rental-ready luxury apartments.',
    highlights: ['Walking distance to Sarit Centre & malls', 'Highest rental yields in Nairobi (6.8%)', 'Diplomatic tenant demand'],
    polygon: [[-1.2580, 36.7980], [-1.2580, 36.8150], [-1.2760, 36.8150], [-1.2760, 36.7980]],
    image: U('photo-1567767292278-a4f21aa2d36e'),
  },
  {
    slug: 'kilimani', name: 'Kilimani', lat: -1.2921, lng: 36.7830, avgPricePerSqm: 142000,
    description: 'The young professional\'s address — new-generation high-rises with skyline views between the CBD and Karen.',
    highlights: ['Fastest appreciation 2023-2026 (+9.2%/yr)', 'Overflowing with gyms, pools & co-working', '5 min to Yaya Centre'],
    polygon: [[-1.2840, 36.7740], [-1.2840, 36.7920], [-1.3000, 36.7920], [-1.3000, 36.7740]],
    image: U('photo-1545324418-cc1a3fa10c00'),
  },
  {
    slug: 'karen', name: 'Karen', lat: -1.3197, lng: 36.7076, avgPricePerSqm: 210000,
    description: 'Leafy acre-level estates at the foot of Ngong Hills — Nairobi\'s most storied luxury suburb.',
    highlights: ['1-acre+ garden plots', 'Karen Country Club & Blixen legacy', 'International schools cluster'],
    polygon: [[-1.3050, 36.6950], [-1.3050, 36.7250], [-1.3350, 36.7250], [-1.3350, 36.6950]],
    image: U('photo-1600596542815-ffad4c1539a9'),
  },
  {
    slug: 'muthaiga', name: 'Muthaiga', lat: -1.2543, lng: 36.8278, avgPricePerSqm: 245000,
    description: 'Old-money prestige beside the Muthaiga Country Club — grand colonial-modern residences on manicured grounds.',
    highlights: ['Muthaiga Country Club membership', 'UN/GDP diplomat residences', '20 min to JKIA'],
    polygon: [[-1.2430, 36.8180], [-1.2430, 36.8380], [-1.2650, 36.8380], [-1.2650, 36.8180]],
    image: U('photo-1600585154340-be6161a56a0c'),
  },
  {
    slug: 'runda', name: 'Runda', lat: -1.2416, lng: 36.7948, avgPricePerSqm: 198000,
    description: 'Secure gated communities and Georgian-style family villas in Nairobi\'s northern green belt.',
    highlights: ['Gated community security standard', 'Runda Mhasibu & Whispers avenues', 'Top-tier family amenities'],
    polygon: [[-1.2280, 36.7850], [-1.2280, 36.8050], [-1.2520, 36.8050], [-1.2520, 36.7850]],
    image: U('photo-1600566753086-00f18fb6b3ea'),
  },
  {
    slug: 'kileleshwa', name: 'Kileleshwa', lat: -1.2841, lng: 36.7694, avgPricePerSqm: 155000,
    description: 'Quiet family living with excellent schools — the balanced choice between Karen leaf and Westlands buzz.',
    highlights: ['Kenya High & Strathmore nearby', 'Townhouse belt with DSQs', 'Oloitokitok family restaurants'],
    polygon: [[-1.2750, 36.7600], [-1.2750, 36.7790], [-1.2940, 36.7790], [-1.2940, 36.7600]],
    image: U('photo-1512917774080-9991f1c4c750'),
  },
  {
    slug: 'loresho', name: 'Loresho', lat: -1.2452, lng: 36.7872, avgPricePerSqm: 175000,
    description: 'Hillside exclusivity — contemporary architecture on half-acre plots with city-gap views.',
    highlights: ['Loresho Ridge contemporary builds', 'Village market proximity', 'Horse-riding trails'],
    polygon: [[-1.2370, 36.7790], [-1.2370, 36.7960], [-1.2540, 36.7960], [-1.2540, 36.7790]],
    image: U('photo-1613490493576-7fde63acd811'),
  },
  {
    slug: 'kitisuru', name: 'Kitisuru', lat: -1.2639, lng: 36.7694, avgPricePerSqm: 188000,
    description: 'Barely-known luxury pocket — sprawling gardens, embassy residences and timeless stone villas.',
    highlights: ['Embassy row adjacency', 'Large mature gardens', 'Prince of Wales school catchment'],
    polygon: [[-1.2560, 36.7620], [-1.2560, 36.7770], [-1.2720, 36.7770], [-1.2720, 36.7620]],
    image: U('photo-1600047509807-ba8f99d2cdde'),
  },
  {
    slug: 'langata', name: 'Langata', lat: -1.3400, lng: 36.7300, avgPricePerSqm: 118000,
    description: 'Space and sky near Nairobi National Park — family compounds, equestrian living, giraffe-view sunsets.',
    highlights: ['National Park & Giraffe Centre', 'Langata equestrian community', 'Best value-per-sqm under 90M'],
    polygon: [[-1.3250, 36.7150], [-1.3250, 36.7450], [-1.3550, 36.7450], [-1.3550, 36.7150]],
    image: U('photo-1580587771525-78b9dba3b914'),
  },
]

const agents = [
  { slug: 'amara-otieno', name: 'Amara Otieno', title: 'Principal Broker — Luxury Estates', phone: '+254 727 523 752', email: 'amara@delimarealtors.co.ke', rating: 4.9, photo: U('photo-1573496359142-b8d87734a5a2', 400), specialties: JSON.stringify(['Karen', 'Muthaiga', 'Estate acquisition']), bio: 'Fifteen years closing Nairobi\'s landmark residential transactions, Amara leads Delima\'s luxury estate practice and personally oversees every Karen and Muthaiga mandate.' },
  { slug: 'david-mwangi', name: 'David Mwangi', title: 'Head of New Developments', phone: '+254 727 523 753', email: 'david@delimarealtors.co.ke', rating: 4.8, photo: U('photo-1507003211169-0a1dd7228f2d', 400), specialties: JSON.stringify(['Westlands', 'Off-plan', 'Investment analysis']), bio: 'David advises developers and buyers on off-plan acquisitions across Westlands and Kilimani, with KES 3.1B in structured sales since 2021.' },
  { slug: 'zawadi-njoroge', name: 'Zawadi Njoroge', title: 'Senior Agent — Family Homes', phone: '+254 727 523 754', email: 'zawadi@delimarealtors.co.ke', rating: 4.9, photo: U('photo-1580489944761-15a19d654956', 400), specialties: JSON.stringify(['Runda', 'Kileleshwa', 'School-run locations']), bio: 'A Runda resident for two decades, Zawadi matches growing families to the right school catchments, compounds and communities.' },
  { slug: 'xavier-kariuki', name: 'Xavier Kariuki', title: 'Investment Portfolio Advisor', phone: '+254 727 523 755', email: 'xavier@delimarealtors.co.ke', rating: 4.7, photo: U('photo-1560250097-0b93528c311a', 400), specialties: JSON.stringify(['Rental yields', 'Kilimani', 'Short-let licensing']), bio: 'Xavier builds income portfolios for diaspora clients, specialising in serviced apartment yields around Kilimani and Westlands.' },
  { slug: 'neema-wanjiru', name: 'Neema Wanjiru', title: 'Agent — Land & Gated Communities', phone: '+254 727 523 756', email: 'neema@delimarealtors.co.ke', rating: 4.8, photo: U('photo-1573497019940-1c28c88b4f3e', 400), specialties: JSON.stringify(['Langata', 'Kitisuru', 'Title due diligence']), bio: 'Neema handles acreage and gated-community plots from Langata to Kitisuru, with an impeccable record on title due diligence.' },
  { slug: 'brian-kimani', name: 'Brian Kimani', title: 'Agent — Contemporary Villas', phone: '+254 727 523 757', email: 'brian@delimarealtors.co.ke', rating: 4.8, photo: U('photo-1519085360753-af0119f7cbe7', 400), specialties: JSON.stringify(['Loresho', 'Runda', 'Architect-led builds']), bio: 'Brian works at the intersection of architecture and real estate, marketing Loresho\'s and Runda\'s most design-forward villas.' },
]

// Amenity vocabulary grounded in the Nairobi market (borehole, solar backup,
// DSQ, generator, fibre, 24/7 security…) — the things local listings really sell.
const AMEN = {
  apt: ['Swimming pool', 'Fully fitted gym', '24/7 security', 'Borehole', 'Backup generator', 'Fibre internet', 'Visitor parking', 'Balcony'],
  lux: ['DSQ (staff quarters)', 'Solar backup', 'Electric fence', 'Mature garden', 'Double garage', 'Walk-in closet', 'Wine cellar', 'Home office'],
  villa: ['Heated swimming pool', 'Cinema room', 'Gym & spa', 'Smart home system', 'Backup generator', 'Borehole & storage tanks', 'Mature garden', 'Guest wing'],
  town: ['24/7 security', 'Borehole', 'Backup generator', 'Solar water heating', 'DSQ', 'Garden', 'Fibre internet', 'Gated community'],
  pent: ['Private terrace', 'Plunge pool', 'Concierge', 'Fully fitted gym', 'Swimming pool', '24/7 security', 'Backup generator', 'Fibre internet'],
  land: ['Ready title deed', 'Fenced & gated', 'Water and power on site', 'All-weather access road', 'Perimeter wall'],
}

type P = {
  slug: string; title: string; description: string; type: string; status: string; priceKes: number
  bedrooms: number; bathrooms: number; sqm: number; address: string; nb: string; agent: string
  dx: number; dy: number; amenities: string[]; images: string[]; yearBuilt: number; parking: number
  featured: boolean; rating: number; views: number
}

const props: P[] = [
  // ================= WESTLANDS (7) =================
  {
    slug: 'the-pinnacle-westlands-penthouse',
    title: 'Exquisite 4 bedroom penthouse with private terrace in Westlands',
    description: 'Occupying the entire 24th floor, this penthouse delivers 270° views from Karura to the Ngong Hills. Floor-to-ceiling glazing wraps a great room with dual lounges, a chef\'s kitchen in imported quartz, and a 60 sqm terrace with plunge pool. The building offers concierge, sky gym and EV bays.',
    type: 'PENTHOUSE', status: 'FOR_SALE', priceKes: 86000000, bedrooms: 4, bathrooms: 4.5, sqm: 420,
    address: 'Rhapta Road, Westlands', nb: 'westlands', agent: 'david-mwangi', dx: 0.002, dy: 0.001,
    amenities: [...AMEN.pent, 'EV charging'],
    images: S('photo-1512917774080-9991f1c4c750', 'photo-1600607687939-ce8a6c25118c', 'photo-1600585154526-990dced4db0d', 'photo-1600607687920-4e2a09cf159d', 'photo-1600607688969-a5bfcd646154'),
    yearBuilt: 2023, parking: 3, featured: true, rating: 4.9, views: 2140,
  },
  {
    slug: 'rhapta-skyline-residences-8b',
    title: 'Modern 3 bedroom apartment with wraparound balcony in Westlands',
    description: 'A corner residence with wraparound balcony above Rhapta Road\'s dining mile. Open-plan living in warm oak and brass, master suite with dressing room, and building amenities including rooftop pool, gym and co-working lounge. Walking distance to Sarit Centre.',
    type: 'APARTMENT', status: 'FOR_SALE', priceKes: 28500000, bedrooms: 3, bathrooms: 3, sqm: 218,
    address: 'Rhapta Road, Westlands', nb: 'westlands', agent: 'xavier-kariuki', dx: -0.001, dy: 0.002,
    amenities: AMEN.apt,
    images: S('photo-1545324418-cc1a3fa10c00', 'photo-1522708323590-d24dbb6b0267', 'photo-1560448204-e02f11c3d0e2', 'photo-1556912173-3bb406ef7e77', 'photo-1502672260266-1c1ef2d93688'),
    yearBuilt: 2021, parking: 2, featured: true, rating: 4.7, views: 1480,
  },
  {
    slug: 'delta-towers-executive-rental',
    title: 'Fully serviced 2 bedroom apartment to let in Westlands',
    description: 'Fully serviced executive apartment for the relocation market. Hotel-grade housekeeping, gym and pool access, generator and borehole backing, and a rooftop lounge for sundowners. Offered on flexible 6/12-month terms with diplomatic lease references.',
    type: 'APARTMENT', status: 'FOR_RENT', priceKes: 265000, bedrooms: 2, bathrooms: 2, sqm: 145,
    address: 'Ring Road, Westlands', nb: 'westlands', agent: 'xavier-kariuki', dx: 0.002, dy: -0.001,
    amenities: [...AMEN.apt, 'Serviced weekly', 'Co-working lounge'],
    images: S('photo-1460317442991-0ec209397118', 'photo-1502672260266-1c1ef2d93688', 'photo-1493809842364-78817add7ffb', 'photo-1560448205-4d9b3e6bb6db', 'photo-1584622650111-993a426fbf0a'),
    yearBuilt: 2020, parking: 1, featured: false, rating: 4.6, views: 890,
  },
  {
    slug: 'mnara-heights-city-villa',
    title: 'Stylish 4 bedroom townhouse with private garden in Westlands',
    description: 'A rare townhouse-styled villa minutes from Westlands\' core. Double-volume living room, private garden with jacuzzi, and a full DSQ. Ideal for executives wanting house living without Karen\'s commute.',
    type: 'TOWNHOUSE', status: 'FOR_SALE', priceKes: 47500000, bedrooms: 4, bathrooms: 4, sqm: 310,
    address: 'Mnara Road, Westlands', nb: 'westlands', agent: 'david-mwangi', dx: -0.002, dy: -0.001,
    amenities: [...AMEN.lux, 'Private garden'],
    images: S('photo-1600585154340-be6161a56a0c', 'photo-1600566752355-35792bedcfea', 'photo-1600585152220-90363fe7e115', 'photo-1600607687644-c7171b42498f', 'photo-1556909114-f6e7ad7d3136'),
    yearBuilt: 2019, parking: 2, featured: false, rating: 4.6, views: 1120,
  },
  {
    slug: 'westlands-parkview-one-bed-rental',
    title: 'Furnished 1 bedroom apartment to let in Westlands',
    description: 'Bright, fully furnished one bedroom on a quiet Parklands-side court, five minutes from Sarit Centre. Rent covers gym and pool access, weekly grounds service, water and backup power. Ideal for a young professional or consultant on a city contract.',
    type: 'APARTMENT', status: 'FOR_RENT', priceKes: 95000, bedrooms: 1, bathrooms: 1, sqm: 68,
    address: '1st Parklands Avenue, Westlands', nb: 'westlands', agent: 'xavier-kariuki', dx: 0.001, dy: -0.002,
    amenities: [...AMEN.apt, 'Fully furnished'],
    images: S('photo-1560448075-bb485b067938', 'photo-1522708323590-d24dbb6b0267', 'photo-1584622650111-993a426fbf0a', 'photo-1560185127-6ed189bf02f4'),
    yearBuilt: 2022, parking: 1, featured: false, rating: 4.5, views: 540,
  },
  {
    slug: 'westlands-towers-offplan',
    title: 'New development: 2, 3 & 4 bedroom smart apartments with sky deck in Westlands',
    description: 'A 28-storey landmark rising on Mpaka Road with a 26th-floor sky deck, infinity pool and residents\' lounge. Smart-home ready units, borehole plus city water, full backup generation and fibre to every unit. 10% deposit secures a unit on the 30/40/30 payment plan; completion Q4 2027.',
    type: 'APARTMENT', status: 'NEW_DEVELOPMENT', priceKes: 14500000, bedrooms: 3, bathrooms: 2.5, sqm: 168,
    address: 'Mpaka Road, Westlands', nb: 'westlands', agent: 'david-mwangi', dx: -0.001, dy: 0.001,
    amenities: [...AMEN.apt, 'Sky deck', 'Smart home ready', 'EV charging'],
    images: S('photo-1486406146926-c627a92ad1ab', 'photo-1522708323590-d24dbb6b0267', 'photo-1556912173-3bb406ef7e77', 'photo-1600573472550-8090b5e0745e', 'photo-1560448204-e02f11c3d0e2'),
    yearBuilt: 2027, parking: 2, featured: true, rating: 4.8, views: 1670,
  },
  {
    slug: 'westlands-mpaka-sold-apartment',
    title: 'Just sold — 3 bedroom apartment with DSQ in Mpaka Road, Westlands',
    description: 'Sold above asking in eleven days — a measure of how fast well-priced Westlands stock moves. The apartment offered three en-suite bedrooms, a DSQ, and a balcony over the Mpaka canopy. Register with our agents for the next release in this corridor.',
    type: 'APARTMENT', status: 'SOLD', priceKes: 31000000, bedrooms: 3, bathrooms: 3, sqm: 195,
    address: 'Mpaka Road, Westlands', nb: 'westlands', agent: 'xavier-kariuki', dx: 0.002, dy: 0.002,
    amenities: AMEN.apt,
    images: S('photo-1448630360428-65456885c650', 'photo-1493809842364-78817add7ffb', 'photo-1560184897-ae75f418493e', 'photo-1600607688066-890987f18a86'),
    yearBuilt: 2018, parking: 2, featured: false, rating: 4.6, views: 980,
  },

  // ================= KILIMANI (7) =================
  {
    slug: 'the-argyle-kilimani-skyline',
    title: 'Contemporary 3 bedroom apartment with skyline views in Kilimani',
    description: 'Twelfth-floor residence facing Nairobi\'s skyline with uninterrupted views of the KICC and beyond. The interior balances Italian minimalism with Kenyan warmth — oak floors, matte-black fixtures, and a wrap balcony. Building amenities: infinity pool, sky gym, residents\' lounge.',
    type: 'APARTMENT', status: 'FOR_SALE', priceKes: 19500000, bedrooms: 3, bathrooms: 2.5, sqm: 186,
    address: 'Argwings Kodhek Road, Kilimani', nb: 'kilimani', agent: 'xavier-kariuki', dx: 0.001, dy: 0.001,
    amenities: [...AMEN.apt, 'Sky lounge'],
    images: S('photo-1545324418-cc1a3fa10c00', 'photo-1560448204-e02f11c3d0e2', 'photo-1567767292278-a4f21aa2d36e', 'photo-1600607687939-ce8a6c25118c', 'photo-1560185007-cde436f6a4d0'),
    yearBuilt: 2022, parking: 2, featured: true, rating: 4.8, views: 1980,
  },
  {
    slug: 'yaya-paradise-two-bed',
    title: 'Turnkey 2 bedroom apartment for sale near Yaya Centre, Kilimani',
    description: 'A turnkey two-bedroom beside Yaya Centre, styled by Nairobi\'s top stagers for the short-let market. Current licence yields 9.1% gross. Furniture package included; handover in 30 days.',
    type: 'APARTMENT', status: 'FOR_SALE', priceKes: 13500000, bedrooms: 2, bathrooms: 2, sqm: 112,
    address: 'Wood Avenue, Kilimani', nb: 'kilimani', agent: 'xavier-kariuki', dx: -0.001, dy: -0.001,
    amenities: [...AMEN.apt, 'Short-let licence', 'Furniture included'],
    images: S('photo-1522708323590-d24dbb6b0267', 'photo-1554995207-c18c203602cb', 'photo-1493809842364-78817add7ffb', 'photo-1505691938895-1758d7feb511', 'photo-1584622650111-993a426fbf0a'),
    yearBuilt: 2019, parking: 1, featured: false, rating: 4.5, views: 1310,
  },
  {
    slug: 'kilimani-garden-lofts',
    title: 'Unique 2 bedroom garden loft with private courtyard in Kilimani',
    description: 'Ground-floor loft opening onto a private courtyard garden — a rarity in high-rise Kilimani. Double-height living space, loft study, and direct pool-deck access. Pet friendly.',
    type: 'APARTMENT', status: 'FOR_SALE', priceKes: 16900000, bedrooms: 2, bathrooms: 2, sqm: 134,
    address: 'Kingara Road, Kilimani', nb: 'kilimani', agent: 'david-mwangi', dx: 0.001, dy: -0.002,
    amenities: [...AMEN.apt, 'Private courtyard', 'Pet friendly'],
    images: S('photo-1502672260266-1c1ef2d93688', 'photo-1560185007-cde436f6a4d0', 'photo-1600566752355-35792bedcfea', 'photo-1556909114-f6e7ad7d3136', 'photo-1600210492486-724fe5c67fb0'),
    yearBuilt: 2021, parking: 1, featured: false, rating: 4.6, views: 760,
  },
  {
    slug: 'cassia-heights-rental',
    title: 'Spacious 3 bedroom apartment for rent in Kilimani',
    description: 'Spacious three-bedroom rental on the quiet side of Kilimani with a children\'s playground, pool and gym. Walking distance to schools on Oloitokitok Road; offered with 12-month lease and one-month deposit.',
    type: 'APARTMENT', status: 'FOR_RENT', priceKes: 145000, bedrooms: 3, bathrooms: 3, sqm: 176,
    address: 'Oloitokitok Road, Kilimani', nb: 'kilimani', agent: 'zawadi-njoroge', dx: -0.002, dy: 0.001,
    amenities: [...AMEN.apt, 'Children\'s playground'],
    images: S('photo-1560448204-e02f11c3d0e2', 'photo-1502672260266-1c1ef2d93688', 'photo-1600585154526-990dced4db0d', 'photo-1560185008-b033106af5c3', 'photo-1560448205-4d9b3e6bb6db'),
    yearBuilt: 2018, parking: 2, featured: false, rating: 4.5, views: 640,
  },
  {
    slug: 'kilimani-modern-two-bed-balcony',
    title: 'Modern 2 bedroom apartment with balcony in Kilimani',
    description: 'A crisp, newly completed two bedroom on Wood Avenue with a generous balcony framing the Nairobi skyline. All en-suite, fitted kitchen with breakfast island, borehole and backup generator in the building. Walk to Yaya Centre in five minutes.',
    type: 'APARTMENT', status: 'FOR_SALE', priceKes: 12500000, bedrooms: 2, bathrooms: 2, sqm: 108,
    address: 'Wood Avenue, Kilimani', nb: 'kilimani', agent: 'xavier-kariuki', dx: -0.002, dy: -0.002,
    amenities: [...AMEN.apt, 'Breakfast island'],
    images: S('photo-1460317442991-0ec209397118', 'photo-1502672260266-1c1ef2d93688', 'photo-1493809842364-78817add7ffb', 'photo-1505693416388-ac5ce068fe85', 'photo-1584622650111-993a426fbf0a'),
    yearBuilt: 2023, parking: 1, featured: true, rating: 4.6, views: 720,
  },
  {
    slug: 'kilimani-luxury-three-bed-rental',
    title: 'Luxurious 3 bedroom apartment plus DSQ for rent in Kilimani',
    description: 'High-spec family rental on Kindaruma Road: three en-suite bedrooms plus DSQ, imported fitted kitchen, and a lounge that opens to a balcony with sunset views. Amenities include heated pool, gym, children\'s play area and 24/7 manned security.',
    type: 'APARTMENT', status: 'FOR_RENT', priceKes: 160000, bedrooms: 3, bathrooms: 3, sqm: 185,
    address: 'Kindaruma Road, Kilimani', nb: 'kilimani', agent: 'zawadi-njoroge', dx: 0.002, dy: 0.002,
    amenities: [...AMEN.apt, 'DSQ', 'Heated pool'],
    images: S('photo-1545324418-cc1a3fa10c00', 'photo-1554995207-c18c203602cb', 'photo-1600607687920-4e2a09cf159d', 'photo-1560185127-6ed189bf02f4', 'photo-1600573472592-401b489a3cdc'),
    yearBuilt: 2021, parking: 2, featured: false, rating: 4.7, views: 690,
  },
  {
    slug: 'kilimani-the-ava-new-release',
    title: 'New release: 3 bedroom apartments with rooftop pool in Kilimani',
    description: 'Final release at The Ava — twelve residences with rooftop pool, sky gym and panoramic lounge. Units feature all en-suite bedrooms, DSQ, and imported kitchens. Borehole, generator and fibre standard. Ready-title purchase with optional rental management on handover.',
    type: 'APARTMENT', status: 'NEW_DEVELOPMENT', priceKes: 18500000, bedrooms: 3, bathrooms: 3, sqm: 172,
    address: 'Kingara Road, Kilimani', nb: 'kilimani', agent: 'david-mwangi', dx: -0.001, dy: 0.002,
    amenities: [...AMEN.apt, 'Rooftop pool', 'DSQ'],
    images: S('photo-1567767292278-a4f21aa2d36e', 'photo-1522708323590-d24dbb6b0267', 'photo-1521783988139-89397d761dce', 'photo-1556912173-3bb406ef7e77', 'photo-1600607687644-c7171b42498f'),
    yearBuilt: 2026, parking: 2, featured: true, rating: 4.8, views: 1430,
  },

  // ================= KAREN (6) =================
  {
    slug: 'ngong-view-estates-karen',
    title: 'Majestic 5 bedroom villa on 1.2 acres with infinity pool in Karen',
    description: 'A five-bedroom manor on 1.2 acres of mature indigenous garden, with the Ngong Hills framed from the veranda. Heated infinity pool, wine cellar, cinema room, and staff quarters. Fully walled with electric fence and ADS monitoring.',
    type: 'VILLA', status: 'FOR_SALE', priceKes: 195000000, bedrooms: 5, bathrooms: 6, sqm: 780,
    address: 'Karen Road, Karen', nb: 'karen', agent: 'amara-otieno', dx: 0.002, dy: 0.002,
    amenities: [...AMEN.villa, 'Wine cellar', '1.2-acre garden'],
    images: S('photo-1600596542815-ffad4c1539a9', 'photo-1600607687939-ce8a6c25118c', 'photo-1600566753086-00f18fb6b3ea', 'photo-1600573472592-401b489a3cdc', 'photo-1600121848594-d8644e57abab'),
    yearBuilt: 2017, parking: 4, featured: true, rating: 5.0, views: 3420,
  },
  {
    slug: 'karen-hardy-garden-villa',
    title: 'Charming 4 bedroom villa with self-contained cottage in Hardy, Karen',
    description: 'A mid-century villa restored to museum standard in Hardy\'s most coveted lane. Teak joinery, original fireplaces, and a kitchen that opens to the rose garden. Four bedrooms plus a self-contained cottage.',
    type: 'VILLA', status: 'FOR_SALE', priceKes: 128000000, bedrooms: 4, bathrooms: 4.5, sqm: 520,
    address: 'Hardy, Karen', nb: 'karen', agent: 'amara-otieno', dx: -0.002, dy: 0.001,
    amenities: [...AMEN.villa, 'Self-contained cottage'],
    images: S('photo-1600047509807-ba8f99d2cdde', 'photo-1600585152220-90363fe7e115', 'photo-1583608205776-bfd35f0d9f83', 'photo-1505691938895-1758d7feb511', 'photo-1600607688066-890987f18a86'),
    yearBuilt: 1965, parking: 3, featured: true, rating: 4.9, views: 2170,
  },
  {
    slug: 'karen-blixen-coffee-house',
    title: 'Countryside 4 bedroom residence on a working coffee farm in Karen',
    description: 'Set within a working coffee smallholding, this residence offers countryside living ten minutes from Karen centre. Wrap veranda, stables, and a one-acre shamba with avocado and macadamia.',
    type: 'VILLA', status: 'FOR_SALE', priceKes: 95000000, bedrooms: 4, bathrooms: 4, sqm: 460,
    address: 'Blixen, Karen', nb: 'karen', agent: 'neema-wanjiru', dx: 0.001, dy: -0.002,
    amenities: [...AMEN.lux, 'Stables', 'Coffee shamba'],
    images: S('photo-1583608205776-bfd35f0d9f83', 'photo-1560184897-ae75f418493e', 'photo-1570129477492-45c003edd2be', 'photo-1600563438938-a9a27216b4f5', 'photo-1600210491892-03d54c0aaf87'),
    yearBuilt: 2008, parking: 3, featured: false, rating: 4.7, views: 1240,
  },
  {
    slug: 'karen-bogani-sold-villa',
    title: 'Just sold — elegant 4 bedroom villa on half acre in Karen (Bogani)',
    description: 'Closed at 110M after a two-week competitive process — proof of demand for Bogani-side villas under 120M. The home offered four en-suite bedrooms, a cottage office, and a half-acre of mature garden. Ask our Karen desk for upcoming off-market stock.',
    type: 'VILLA', status: 'SOLD', priceKes: 110000000, bedrooms: 4, bathrooms: 4.5, sqm: 430,
    address: 'Bogani East Road, Karen', nb: 'karen', agent: 'amara-otieno', dx: -0.001, dy: -0.001,
    amenities: [...AMEN.villa, 'Home office'],
    images: S('photo-1592595896551-12b371d546d5', 'photo-1600585154526-990dced4db0d', 'photo-1600607688969-a5bfcd646154', 'photo-1600573472550-8090b5e0745e', 'photo-1556912173-3bb406ef7e77'),
    yearBuilt: 2014, parking: 3, featured: false, rating: 4.8, views: 1610,
  },
  {
    slug: 'karen-garden-cottage-rental',
    title: 'Cosy 3 bedroom garden cottage for rent in Karen',
    description: 'A charming cottage on a private Karen compound, opening to its own slice of garden under acacias. Three bedrooms, sunroom study, and off-road parking. Ideal for a small family or expat couple; ten minutes to Karen Country Club and The Hub.',
    type: 'VILLA', status: 'FOR_RENT', priceKes: 120000, bedrooms: 3, bathrooms: 2, sqm: 160,
    address: 'Marula Lane, Karen', nb: 'karen', agent: 'amara-otieno', dx: 0.002, dy: -0.001,
    amenities: [...AMEN.town, 'Fireplace', 'Pet friendly'],
    images: S('photo-1502005229762-cf1b2da7c5d6', 'photo-1560185007-cde436f6a4d0', 'photo-1584622650111-993a426fbf0a', 'photo-1600585152915-d208bec867a1'),
    yearBuilt: 1998, parking: 2, featured: false, rating: 4.5, views: 470,
  },
  {
    slug: 'karen-woodland-gated-estate',
    title: 'New development: gated estate of 6 villas on Karen\'s forest edge',
    description: 'Six architect-designed villas set on an acre apiece along Karen\'s forest edge, each with heated pool, cinema room and staff quarters. Sandstone and glass facades under mature indigenous trees. Phase-one buyers choose finishes; completion staged through 2027.',
    type: 'VILLA', status: 'NEW_DEVELOPMENT', priceKes: 165000000, bedrooms: 5, bathrooms: 5.5, sqm: 550,
    address: 'Pottery Lane, Karen', nb: 'karen', agent: 'amara-otieno', dx: -0.002, dy: 0.002,
    amenities: [...AMEN.villa, 'Gated community', '1-acre plots'],
    images: S('photo-1564013799919-ab600027ffc6', 'photo-1600566753190-17f0baa2a6c3', 'photo-1600566752355-35792bedcfea', 'photo-1600121848594-d8644e57abab', 'photo-1600563438938-a9a27216b4f5'),
    yearBuilt: 2027, parking: 4, featured: true, rating: 4.9, views: 1280,
  },

  // ================= MUTHAIGA (3) =================
  {
    slug: 'muthaiga-country-manor',
    title: 'Grand 6 bedroom Georgian manor near Muthaiga Country Club',
    description: 'A Georgian-revival manor moments from the Muthaiga Country Club. Ballroom-scaled reception rooms, six bedroom suites, and formal gardens with a croquet lawn. Sold with club membership introduction.',
    type: 'VILLA', status: 'FOR_SALE', priceKes: 265000000, bedrooms: 6, bathrooms: 7, sqm: 940,
    address: 'Muthaiga Road, Muthaiga', nb: 'muthaiga', agent: 'amara-otieno', dx: 0.002, dy: 0.001,
    amenities: [...AMEN.villa, 'Croquet lawn', 'Club membership intro'],
    images: S('photo-1600585154340-be6161a56a0c', 'photo-1600607687920-4e2a09cf159d', 'photo-1580587771525-78b9dba3b914', 'photo-1600573472592-401b489a3cdc', 'photo-1600607688969-a5bfcd646154'),
    yearBuilt: 1998, parking: 5, featured: true, rating: 5.0, views: 2890,
  },
  {
    slug: 'muthaiga-blackstone-villa',
    title: 'Contemporary 5 bedroom stone villa in Muthaiga North',
    description: 'Contemporary stone villa with double-volume atrium and gallery lighting. Five suites, a rooftop study terrace, and backup infrastructure rated for full off-grid days. UN-commuter ready with Thika Superhighway access.',
    type: 'VILLA', status: 'FOR_SALE', priceKes: 158000000, bedrooms: 5, bathrooms: 5.5, sqm: 610,
    address: 'Blackstone Drive, Muthaiga', nb: 'muthaiga', agent: 'brian-kimani', dx: -0.001, dy: -0.002,
    amenities: [...AMEN.villa, 'Rooftop study'],
    images: S('photo-1613977257363-707ba9348227', 'photo-1600210492486-724fe5c67fb0', 'photo-1600566753190-17f0baa2a6c3', 'photo-1600607687939-ce8a6c25118c', 'photo-1560185127-6ed189bf02f4'),
    yearBuilt: 2020, parking: 4, featured: false, rating: 4.8, views: 1560,
  },
  {
    slug: 'muthaiga-classic-family-villa',
    title: 'Classic 5 bedroom villa plus SQ for sale in Muthaiga',
    description: 'A well-proportioned family villa on a fifth of an acre in old Muthaiga. Five bedrooms plus DSQ, sunken lounge with fireplace, and a rear garden with room for a pool. Two minutes to the joining roundabout for the city or UN.',
    type: 'VILLA', status: 'FOR_SALE', priceKes: 92000000, bedrooms: 5, bathrooms: 5, sqm: 470,
    address: 'Old Muthaiga, Muthaiga', nb: 'muthaiga', agent: 'amara-otieno', dx: -0.002, dy: 0.002,
    amenities: [...AMEN.lux, 'Fireplace', 'Solar water heating'],
    images: S('photo-1570129477492-45c003edd2be', 'photo-1600607687920-4e2a09cf159d', 'photo-1560184897-ae75f418493e', 'photo-1584622650111-993a426fbf0a', 'photo-1598228723793-52759bba239c'),
    yearBuilt: 2006, parking: 3, featured: false, rating: 4.7, views: 1010,
  },

  // ================= RUNDA (5) =================
  {
    slug: 'runda-whispers-townhouse',
    title: 'Elegant 5 bedroom townhouse in a gated community, Runda (Whispers)',
    description: 'A five-storey family home on Runda\'s premier cul-de-sac. Elevator-served floors, DSQ and guest wing, and a rooftop terrace with city views. Gated community of eight with shared greens.',
    type: 'TOWNHOUSE', status: 'FOR_SALE', priceKes: 88000000, bedrooms: 5, bathrooms: 5, sqm: 430,
    address: 'Whispers Avenue, Runda', nb: 'runda', agent: 'zawadi-njoroge', dx: 0.001, dy: 0.002,
    amenities: [...AMEN.lux, 'Private elevator', 'Gated community'],
    images: S('photo-1600566753086-00f18fb6b3ea', 'photo-1600585154340-be6161a56a0c', 'photo-1560185007-cde436f6a4d0', 'photo-1600607687644-c7171b42498f', 'photo-1600585153490-76fb20a32601'),
    yearBuilt: 2021, parking: 3, featured: true, rating: 4.9, views: 1890,
  },
  {
    slug: 'runda-mhasibu-villa',
    title: 'Classic 5 bedroom family villa with DSQ in Runda',
    description: 'The definitive Runda family villa: four public rooms, six bedrooms with DSQ wing, and a garden built for children and dogs. Solar water heating, borehole, and full perimeter security.',
    type: 'VILLA', status: 'FOR_SALE', priceKes: 112000000, bedrooms: 5, bathrooms: 6, sqm: 520,
    address: 'Mhasibu Crescent, Runda', nb: 'runda', agent: 'zawadi-njoroge', dx: -0.001, dy: -0.001,
    amenities: [...AMEN.villa, 'Children\'s garden'],
    images: S('photo-1570129477492-45c003edd2be', 'photo-1580587771525-78b9dba3b914', 'photo-1560184897-ae75f418493e', 'photo-1600210491892-03d54c0aaf87', 'photo-1584622650111-993a426fbf0a'),
    yearBuilt: 2012, parking: 4, featured: false, rating: 4.8, views: 1420,
  },
  {
    slug: 'runda-lakeview-rental',
    title: 'Furnished 4 bedroom villa to let in a gated court, Runda',
    description: 'Furnished four-bedroom villa in a gated court of six, available on a two-year lease. Includes gym share, pool, generator, and gardener. Ten minutes to ISK and UN Gigiri.',
    type: 'VILLA', status: 'FOR_RENT', priceKes: 420000, bedrooms: 4, bathrooms: 4.5, sqm: 400,
    address: 'Lakeview Court, Runda', nb: 'runda', agent: 'xavier-kariuki', dx: 0.002, dy: -0.002,
    amenities: [...AMEN.lux, 'Furnished', 'Gym share'],
    images: S('photo-1600585152220-90363fe7e115', 'photo-1600566752355-35792bedcfea', 'photo-1600607688969-a5bfcd646154', 'photo-1493809842364-78817add7ffb'),
    yearBuilt: 2016, parking: 3, featured: false, rating: 4.7, views: 980,
  },
  {
    slug: 'runda-executive-townhouse',
    title: 'Executive 5 bedroom townhouse in Runda',
    description: 'An executive five bedroom townhouse finished to a high standard on a quiet Runda drive. All en-suite bedrooms, family room, DSQ, and a private rear garden. Borehole, backup generator and solar water heating; walking distance to Runda Mhasibu shopping.',
    type: 'TOWNHOUSE', status: 'FOR_SALE', priceKes: 75000000, bedrooms: 5, bathrooms: 4.5, sqm: 340,
    address: 'Kigwaru Drive, Runda', nb: 'runda', agent: 'zawadi-njoroge', dx: 0.002, dy: 0.001,
    amenities: [...AMEN.town, 'Family room'],
    images: S('photo-1598228723793-52759bba239c', 'photo-1600573472592-401b489a3cdc', 'photo-1505693416388-ac5ce068fe85', 'photo-1556909114-f6e7ad7d3136', 'photo-1600607688066-890987f18a86'),
    yearBuilt: 2018, parking: 3, featured: false, rating: 4.7, views: 1150,
  },
  {
    slug: 'runda-mhasibu-new-villas',
    title: 'New development: 4 bedroom all en-suite villas plus SQ in Runda',
    description: 'A boutique release of eight contemporary villas off Mhasibu Crescent — four bedrooms all en-suite, DSQ, double garage and private garden. Borehole, solar hybrid power and fibre as standard. Off-plan pricing with 20% deposit; completion mid-2027.',
    type: 'VILLA', status: 'NEW_DEVELOPMENT', priceKes: 135000000, bedrooms: 4, bathrooms: 4.5, sqm: 380,
    address: 'Mhasibu Crescent, Runda', nb: 'runda', agent: 'brian-kimani', dx: -0.002, dy: 0.001,
    amenities: [...AMEN.villa, 'Gated community', 'Double garage'],
    images: S('photo-1605276374104-dee2a0ed3cd6', 'photo-1600566753190-17f0baa2a6c3', 'photo-1600585154084-4e5fe7c39198', 'photo-1600585154526-990dced4db0d', 'photo-1600607687920-4e2a09cf159d'),
    yearBuilt: 2027, parking: 3, featured: true, rating: 4.8, views: 1340,
  },

  // ================= KILELESHWA (4) =================
  {
    slug: 'kileleshwa-oloo-gap-apartment',
    title: 'Bright 3 bedroom apartment (all en-suite) in Kileleshwa',
    description: 'First-floor apartment opening to a shared resident garden, in a boutique block of twelve on Kileleshwa\'s family mile. Three bedrooms, all en-suite, with a kitchen breakfast bay. Walking distance to Kenya High.',
    type: 'APARTMENT', status: 'FOR_SALE', priceKes: 15500000, bedrooms: 3, bathrooms: 3, sqm: 165,
    address: 'Oloitokitok Road, Kileleshwa', nb: 'kileleshwa', agent: 'zawadi-njoroge', dx: 0.001, dy: 0.001,
    amenities: AMEN.apt,
    images: S('photo-1560448204-e02f11c3d0e2', 'photo-1522708323590-d24dbb6b0267', 'photo-1493809842364-78817add7ffb', 'photo-1505691938895-1758d7feb511', 'photo-1560448205-4d9b3e6bb6db'),
    yearBuilt: 2017, parking: 2, featured: false, rating: 4.6, views: 1090,
  },
  {
    slug: 'kileleshwa-dennis-penthouse',
    title: 'Duplex 4 bedroom penthouse with private roof terrace in Kileleshwa',
    description: 'A duplex penthouse with a spiral stair to its private roof terrace — BBQ deck, 360° sundowner views. Interior in travertine and smoked oak with a double-height lounge.',
    type: 'PENTHOUSE', status: 'FOR_SALE', priceKes: 42000000, bedrooms: 4, bathrooms: 4, sqm: 340,
    address: 'Dennis Pritt Road, Kileleshwa', nb: 'kileleshwa', agent: 'david-mwangi', dx: -0.002, dy: 0.002,
    amenities: [...AMEN.apt, 'Private roof terrace', 'Duplex'],
    images: S('photo-1512917774080-9991f1c4c750', 'photo-1600607687939-ce8a6c25118c', 'photo-1600210492486-724fe5c67fb0', 'photo-1600607688969-a5bfcd646154', 'photo-1521783988139-89397d761dce'),
    yearBuilt: 2020, parking: 2, featured: true, rating: 4.8, views: 1730,
  },
  {
    slug: 'kileleshwa-lavantille-townhouse',
    title: '4 bedroom townhouse with wraparound garden in Kileleshwa',
    description: 'An end-unit townhouse with a wrap garden on a quiet Kileleshwa lane. Four bedrooms plus DSQ, family room, and a lock-up garage. Ideal first family home with Strathmore in reach.',
    type: 'TOWNHOUSE', status: 'FOR_SALE', priceKes: 32500000, bedrooms: 4, bathrooms: 3.5, sqm: 250,
    address: 'Lavantille Court, Kileleshwa', nb: 'kileleshwa', agent: 'zawadi-njoroge', dx: 0.002, dy: -0.001,
    amenities: [...AMEN.lux, 'Lock-up garage'],
    images: S('photo-1560185007-cde436f6a4d0', 'photo-1600585154526-990dced4db0d', 'photo-1600566753086-00f18fb6b3ea', 'photo-1556909114-f6e7ad7d3136'),
    yearBuilt: 2015, parking: 2, featured: false, rating: 4.5, views: 830,
  },
  {
    slug: 'kileleshwa-sold-townhouse',
    title: 'Sold in 3 weeks — 4 bedroom townhouse with DSQ in Kileleshwa',
    description: 'A clean, well-priced family townhouse that drew four offers in its first fortnight and closed within three weeks of listing. Four bedrooms plus DSQ on a gated lane off Gatundu Road. Contact Zawadi for the next Kileleshwa townhouse coming to market.',
    type: 'TOWNHOUSE', status: 'SOLD', priceKes: 38500000, bedrooms: 4, bathrooms: 3.5, sqm: 255,
    address: 'Gatundu Road, Kileleshwa', nb: 'kileleshwa', agent: 'zawadi-njoroge', dx: -0.001, dy: 0.002,
    amenities: AMEN.town,
    images: S('photo-1600573472550-8090b5e0745e', 'photo-1560185008-b033106af5c3', 'photo-1505693416388-ac5ce068fe85', 'photo-1493809842364-78817add7ffb'),
    yearBuilt: 2016, parking: 2, featured: false, rating: 4.6, views: 870,
  },

  // ================= LORESHO (3) =================
  {
    slug: 'loresho-ridge-architect-villa',
    title: 'Award-shortlisted 4 bedroom architect villa in Loresho',
    description: 'An award-shortlisted contemporary villa cantilevered over a hillside garden. Concrete, glass and teak volumes open to a 25-metre lap pool. Four suites, studio annexe, and full smart-home. Published in AD Africa.',
    type: 'VILLA', status: 'FOR_SALE', priceKes: 145000000, bedrooms: 4, bathrooms: 5, sqm: 560,
    address: 'Loresho Ridge, Loresho', nb: 'loresho', agent: 'brian-kimani', dx: 0.001, dy: 0.002,
    amenities: [...AMEN.villa, '25m lap pool', 'Studio annexe', 'Smart home'],
    images: S('photo-1613490493576-7fde63acd811', 'photo-1600607687920-4e2a09cf159d', 'photo-1600607688969-a5bfcd646154', 'photo-1600210492486-724fe5c67fb0', 'photo-1600121848594-d8644e57abab'),
    yearBuilt: 2019, parking: 3, featured: true, rating: 4.9, views: 2460,
  },
  {
    slug: 'loresho-mivue-townhouse',
    title: 'Scandinavian-style 4 bedroom townhouse in Loresho (Mivue Gardens)',
    description: 'A Scandinavian-inspired townhouse in a boutique court of six. Oak stair, hidden kitchen, garden studio and EV-ready garage. Low service charge with communal borehole.',
    type: 'TOWNHOUSE', status: 'FOR_SALE', priceKes: 62000000, bedrooms: 4, bathrooms: 3.5, sqm: 290,
    address: 'Mivue Gardens, Loresho', nb: 'loresho', agent: 'brian-kimani', dx: -0.002, dy: -0.001,
    amenities: [...AMEN.lux, 'EV-ready garage'],
    images: S('photo-1600585152220-90363fe7e115', 'photo-1600566753190-17f0baa2a6c3', 'photo-1600566752355-35792bedcfea', 'photo-1600585152915-d208bec867a1'),
    yearBuilt: 2022, parking: 2, featured: false, rating: 4.7, views: 1180,
  },
  {
    slug: 'loresho-hillside-villa-rental',
    title: 'Serene 4 bedroom villa to let with city views in Loresho',
    description: 'A calm, light-filled villa on Loresho\'s hillside, available furnished or unfurnished. Four bedrooms, veranda dining, and a lawn with city-gap views toward the tower line. Includes gardener and 24/7 estate security; pets welcome.',
    type: 'VILLA', status: 'FOR_RENT', priceKes: 320000, bedrooms: 4, bathrooms: 4, sqm: 360,
    address: 'Loresho Way, Loresho', nb: 'loresho', agent: 'brian-kimani', dx: 0.002, dy: -0.002,
    amenities: [...AMEN.town, 'Veranda', 'Pet friendly'],
    images: S('photo-1518780664697-55e3ad937233', 'photo-1600585153490-76fb20a32601', 'photo-1600607687644-c7171b42498f', 'photo-1584622650111-993a426fbf0a'),
    yearBuilt: 2015, parking: 3, featured: false, rating: 4.6, views: 610,
  },

  // ================= KITISURU (3) =================
  {
    slug: 'kitisuru-ivystone-villa',
    title: 'Timeless 5 bedroom stone villa on two-thirds acre in Kitisuru',
    description: 'A stone-clad villa on two-thirds of an acre in embassy-adjacent Kitisuru. Tall sash windows, a carved staircase, and a veranda for year-round dining. Five bedrooms, cottage DSQ, mature mango trees.',
    type: 'VILLA', status: 'FOR_SALE', priceKes: 105000000, bedrooms: 5, bathrooms: 5, sqm: 480,
    address: 'Ivystone Lane, Kitisuru', nb: 'kitisuru', agent: 'neema-wanjiru', dx: 0.001, dy: 0.001,
    amenities: [...AMEN.lux, 'Cottage DSQ', 'Two-thirds acre'],
    images: S('photo-1600047509807-ba8f99d2cdde', 'photo-1583608205776-bfd35f0d9f83', 'photo-1570129477492-45c003edd2be', 'photo-1600573472592-401b489a3cdc', 'photo-1505691938895-1758d7feb511'),
    yearBuilt: 2005, parking: 3, featured: false, rating: 4.8, views: 1350,
  },
  {
    slug: 'kitisuru-garden-estate-rental',
    title: '6 bedroom estate home with tennis court for rent in Kitisuru',
    description: 'A six-bedroom estate home for the diplomatic lease market, on one full acre with a tennis court and staff wing. Offered furnished or unfurnished with 3-year lease terms.',
    type: 'VILLA', status: 'FOR_RENT', priceKes: 450000, bedrooms: 6, bathrooms: 6, sqm: 650,
    address: 'Kitisuru Gardens, Kitisuru', nb: 'kitisuru', agent: 'neema-wanjiru', dx: -0.001, dy: 0.002,
    amenities: [...AMEN.villa, 'Tennis court', 'Staff wing'],
    images: S('photo-1580587771525-78b9dba3b914', 'photo-1560184897-ae75f418493e', 'photo-1600573472592-401b489a3cdc', 'photo-1521783988139-89397d761dce', 'photo-1600210491892-03d54c0aaf87'),
    yearBuilt: 2001, parking: 5, featured: false, rating: 4.7, views: 1020,
  },
  {
    slug: 'kitisuru-quarter-acre-plot',
    title: 'Quarter acre residential plot for sale in Kitisuru',
    description: 'A level, fully fenced quarter-acre (1,011 sqm) building plot on a tarmac Kitisuru lane, ready title deed and perimeter wall complete. Water and mains power at the boundary. Ideal for a private villa or duplex pair; per-plot pricing, two adjacent plots available.',
    type: 'LAND', status: 'FOR_SALE', priceKes: 32000000, bedrooms: 0, bathrooms: 1, sqm: 1011,
    address: 'Gicho Road, Kitisuru', nb: 'kitisuru', agent: 'neema-wanjiru', dx: 0.002, dy: -0.002,
    amenities: AMEN.land,
    images: S('photo-1500076656116-558758c991c1', 'photo-1464146072230-91cabc968266', 'photo-1444858291040-58f756a3bdd6', 'photo-1516426122078-c23e76319801'),
    yearBuilt: 2026, parking: 0, featured: false, rating: 4.6, views: 380,
  },

  // ================= LANGATA (4) =================
  {
    slug: 'langata-oasis-family-home',
    title: '4 bedroom family home with pool under acacias in Langata',
    description: 'Four bedrooms, a pool, and a one-third-acre garden under acacias — the accessible entry to Langata\'s outdoor lifestyle. Ten minutes to The Hub, fifteen to Wilson.',
    type: 'VILLA', status: 'FOR_SALE', priceKes: 48000000, bedrooms: 4, bathrooms: 3.5, sqm: 300,
    address: 'Oasis Road, Langata', nb: 'langata', agent: 'neema-wanjiru', dx: 0.002, dy: 0.001,
    amenities: [...AMEN.lux, 'Acacia garden'],
    images: S('photo-1570129477492-45c003edd2be', 'photo-1560185007-cde436f6a4d0', 'photo-1580587771525-78b9dba3b914', 'photo-1600563438938-a9a27216b4f5', 'photo-1600585154084-4e5fe7c39198'),
    yearBuilt: 2010, parking: 2, featured: false, rating: 4.6, views: 1210,
  },
  {
    slug: 'langata-parkviews-equestrian',
    title: 'Equestrian property with stables on 2 acres bordering Nairobi National Park, Langata',
    description: 'Two acres bordering the National Park with stables, paddock and tack room. The residence is a comfortable four-bedroom ranch; the land is the prize. Giraffe at the fence at dusk.',
    type: 'VILLA', status: 'FOR_SALE', priceKes: 89000000, bedrooms: 4, bathrooms: 4, sqm: 420,
    address: 'Parkviews, Langata', nb: 'langata', agent: 'neema-wanjiru', dx: -0.002, dy: -0.002,
    amenities: [...AMEN.lux, 'Stables & paddock', '2-acre plot'],
    images: S('photo-1583608205776-bfd35f0d9f83', 'photo-1560184897-ae75f418493e', 'photo-1600585152220-90363fe7e115', 'photo-1516426122078-c23e76319801', 'photo-1449844908441-8829872d2607'),
    yearBuilt: 1996, parking: 3, featured: true, rating: 4.9, views: 2050,
  },
  {
    slug: 'langata-sunbird-apartment',
    title: 'Bright 2 bedroom apartment (lock-up & go) in Langata',
    description: 'A bright two-bedroom on a gated Langata court with pool and clubhouse. Ideal first home or pied-à-terre for Wilson-based pilots. Borehole and generator; service charge KES 8,000/month.',
    type: 'APARTMENT', status: 'FOR_SALE', priceKes: 9800000, bedrooms: 2, bathrooms: 2, sqm: 98,
    address: 'Sunbird Court, Langata', nb: 'langata', agent: 'xavier-kariuki', dx: 0.001, dy: -0.001,
    amenities: [...AMEN.apt, 'Clubhouse'],
    images: S('photo-1502672260266-1c1ef2d93688', 'photo-1554995207-c18c203602cb', 'photo-1522708323590-d24dbb6b0267', 'photo-1560185127-6ed189bf02f4', 'photo-1560448075-bb485b067938'),
    yearBuilt: 2018, parking: 1, featured: false, rating: 4.4, views: 720,
  },
  {
    slug: 'langata-half-acre-plot',
    title: 'Half acre residential plot for sale in Langata (Ngeche)',
    description: 'A gentle-sloping half-acre (2,023 sqm) residential plot in the Ngeche side of Langata, minutes from The Hub and Langata Baptist. Perimeter-wall on two sides, access off a graded all-weather road, ready title. Priced per plot — the seller holds three contiguous plots.',
    type: 'LAND', status: 'FOR_SALE', priceKes: 22000000, bedrooms: 0, bathrooms: 1, sqm: 2023,
    address: 'Ngeche Estate, Langata', nb: 'langata', agent: 'neema-wanjiru', dx: -0.001, dy: 0.002,
    amenities: AMEN.land,
    images: S('photo-1500382017468-9049fed747ef', 'photo-1500076656116-558758c991c1', 'photo-1523712999610-f77fbcfc3843', 'photo-1441974231531-c6227db76b6e'),
    yearBuilt: 2026, parking: 0, featured: false, rating: 4.5, views: 410,
  },
]

const leadSeed = [
  { name: 'Grace Wambui', email: 'grace.wambui@example.com', phone: '+254 712 445 190', message: 'Looking for a 4-bedroom in Runda with a DSQ, budget to 95M.', status: 'NEW', source: 'CONTACT_FORM', propertySlug: 'runda-mhasibu-villa', budgetKes: 95000000, score: 78, assignedTo: 'Zawadi Njoroge', notes: [{ at: '2026-09-20T09:12:00Z', author: 'System', text: 'Lead captured from website contact form' }] },
  { name: 'James Otieno', email: 'james.otieno@example.com', phone: '+254 733 881 402', message: 'Diplomatic lease needed from January — 4+ bedrooms, Runda/Kitisuru.', status: 'CONTACTED', source: 'VIEWING_REQUEST', propertySlug: 'kitisuru-garden-estate-rental', budgetKes: 450000, score: 85, assignedTo: 'Neema Wanjiru', notes: [{ at: '2026-09-18T11:00:00Z', author: 'Neema', text: 'Called — UN family, lease starts 5 Jan. Sending shortlist.' }, { at: '2026-09-19T08:30:00Z', author: 'Neema', text: 'Sent 3 villas, viewing booked for Saturday' }] },
  { name: 'Priya Shah', email: 'priya.shah@example.com', phone: '+254 705 233 761', message: 'First-time buyer, pre-approved 14M. 2-bed in Kilimani near Yaya.', status: 'VIEWING', source: 'AI_ASSISTANT', propertySlug: 'yaya-paradise-two-bed', budgetKes: 14000000, score: 72, assignedTo: 'Xavier Kariuki', notes: [{ at: '2026-09-16T15:45:00Z', author: 'AI Assistant', text: 'Matched via NL query "2bed under 14M near Yaya"' }, { at: '2026-09-17T10:20:00Z', author: 'Xavier', text: 'Viewing done — loves unit, negotiating to 13.2M' }] },
  { name: 'Michael Kariuki', email: 'm.kariuki@example.com', phone: '+254 722 909 118', message: 'Selling our Hardy home after relocation. Need valuation first.', status: 'OFFER', source: 'VALUATION', propertySlug: 'karen-hardy-garden-villa', budgetKes: null, score: 91, assignedTo: 'Amara Otieno', notes: [{ at: '2026-09-10T09:00:00Z', author: 'Amara', text: 'Valuation done: 122-131M range. Listed at 128M.' }, { at: '2026-09-14T16:00:00Z', author: 'Amara', text: 'Cash offer 121M on table, reviewing with seller' }] },
  { name: 'Sarah Achieng', email: 'sarah.achieng@example.com', phone: '+254 720 615 033', message: 'Penthouse with city views, 30-45M range. Kileleshwa or Westlands.', status: 'NEW', source: 'AI_ASSISTANT', propertySlug: 'kileleshwa-dennis-penthouse', budgetKes: 45000000, score: 80, assignedTo: null, notes: [] },
  { name: 'Daniel Mutua', email: 'daniel.mutua@example.com', phone: '+254 736 240 875', message: 'Equestrian property search — must have stables.', status: 'CONTACTED', source: 'CONTACT_FORM', propertySlug: 'langata-parkviews-equestrian', budgetKes: 90000000, score: 74, assignedTo: 'Neema Wanjiru', notes: [{ at: '2026-09-15T12:10:00Z', author: 'Neema', text: 'Two options shortlisted, brochure sent' }] },
  { name: 'Amina Hassan', email: 'amina.hassan@example.com', phone: '+254 799 305 224', message: 'Investment: short-let licensed apartments, 12-15M each, x2 units.', status: 'VIEWING', source: 'AI_ASSISTANT', propertySlug: 'yaya-paradise-two-bed', budgetKes: 30000000, score: 88, assignedTo: 'Xavier Kariuki', notes: [{ at: '2026-09-19T14:00:00Z', author: 'Xavier', text: 'Portfolio buyer — viewing both units Friday. Strong prospect.' }] },
  { name: 'Peter Ndegwa', email: 'peter.ndegwa@example.com', phone: '+254 714 552 890', message: 'Land for compound build, Langata/Kitisuru, min 0.5 acre.', status: 'NEW', source: 'CONTACT_FORM', propertySlug: 'langata-half-acre-plot', budgetKes: 35000000, score: 60, assignedTo: null, notes: [] },
  { name: 'Lucy Wanjiru', email: 'lucy.wanjiru@example.com', phone: '+254 728 771 346', message: 'Rental 3-bed Kilimani for family, move-in December.', status: 'CONTACTED', source: 'VIEWING_REQUEST', propertySlug: 'cassia-heights-rental', budgetKes: 150000, score: 65, assignedTo: 'Zawadi Njoroge', notes: [{ at: '2026-09-21T09:40:00Z', author: 'Zawadi', text: 'Confirmed December timeline, sent 2 options' }] },
  { name: 'Robert Bergman', email: 'r.bergman@example.com', phone: '+31 6 2244 8890', message: 'Diaspora investor seeking Karen estate 150M+, remote viewing needed.', status: 'OFFER', source: 'AI_ASSISTANT', propertySlug: 'karen-hardy-garden-villa', budgetKes: 160000000, score: 95, assignedTo: 'Amara Otieno', notes: [{ at: '2026-09-08T17:30:00Z', author: 'Amara', text: 'Video walkthrough completed' }, { at: '2026-09-13T11:15:00Z', author: 'Amara', text: 'Offer 118M — under negotiation, lawyer engaged' }] },
  { name: 'Christine Moraa', email: 'christine.moraa@example.com', phone: '+254 731 628 017', message: 'Loft with courtyard in Kilimani for art collection display.', status: 'LOST', source: 'VIEWING_REQUEST', propertySlug: 'kilimani-garden-lofts', budgetKes: 17000000, score: 55, assignedTo: 'David Mwangi', notes: [{ at: '2026-09-05T10:00:00Z', author: 'David', text: 'Viewed G4 — found a larger option in Lavington. Closed-lost.' }] },
  { name: 'Alex Barasa', email: 'alex.barasa@example.com', phone: '+254 745 118 902', message: 'Office space 200+ sqm Westlands for fintech HQ.', status: 'CLOSED', source: 'CONTACT_FORM', propertySlug: null, budgetKes: 850000, score: 82, assignedTo: 'David Mwangi', notes: [{ at: '2026-08-28T13:00:00Z', author: 'David', text: 'Lease signed for 240 sqm on Rhapta. Commission invoiced.' }] },
  { name: 'Wanjiku Mwangi', email: 'wanjiku.mwangi@example.com', phone: '+254 726 334 518', message: 'Relocating from the CBD — need a 4/5 bedroom townhouse in Runda under 80M.', status: 'NEW', source: 'CONTACT_FORM', propertySlug: 'runda-executive-townhouse', budgetKes: 80000000, score: 70, assignedTo: null, notes: [] },
  { name: 'Tom Odhiambo', email: 'tom.odhiambo@example.com', phone: '+254 711 208 733', message: 'Furnished 1-bed needed near Sarit from November, 12-month lease.', status: 'VIEWING', source: 'VIEWING_REQUEST', propertySlug: 'westlands-parkview-one-bed-rental', budgetKes: 100000, score: 63, assignedTo: 'Xavier Kariuki', notes: [{ at: '2026-09-22T10:05:00Z', author: 'Xavier', text: 'Viewing scheduled Friday 4pm' }] },
  { name: 'Fatuma Ali', email: 'fatuma.ali@example.com', phone: '+254 738 940 612', message: 'Buying my first home — 2 bed with balcony in Kilimani, offer ready.', status: 'OFFER', source: 'AI_ASSISTANT', propertySlug: 'kilimani-modern-two-bed-balcony', budgetKes: 13000000, score: 84, assignedTo: 'Xavier Kariuki', notes: [{ at: '2026-09-21T16:30:00Z', author: 'AI Assistant', text: 'Matched query "2bed with balcony kilimani under 13M"' }, { at: '2026-09-22T09:15:00Z', author: 'Xavier', text: 'Offer at asking submitted, awaiting seller response' }] },
  { name: 'Kevin Njoroge', email: 'kevin.njoroge@example.com', phone: '+254 799 118 240', message: 'Saw the Kilimani rooftop-pool release in your newsletter — please share the payment plan.', status: 'CONTACTED', source: 'NEWSLETTER', propertySlug: 'kilimani-the-ava-new-release', budgetKes: 19000000, score: 68, assignedTo: 'David Mwangi', notes: [{ at: '2026-09-20T14:00:00Z', author: 'David', text: 'Shared the 30/40/30 payment plan brochure' }] },
]

const subscribers = [
  { email: 'diaspora.investor@example.com', source: 'NEWSLETTER' },
  { email: 'jane.njeri@example.com', source: 'NEWSLETTER' },
  { email: 'peter.kamau@example.com', source: 'NEWSLETTER' },
  { email: 'amelia.kilonzo@example.com', source: 'NEWSLETTER' },
  { email: 'victor.mutiso@example.com', source: 'NEWSLETTER' },
]

async function main() {
  console.log('🌱 Seeding Delima Realtors 3.0 …')
  await db.lead.deleteMany()
  await db.marketStat.deleteMany()
  await db.property.deleteMany()
  await db.agent.deleteMany()
  await db.neighborhood.deleteMany()
  await db.subscriber.deleteMany()

  const nbMap: Record<string, string> = {}
  for (const n of neighborhoods) {
    const created = await db.neighborhood.create({
      data: { ...n, highlights: JSON.stringify(n.highlights), polygon: JSON.stringify(n.polygon) },
    })
    nbMap[n.slug] = created.id
  }
  console.log(`  ✅ ${neighborhoods.length} neighborhoods`)

  const agentMap: Record<string, string> = {}
  for (const a of agents) {
    const created = await db.agent.create({
      data: { ...a, slug: a.slug.trim() },
    })
    agentMap[a.slug.trim()] = created.id
  }
  console.log(`  ✅ ${agents.length} agents`)

  for (const p of props) {
    const nb = neighborhoods.find(n => n.slug === p.nb)!
    await db.property.create({
      data: {
        slug: p.slug, title: p.title, description: p.description,
        type: p.type, status: p.status, priceKes: p.priceKes,
        bedrooms: p.bedrooms, bathrooms: p.bathrooms, sqm: p.sqm,
        address: p.address,
        neighborhoodId: nbMap[p.nb],
        agentId: agentMap[p.agent],
        lat: nb.lat + p.dy, lng: nb.lng + p.dx,
        amenities: JSON.stringify(p.amenities),
        images: JSON.stringify(p.images),
        yearBuilt: p.yearBuilt, parking: p.parking,
        featured: p.featured, rating: p.rating, views: p.views,
      },
    })
  }
  const byStatus = props.reduce<Record<string, number>>((acc, p) => { acc[p.status] = (acc[p.status] ?? 0) + 1; return acc }, {})
  console.log(`  ✅ ${props.length} properties (${Object.entries(byStatus).map(([k, v]) => `${v} ${k}`).join(', ')})`)

  // 12 months of market stats ending Aug 2026 — one series per neighborhood
  const months = ['2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07','2026-08']
  const yoyBase: Record<string, number> = { westlands: 148000, kilimani: 128000, karen: 192000, muthaiga: 221000, runda: 180000, kileleshwa: 141000, loresho: 158000, kitisuru: 172000, langata: 106000 }
  let statCount = 0
  for (const n of neighborhoods) {
    const base = Math.round(n.avgPricePerSqm / 1.092) // ~9.2% YoY
    for (let i = 0; i < months.length; i++) {
      const drift = 1 + (i / (months.length - 1)) * 0.092
      const wobble = 1 + Math.sin(i * 1.7 + n.slug.length) * 0.012
      const ppsqm = Math.round(base * drift * wobble)
      const yoy = ((ppsqm / Math.round(yoyBase[n.slug] * wobble)) - 1) * 100
      await db.marketStat.create({
        data: {
          neighborhoodId: nbMap[n.slug], month: months[i],
          medianPriceKes: Math.round(ppsqm * 2.6 / 100000) * 100000 + 2400000,
          pricePerSqm: ppsqm,
          volume: 14 + ((i * 7 + n.slug.length * 3) % 11),
          yoyChangePct: Math.round(yoy * 10) / 10,
        },
      })
      statCount++
    }
  }
  console.log(`  ✅ ${statCount} market stats (9 neighborhoods × 12 months)`)

  for (const l of leadSeed) {
    let propertyId: string | null = null
    if (l.propertySlug) {
      const prop = await db.property.findUnique({ where: { slug: l.propertySlug } })
      propertyId = prop?.id ?? null
    }
    const { propertySlug, ...rest } = l
    await db.lead.create({ data: { ...rest, propertyId, notes: JSON.stringify(l.notes) } })
  }
  console.log(`  ✅ ${leadSeed.length} CRM leads`)

  for (const s of subscribers) {
    await db.subscriber.create({ data: s }).catch(() => {})
  }
  console.log(`  ✅ ${subscribers.length} newsletter subscribers`)

  console.log('🌾 Seed complete.')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
