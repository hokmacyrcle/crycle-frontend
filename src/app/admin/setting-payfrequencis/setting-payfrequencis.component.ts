import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-setting-payfrequencis',
  templateUrl: './setting-payfrequencis.component.html',
  styleUrls: ['./setting-payfrequencis.component.scss']
})
export class SettingPayfrequencisComponent {
  showHistory = false;
  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  openDropdown: number | null = null;

  toggleDropdown(index: number) {
    this.openDropdown = this.openDropdown === index ? null : index;
  }

  closeDropdowns() {
    this.openDropdown = null;
  }
  @HostListener('document:click', ['$event'])
  handleClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.closeDropdowns();
    }
  }

  // Modal
  openModalId: number | null = null;

  // Modal controls 
  openModal(id: number) {
    this.openModalId = id;
    this.closeDropdowns();
  }

  closeModal() {
    this.openModalId = null;
  }

  selectedPeriod: string = ''; 
}
