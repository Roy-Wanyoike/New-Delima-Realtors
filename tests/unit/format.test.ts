// Delima Realtors Platform 2.0 — unit tests for src/lib/format.ts (issue #66, Task 8-a)
import { describe, it, expect } from 'vitest'
import {
  formatKes,
  formatPriceForStatus,
  formatSqm,
  typeLabel,
  statusLabel,
  leadStatusLabel,
  leadSourceLabel,
  whatsappLink,
} from '@/lib/format'

describe('formatKes', () => {
  it('formats whole amounts with en-KE thousands separators', () => {
    expect(formatKes(25_000_000)).toBe('KES 25,000,000')
    expect(formatKes(950_000)).toBe('KES 950,000')
  })

  it('handles zero and small values without separators', () => {
    expect(formatKes(0)).toBe('KES 0')
    expect(formatKes(999)).toBe('KES 999')
  })

  it('compact: millions keep one decimal when needed, drop trailing .0', () => {
    expect(formatKes(2_500_000, { compact: true })).toBe('KES 2.5M')
    expect(formatKes(2_000_000, { compact: true })).toBe('KES 2M')
    expect(formatKes(98_000_000, { compact: true })).toBe('KES 98M')
    expect(formatKes(85_500_000, { compact: true })).toBe('KES 85.5M')
  })

  it('compact: billions use two decimals, dropping a full trailing .00', () => {
    // Code reality quirk (flagged to the team, not fixed here): the B branch only
    // strips a full '.00' — 4.2B renders as '4.20B', unlike the M branch which
    // trims a single trailing '.0'.
    expect(formatKes(4_200_000_000, { compact: true })).toBe('KES 4.20B')
    expect(formatKes(1_000_000_000, { compact: true })).toBe('KES 1B')
    expect(formatKes(1_250_000_000, { compact: true })).toBe('KES 1.25B')
  })

  it('compact: thousands round to K', () => {
    expect(formatKes(950_000, { compact: true })).toBe('KES 950K')
    expect(formatKes(1_500, { compact: true })).toBe('KES 2K')
  })

  it('compact falls back to plain formatting below 1,000', () => {
    expect(formatKes(500, { compact: true })).toBe('KES 500')
  })
})

describe('formatPriceForStatus', () => {
  it('appends "/ month" for FOR_RENT listings', () => {
    expect(formatPriceForStatus(350_000, 'FOR_RENT')).toBe('KES 350,000 / month')
    expect(formatPriceForStatus(120_000, 'FOR_RENT')).toBe('KES 120,000 / month')
  })

  it('returns the plain price for sale-ish statuses', () => {
    expect(formatPriceForStatus(85_000_000, 'FOR_SALE')).toBe('KES 85,000,000')
    expect(formatPriceForStatus(65_000_000, 'SOLD')).toBe('KES 65,000,000')
    expect(formatPriceForStatus(30_000_000, 'NEW_DEVELOPMENT')).toBe('KES 30,000,000')
  })
})

describe('formatSqm', () => {
  it('formats area with the sqm suffix', () => {
    expect(formatSqm(450)).toBe('450 sqm')
  })
})

describe('label maps', () => {
  it('maps every property type to a human label', () => {
    expect(typeLabel).toEqual({
      APARTMENT: 'Apartment',
      VILLA: 'Villa',
      TOWNHOUSE: 'Townhouse',
      PENTHOUSE: 'Penthouse',
      OFFICE: 'Office',
      LAND: 'Land',
      COMMERCIAL: 'Commercial',
    })
  })

  it('maps every property status to a human label', () => {
    expect(statusLabel).toEqual({
      FOR_SALE: 'For Sale',
      FOR_RENT: 'For Rent',
      SOLD: 'Sold',
      NEW_DEVELOPMENT: 'New Development',
    })
  })

  it('maps every lead status and source to human labels', () => {
    expect(leadStatusLabel.NEW).toBe('New')
    expect(leadStatusLabel.CONTACTED).toBe('Contacted')
    expect(leadStatusLabel.VIEWING).toBe('Viewing')
    expect(leadStatusLabel.OFFER).toBe('Offer')
    expect(leadStatusLabel.CLOSED).toBe('Closed')
    expect(leadStatusLabel.LOST).toBe('Lost')

    expect(leadSourceLabel.CONTACT_FORM).toBe('Contact Form')
    expect(leadSourceLabel.VALUATION).toBe('Valuation')
    expect(leadSourceLabel.AI_ASSISTANT).toBe('AI Assistant')
    expect(leadSourceLabel.VIEWING_REQUEST).toBe('Viewing Request')
    expect(leadSourceLabel.NEWSLETTER).toBe('Newsletter')
  })
})

describe('whatsappLink', () => {
  it('strips non-digit characters from the phone number', () => {
    expect(whatsappLink('+254 727 523 752', 'Hi')).toBe('https://wa.me/254727523752?text=Hi')
  })

  it('URL-encodes the message text', () => {
    expect(whatsappLink('+254 727 523 752', 'Hi there')).toBe('https://wa.me/254727523752?text=Hi%20there')
    expect(whatsappLink('254727523752', 'Villa & pool')).toBe('https://wa.me/254727523752?text=Villa%20%26%20pool')
  })
})
