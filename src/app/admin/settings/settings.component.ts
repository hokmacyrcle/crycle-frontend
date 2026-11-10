import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/core/session.service';

@Component({
  selector: 'app-settings',
  template: `
<div class="mx-auto max-w-xl text-cyrcle-navy">
  <h1 class="m-0 text-[28px] font-extrabold leading-tight">Settings</h1>

  <h2 class="mb-2 mt-6 text-lg font-extrabold">Your account</h2>
  <dl class="m-0 divide-y divide-cyrcle-pearl rounded-[20px] bg-white px-4">
    <div class="flex justify-between gap-4 py-3.5"><dt class="text-sm text-[#5B6478]">Name</dt><dd class="m-0 text-sm font-bold">{{ name }}</dd></div>
    <div class="flex justify-between gap-4 py-3.5"><dt class="text-sm text-[#5B6478]">Email</dt><dd class="m-0 break-all text-right text-sm font-bold">{{ email }}</dd></div>
    <div class="flex justify-between gap-4 py-3.5" *ngIf="phone"><dt class="text-sm text-[#5B6478]">Mobile</dt><dd class="m-0 text-sm font-bold">{{ phone }}</dd></div>
  </dl>

  <h2 class="mb-2 mt-6 text-lg font-extrabold">Working in</h2>
  <div class="flex items-center justify-between gap-3 rounded-[20px] bg-white p-4">
    <div class="min-w-0">
      <div class="truncate text-[15px] font-bold">{{ session.companyName || 'No business selected' }}</div>
      <div class="text-[13px] text-[#5B6478]">{{ session.context === 'firm' ? 'Firm level' : 'Client business' }}</div>
    </div>
    <a routerLink="/company-selection" class="shrink-0 rounded-full bg-cyrcle-cream px-4 py-2.5 text-sm font-bold">Switch business</a>
  </div>

  <button type="button" (click)="logout()" class="mt-8 flex h-[52px] w-full items-center justify-center rounded-full border-2 border-cyrcle-navy text-[15px] font-bold">Log out</button>
</div>`
})
export class SettingsComponent {
  name = ''; email = ''; phone = '';

  constructor(public session: SessionService, private router: Router) {
    let u: any = {};
    try { u = JSON.parse(localStorage.getItem('login_response') || '{}')?.data?.user || {}; } catch { /* ignore */ }
    this.name = u.name || session.userName;
    this.email = u.email || '';
    this.phone = u.phone ? `${u.country_code || ''} ${u.phone}`.trim() : '';
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
