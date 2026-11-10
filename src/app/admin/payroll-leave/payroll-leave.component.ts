import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-payroll-leave',
  templateUrl: './payroll-leave.component.html',
  styleUrls: ['./payroll-leave.component.scss']
})
export class PayrollLeaveComponent {
  activeTab: string = 'leave';
  dropdown1Open: boolean = false;
  dropdown2Open: boolean = false;
  dropdown3Open: boolean = false;
  dropdown4Index: number | null = null;
  selectedEmployee: string = '';
  selectedLeave: string = '';

  employees = ['John Doe', 'Jane Smith', 'Robert King'];
  leaveTypes = ['Annual Leave', 'Sick Leave', 'Casual Leave'];

  // Modal
  openModalId: number | null = null;

  // Tabs toggle
  setTab(tab: string) {
    this.activeTab = tab;
  }

  // Dropdown toggle
  toggleDropdown(drop: number, index?: number) {
    if (drop === 1) {
      this.dropdown1Open = !this.dropdown1Open;
      this.dropdown2Open = false;
      this.dropdown3Open = false;
      this.dropdown4Index = null;
    } else if (drop === 2) {
      this.dropdown2Open = !this.dropdown2Open;
      this.dropdown1Open = false;
      this.dropdown3Open = false;
      this.dropdown4Index = null;
    } else if (drop === 3) {
      this.dropdown3Open = !this.dropdown3Open;
      this.dropdown1Open = false;
      this.dropdown2Open = false;
      this.dropdown4Index = null;
    } else if (drop === 4 && index !== undefined) {
      // Row specific toggle
      this.dropdown4Index = this.dropdown4Index === index ? null : index;
      this.dropdown1Open = false;
      this.dropdown2Open = false;
      this.dropdown3Open = false;
    }
  }

  closeDropdowns() {
    this.dropdown1Open = false;
    this.dropdown2Open = false;
    this.dropdown3Open = false;
    this.dropdown4Index = null;
  }

  // Modal controls
  openModal(id: number) {
    this.openModalId = id;
    this.closeDropdowns();
  }

  closeModal() {
    this.openModalId = null;
    this.selectedEmployee = '';
    this.selectedLeave = '';
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.closeDropdowns();
    }
  }
}
