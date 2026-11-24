import { Component, OnInit } from '@angular/core';
import { Summary } from './sales.models';
import { SalesService, toProblem } from './sales.service';
import { STATUS_LABEL } from './sales.labels';

interface Bar { x: number; y: number; h: number; w: number; tip: string; color: string; }
interface Tick { y: number; label: string; }

@Component({
  selector: 'app-sales-overview',
  templateUrl: './sales-overview.component.html'
})
export class SalesOverviewComponent implements OnInit {
  s: Summary | null = null;
  loading = true;
  error = '';
  label = STATUS_LABEL;

  // chart
  readonly W = 600; readonly H = 230;
  bars: Bar[] = []; ticks: Tick[] = []; months: { x: number; label: string }[] = []; hasChartData = false;
  chartSummary = '';

  constructor(private api: SalesService) { }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = '';
    this.api.summary().subscribe({
      next: s => { this.s = s; this.loading = false; this.buildChart(s); },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }

  /** Where to fix ABN and bank details: the edit page of the business being worked in. */
  get editBusiness(): any[] {
    try {
      const id = JSON.parse(localStorage.getItem('selected_company') || '{}')?.company_id;
      return id ? ['/admin/companies', id, 'edit'] : ['/admin/companies'];
    } catch { return ['/admin/companies']; }
  }

  get needsAbn(): boolean { return !!this.s && this.s.business.gst_registered && !this.s.business.abn; }
  get isEmpty(): boolean { return !!this.s && this.s.totals.invoices === 0 && this.s.totals.quotes === 0; }

  private compact(n: number): string {
    if (n >= 1_000_000) return '$' + +(n / 1_000_000).toFixed(1) + 'm';
    if (n >= 1_000) return '$' + +(n / 1_000).toFixed(1) + 'k';
    return '$' + Math.round(n);
  }

  private buildChart(s: Summary): void {
    const left = 50, right = 8, top = 12, bottom = 30;
    const plotW = this.W - left - right, plotH = this.H - top - bottom;
    const max = Math.max(0, ...s.monthly.flatMap(m => [m.invoiced, m.received]));
    this.hasChartData = max > 0;
    this.bars = []; this.ticks = []; this.months = [];
    if (!this.hasChartData) return;

    const pow = Math.pow(10, Math.floor(Math.log10(max)));
    const step = ([1, 2, 2.5, 5, 10].map(k => k * pow).find(v => v * 4 >= max)) ?? pow * 10;
    const niceMax = step * 4;
    for (let i = 0; i <= 4; i++) this.ticks.push({ y: top + plotH - (plotH * i) / 4, label: this.compact(step * i) });

    const group = plotW / s.monthly.length, barW = Math.min(26, group / 3);
    s.monthly.forEach((m, i) => {
      const cx = left + group * i + group / 2;
      const ih = (m.invoiced / niceMax) * plotH, rh = (m.received / niceMax) * plotH;
      this.bars.push({ x: cx - barW - 2, y: top + plotH - ih, h: ih, w: barW, color: '#01153E', tip: `${m.label}: invoiced ${this.money(m.invoiced)}` });
      this.bars.push({ x: cx + 2, y: top + plotH - rh, h: rh, w: barW, color: '#047070', tip: `${m.label}: received ${this.money(m.received)}` });
      this.months.push({ x: cx, label: m.label });
    });
    const inv = s.monthly.reduce((a, m) => a + m.invoiced, 0), rec = s.monthly.reduce((a, m) => a + m.received, 0);
    this.chartSummary = `Last 6 months: ${this.money(inv)} invoiced and ${this.money(rec)} received.`;
  }

  private money(n: number): string { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
}
