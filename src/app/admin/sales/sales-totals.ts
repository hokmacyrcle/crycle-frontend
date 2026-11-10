/**
 * Invoice / quote maths for Australian GST. This is the same calculation the server does (SalesTotals.php),
 * so the totals you see while typing are the totals that get saved.
 *
 *  exclusive  - prices typed in are before GST; GST is added on top
 *  inclusive  - prices typed in already include GST; GST is worked out from them
 *  no_gst     - no GST at all
 *
 * Everything is done in whole cents. A discount is shared across lines in proportion to their value.
 */
export type AmountsAre = 'exclusive' | 'inclusive' | 'no_gst';
export type DiscountMethod = 'percentage' | 'fixed';

export const GST_RATE = 10;

export interface CalcLine { quantity: number | string; rate: number | string; gst_rate?: number | string; }

export interface Totals {
  lines: { entered: number; ex_gst: number; gst: number; inc_gst: number }[];
  gross: number;
  discount: number;
  subtotal: number; // ex GST, after discount
  gst: number;
  total: number;
}

const num = (v: unknown): number => { const n = Number(v); return isFinite(n) ? n : 0; };

export function computeTotals(lines: CalcLine[], amountsAre: AmountsAre = 'exclusive', method: DiscountMethod = 'percentage', discountValue: number | string = 0): Totals {
  const noGst = amountsAre === 'no_gst';
  const inclusive = amountsAre === 'inclusive';

  // Quantity and price are held as whole hundredths / cents so nothing depends on floating point rounding.
  // BigInt is used for the products because they can pass what a normal number holds exactly.
  const entered = lines.map(l => {
    const qtyHundredths = BigInt(Math.round(num(l.quantity) * 100));
    const rateCents = BigInt(Math.round(num(l.rate) * 100));
    return Number((qtyHundredths * rateCents * 2n + 100n) / 200n); // half-up
  });
  const sum = entered.reduce((a, b) => a + b, 0);

  let discount = 0;
  const value = Math.max(0, num(discountValue));
  if (sum > 0 && value > 0) {
    if (method === 'fixed') {
      discount = Math.round(value * 100);
    } else {
      const pctHundredths = BigInt(Math.round(Math.min(value, 100) * 100));
      discount = Number((BigInt(sum) * pctHundredths * 2n + 10000n) / 20000n); // half-up
    }
    discount = Math.min(discount, sum);
  }

  const out: Totals['lines'] = [];
  let totEx = 0, totGst = 0, totInc = 0, running = 0, allocatedBefore = 0;

  entered.forEach((amount, i) => {
    running += amount;
    const allocatedUpToHere = sum > 0 ? Number((BigInt(discount) * BigInt(running) * 2n + BigInt(sum)) / (2n * BigInt(sum))) : 0; // half-up
    const share = allocatedUpToHere - allocatedBefore;
    allocatedBefore = allocatedUpToHere;

    const after = amount - share;
    const rate = noGst ? 0 : Math.round(num(lines[i].gst_rate ?? GST_RATE));

    let ex: number, gst: number, inc: number;
    if (noGst || rate === 0) {
      ex = after; gst = 0; inc = after;
    } else if (inclusive) {
      inc = after;
      gst = Math.floor((inc * rate * 2 + (100 + rate)) / (2 * (100 + rate)));
      ex = inc - gst;
    } else {
      ex = after;
      gst = Math.floor((ex * rate * 2 + 100) / 200);
      inc = ex + gst;
    }
    out.push({ entered: amount / 100, ex_gst: ex / 100, gst: gst / 100, inc_gst: inc / 100 });
    totEx += ex; totGst += gst; totInc += inc;
  });

  return { lines: out, gross: sum / 100, discount: discount / 100, subtotal: totEx / 100, gst: totGst / 100, total: totInc / 100 };
}
