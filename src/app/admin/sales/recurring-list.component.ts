import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { RecurringRow } from './sales.models';
import { SalesService, toProblem } from './sales.service';

/** Invoices that repeat. Each time one is due a draft is created for you to check and issue. */
@Component({
  selector: 'app-recurring-list',
  templateUrl: './recurring-list.component.html'
})
export class RecurringListComponent implements OnInit {
  rows: RecurringRow[] = [];
  loading = true;
  error = '';
  busyId: number | null = null;

  constructor(private api: SalesService, private alerts: AlertService) { }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = '';
    this.api.recurringList().subscribe({
      next: r => { this.rows = r.data; this.loading = false; },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }

  toggle(r: RecurringRow): void {
    this.busyId = r.id;
    this.api.updateRecurring(r.id, { active: !r.active }).subscribe({
      next: res => { this.busyId = null; this.alerts.toast(res.data.active ? 'Repeat resumed.' : 'Repeat paused.'); this.load(); },
      error: e => { this.busyId = null; this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }

  async stop(r: RecurringRow): Promise<void> {
    if (!(await this.alerts.confirm('Stop this repeat?', 'No more drafts will be created. Invoices already created are not affected.', 'Stop repeat'))) return;
    this.busyId = r.id;
    this.api.stopRecurring(r.id).subscribe({
      next: res => { this.busyId = null; this.alerts.toast(res.message); this.load(); },
      error: e => { this.busyId = null; this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }
}
