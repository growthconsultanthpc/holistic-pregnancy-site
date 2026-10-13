// Offer maths, shared by the build (SSR default) and the browser (live refresh). Price = round(full × (1 − pct/100)).
export type Offer = { enabled?: boolean; discountPercent?: number; code?: string; endsAt?: string } | null | undefined

export const isLive = (o: Offer, now = Date.now()) =>
  !!o?.enabled && (o.discountPercent ?? 0) > 0 && (!o.endsAt || new Date(o.endsAt).getTime() > now)

export const rupees = (n: number) => '₹' + n.toLocaleString('en-IN')

export function priceOf(full: number, o: Offer, now = Date.now()) {
  if (!isLive(o, now)) return { full, now: full, save: 0, on: false }
  const sale = Math.round(full * (1 - (o!.discountPercent as number) / 100))
  return { full, now: sale, save: full - sale, on: true }
}

// Markup for a price. With an offer: struck-through full price, sale price, "Save ₹X" chip. Without: the plain price.
export function priceHtml(full: number, o: Offer, now = Date.now()) {
  const p = priceOf(full, o, now)
  return p.on ? `<s class="cp-was">${rupees(full)}</s> ${rupees(p.now)} <i class="cp-off">Save ${rupees(p.save)}</i>` : rupees(full)
}

// ponytail: self-check, run with `node --experimental-strip-types src/lib/offer.ts`
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('offer.ts')) {
  const o = { enabled: true, discountPercent: 25 }
  console.assert(priceOf(9999, o).now === 7499 && priceOf(9999, o).save === 2500, 'preconception')
  console.assert(priceOf(29999, o).now === 22499, 'pathshala')
  console.assert(priceOf(16499, o).now === 12374 && priceOf(16499, o).save === 4125, 'power of 11')
  console.assert(!isLive({ ...o, endsAt: '2000-01-01T00:00:00Z' }), 'ended')
  console.assert(!isLive({ ...o, enabled: false }), 'off')
  console.log('offer.ts ok')
}
