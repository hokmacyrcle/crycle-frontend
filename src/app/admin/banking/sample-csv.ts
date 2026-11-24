/** Sample statement files people can download to see what the importer expects. Dates count back from today. */
const pad = (n: number) => String(n).padStart(2, '0');
const day = (back: number) => { const d = new Date(); d.setDate(d.getDate() - back); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; };

export type SampleKind = 'one-amount' | 'two-columns';

export function sampleCsv(kind: SampleKind): string {
  if (kind === 'two-columns') {
    return [
      'Date,Description,Money out,Money in,Balance',
      `${day(6)},EXAMPLE CUSTOMER DEPOSIT,,1100.00,6350.50`,
      `${day(5)},EXAMPLE OFFICE SUPPLIES,86.95,,6263.55`,
      `${day(2)},EXAMPLE PHONE BILL,129.00,,6134.55`,
    ].join('\r\n') + '\r\n';
  }
  return [
    'Date,Description,Amount,Balance',
    `${day(6)},EXAMPLE CUSTOMER DEPOSIT,1100.00,6350.50`,
    `${day(5)},EXAMPLE OFFICE SUPPLIES,-86.95,6263.55`,
    `${day(2)},EXAMPLE PHONE BILL,-129.00,6134.55`,
  ].join('\r\n') + '\r\n';
}

export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fileName;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadSample(kind: SampleKind): void {
  saveBlob(new Blob(['﻿' + sampleCsv(kind)], { type: 'text/csv;charset=utf-8' }),
    kind === 'one-amount' ? 'cyrcle-sample-one-amount.csv' : 'cyrcle-sample-money-in-out.csv');
}
