// Shape of the long-form narrative sections on a programme page (fixed order, each optional except intro/close).
// Strings may contain inline <b>, <em> and <i> only (trusted client copy, rendered as HTML).
type Band = { band: boolean }
export type ProgramNarrative = {
  intro: Band & {
    eyebrow: string; heading: string; em: string; paras: string[]
    callout: { big: string; unit: string; hit: string; withLine: string; hin: string }
  }
  triad?: Band & { heading: string; sub: string; items: { tone: 's' | 'p' | 'b'; tag: string; text: string }[] }
  coverage?: Band & { heading: string; sub: string; items: string[] }
  features?: Band & { items: { eyebrow: string; heading: string; paras: string[] }[] }
  fit: Band & { eyebrow: string; heading: string; paras: string[]; items: string[] }
  promise?: Band & { eyebrow: string; paras: string[] }
  close: { heading: string; em: string; withLine: string }
}
