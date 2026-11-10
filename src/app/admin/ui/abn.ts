/** ABN checksum (the ATO algorithm). It checks the number is well formed; it does not look the ABN up. */
export function isValidAbn(value: string | null | undefined): boolean {
  const v = String(value ?? '').replace(/\s+/g, '');
  if (!/^\d{11}$/.test(v)) return false;
  const w = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const d = v.split('').map(Number);
  d[0] -= 1;
  return d.reduce((s, n, i) => s + n * w[i], 0) % 89 === 0;
}
