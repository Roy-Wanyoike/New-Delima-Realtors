// Delima Realtors Platform 2.0 — shared type contract
// All engineers build against these types. Do not redefine them locally.

export type PropertyType =
  | 'APARTMENT' | 'VILLA' | 'TOWNHOUSE' | 'PENTHOUSE' | 'OFFICE' | 'LAND' | 'COMMERCIAL'

export type PropertyStatus = 'FOR_SALE' | 'FOR_RENT' | 'SOLD' | 'NEW_DEVELOPMENT'

export type LeadStatus = 'NEW' | 'CONTACTED' | 'VIEWING' | 'OFFER' | 'CLOSED' | 'LOST'

export type LeadSource =
  | 'CONTACT_FORM' | 'VALUATION' | 'AI_ASSISTANT' | 'VIEWING_REQUEST' | 'NEWSLETTER'

export type View =
  | 'home' | 'properties' | 'property' | 'map' | 'insights' | 'agents' | 'finance' | 'admin' | 'valuation' | 'account'

export interface PropertyDTO {
  id: string
  slug: string
  title: string
  description: string
  type: PropertyType
  status: PropertyStatus
  priceKes: number
  bedrooms: number
  bathrooms: number
  sqm: number
  address: string
  neighborhood: string          // neighborhood name, e.g. "Karen"
  neighborhoodSlug: string
  lat: number
  lng: number
  amenities: string[]
  images: string[]
  yearBuilt: number
  parking: number
  featured: boolean
  rating: number
  views: number
  agent: AgentDTO
  createdAt: string
}

export interface AgentDTO {
  id: string
  slug: string
  name: string
  title: string
  photo: string
  phone: string
  email: string
  specialties: string[]
  rating: number
  bio: string
}

export interface NeighborhoodDTO {
  id: string
  slug: string
  name: string
  description: string
  lat: number
  lng: number
  polygon: [number, number][]
  avgPricePerSqm: number
  image: string
  highlights: string[]
}

export interface MarketPoint {
  month: string        // "2026-01"
  medianPriceKes: number
  pricePerSqm: number
  volume: number
  yoyChangePct: number
}

export interface InsightsDTO {
  neighborhoods: Array<{
    slug: string
    name: string
    avgPricePerSqm: number
    latestYoY: number
    totalVolume12m: number
    series: MarketPoint[]
  }>
}

export interface LeadNote { at: string; author: string; text: string }

export interface LeadDTO {
  id: string
  name: string
  email: string
  phone: string
  message: string
  propertyId: string | null
  propertyTitle: string | null
  status: LeadStatus
  source: LeadSource
  budgetKes: number | null
  score: number
  assignedTo: string | null
  notes: LeadNote[]
  createdAt: string
}

export interface FilterState {
  q: string
  type: PropertyType | 'ALL'
  status: PropertyStatus | 'ALL'
  minPrice: number | null
  maxPrice: number | null
  beds: number            // 0 = any
  neighborhood: string    // slug or 'ALL'
  featuredOnly: boolean
  sort: 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'size'
}

export interface AssistantMsg {
  role: 'user' | 'assistant'
  content: string
  properties?: PropertyDTO[]   // listing cards attached to an assistant reply
}

export interface AssistantResponse {
  reply: string
  properties: PropertyDTO[]
  filters?: Partial<FilterState>
}

export interface ValuationResult {
  lowKes: number
  midKes: number
  highKes: number
  confidence: number      // 0-100
  narrative: string
  comps: Array<{ title: string; neighborhood: string; priceKes: number; sqm: number; similarityNote: string }>
}

export const PROPERTY_TYPES: PropertyType[] = ['APARTMENT', 'VILLA', 'TOWNHOUSE', 'PENTHOUSE', 'OFFICE', 'LAND', 'COMMERCIAL']
export const PROPERTY_STATUSES: PropertyStatus[] = ['FOR_SALE', 'FOR_RENT', 'SOLD', 'NEW_DEVELOPMENT']
export const LEAD_STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'VIEWING', 'OFFER', 'CLOSED', 'LOST']
