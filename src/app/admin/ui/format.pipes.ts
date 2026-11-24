import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency, formatDate } from '@angular/common';

/** 1234.5 -> $1,234.50 (Australian dollars) */
@Pipe({ name: 'aud' })
export class AudPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    const n = Number(value ?? 0);
    return formatCurrency(isNaN(n) ? 0 : n, 'en-US', '$', 'AUD', '1.2-2');
  }
}

/** 51824753556 -> 51 824 753 556 */
@Pipe({ name: 'abn' })
export class AbnPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    const d = (value ?? '').replace(/\D/g, '');
    return d.length === 11 ? `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}` : (value ?? '');
  }
}

/** 2026-11-10 -> 10 Nov 2026 */
@Pipe({ name: 'auDate' })
export class AuDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    const d = new Date(value.length === 10 ? value + 'T00:00:00' : value);
    return isNaN(d.getTime()) ? value : formatDate(d, 'd MMM y', 'en-US');
  }
}
