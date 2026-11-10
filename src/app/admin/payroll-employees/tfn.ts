/** Checks the 9-digit tax file number checksum (same rule as the server). */
export function isValidTfn(value: string): boolean {
  const d = (value || '').replace(/\s+/g, '');
  if (!/^\d{9}$/.test(d)) return false;
  const w = [1, 4, 3, 7, 5, 8, 6, 9, 10];
  return d.split('').reduce((s, c, i) => s + (+c) * w[i], 0) % 11 === 0;
}
