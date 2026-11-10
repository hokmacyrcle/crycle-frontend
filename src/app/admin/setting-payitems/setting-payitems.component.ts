import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-setting-payitems',
  templateUrl: './setting-payitems.component.html',
  styleUrls: ['./setting-payitems.component.scss']
})
export class SettingPayitemsComponent {
  sidebarItems = ['Earnings', 'Deductions', 'Reimbursements', 'Leave'];
  selectedTab: string = 'Earnings';

  data: Record<string, any[]> = {
    Earnings: [
      { name: 'Allowances exempt from tax withholding', category: 'Allowance', rate: 'Rate per Unit', account: '477: Wages and Salaries', reportable: 'No' },
      { name: 'Allowances subject to tax withholding', category: 'Allowance', rate: 'Rate per Unit', account: '477: Wages and Salaries', reportable: 'No' },
      { name: 'Bonus and commissions', category: 'Bonuses and Commissions', rate: 'Fixed Amount', account: '477: Wages and Salaries', reportable: 'Yes' },
      { name: 'Director Fees', category: 'Directors Fees', rate: 'Fixed Amount', account: '477: Wages and Salaries', reportable: 'Yes' }
    ],
    Deductions: [
      { name: 'Union Fee', category: 'Deductions', account: '234: Deductions', payG: 'yes', sgc: 'no', Excluded: 'no' }
    ],
    Reimbursements: [
      { name: 'Travel Reimbursement', account: '500: Expenses', }
    ],
    Leave: [
      { name: 'Annual Leave', category: 'Leave', Units: 'Accrued', NormalEntitlement: '600: Leave Payable', LeaveLoadingRate: 'Yes', Payslip: 'Yes' }
    ]
  };

  selectTab(item: string) {
    this.selectedTab = item;
  }

  openDropdown: number | string | null = null;

  toggleDropdown(key: number | string) {
    this.openDropdown = this.openDropdown === key ? null : key;
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


  openModalId: string | null = null;

  modalTitle: Record<string, string> = {
    "1": "Ordinary Time Earnings",
    "2": "Overtime Earnings",
    "3": "Allowance",
    "4": "Employment Termination Payments",
    "5": "Lump Sum E",
    "6": "Bonuses and Commissions",
    "7": "Lump Sum W",
    "8": "Directors Fees",
    "9": "Paid Parental Leave",
    "10": "Workers’ Compensation",
    "11": "Overtime Earnings",
    "12": "Workplace Giving",
    "13": "Union / Association Fees",
    "14": "Other / None",
    "15": "Paid Leave",
    "16": "Unpaid Leave",

    "edit": "Edit Earnings",
  };
  originalOrder = (a: any, b: any): number => {
    return 0;
  };
  openModal(id: string) {
    this.openModalId = id;
  }
  isFirstModule(id: string): boolean {
    const numId = parseInt(id, 10);
    return !isNaN(numId) && numId >= 0 && numId <= 10;
  }

  isSecondModule(id: string): boolean {
    const numId = parseInt(id, 10);
    return !isNaN(numId) && numId >= 11 && numId <= 15;
  }

  closeModal() {
    this.openModalId = null;
  }
}
