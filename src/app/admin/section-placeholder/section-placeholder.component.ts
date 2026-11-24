import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Shown for sections that are not built yet (Payroll, Expenses, Banking).
 * It carries no sample numbers and no buttons that do nothing: just what the section will do and a way back.
 */
@Component({
  selector: 'app-section-placeholder',
  templateUrl: './section-placeholder.component.html'
})
export class SectionPlaceholderComponent {
  title = '';
  icon = 'info';
  blurb = '';
  planned: string[] = [];

  constructor(route: ActivatedRoute) {
    const d = route.snapshot.data || {};
    this.title = d['title'] || '';
    this.icon = d['icon'] || 'info';
    this.blurb = d['blurb'] || '';
    this.planned = d['planned'] || [];
  }
}
