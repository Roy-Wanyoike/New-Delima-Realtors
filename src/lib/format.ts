// Delima Realtors Platform 2.0 — formatting helpers (KES-first, en-KE)
import type { PropertyStatus, PropertyType, LeadStatus, LeadSource } from './types'

export function formatKes(n: number, opts?: { compact?: boolean }): string {
  if (opts?.compact) {
    if (n >= 1_000_000_000) return `KES ${(n / 1_000_000_000).toFixed(2).replace(/\.00$/, '')}B`
    if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1).replace(/\.0$/, '')}M`
    if (n >= 1_000) return `KES ${Math.round(n / 1_000)}K`
  }
  return `KES ${n.toLocaleString('en-KE')}`
}

export function formatPriceForStatus(priceKes: number, status: PropertyStatus): string {
  return status === 'FOR_RENT' ? `${formatKes(priceKes)} / month` : formatKes(priceKes)
}

export function formatSqm(n: number): string {
  return `${n.toLocaleString('en-KE')} sqm`
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-KE')
}

export const typeLabel: Record<PropertyType, string> = {
  APARTMENT: 'Apartment',
  VILLA: 'Villa',
  TOWNHOUSE: 'Townhouse',
  PENTHOUSE: 'Penthouse',
  OFFICE: 'Office',
  LAND: 'Land',
  COMMERCIAL: 'Commercial',
}

export const statusLabel: Record<PropertyStatus, string> = {
  FOR_SALE: 'For Sale',
  FOR_RENT: 'For Rent',
  SOLD: 'Sold',
  NEW_DEVELOPMENT: 'New Development',
}

export const leadStatusLabel: Record<LeadStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  VIEWING: 'Viewing',
  OFFER: 'Offer',
  CLOSED: 'Closed',
  LOST: 'Lost',
}

export const leadSourceLabel: Record<LeadSource, string> = {
  CONTACT_FORM: 'Contact Form',
  VALUATION: 'Valuation',
  AI_ASSISTANT: 'AI Assistant',
  VIEWING_REQUEST: 'Viewing Request',
  NEWSLETTER: 'Newsletter',
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatMonth(m: string): string {
  const [y, mm] = m.split('-')
  return new Date(Number(y), Number(mm) - 1, 1).toLocaleDateString('en-KE', { month: 'short' })
}

export function whatsappLink(phone: string, text: string): string {
  const digits = phone.replace(/[^0-9]/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
