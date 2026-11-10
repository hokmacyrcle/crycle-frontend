import { Component } from '@angular/core';

interface Tab {
  id: string;
  label: string;
}

@Component({
  selector: 'app-banktransactions',
  templateUrl: './banktransactions.component.html',
  styleUrls: ['./banktransactions.component.scss']
})
export class BanktransactionsComponent {
    activeModal: string | null = null;

  showPopup = false;
  accountName = 'Cash and cash equivalents';
  accountType = 'detail';
  detailType = 'Cash and cash equivalents';
  gstCode = '';
  currency = 'AUD - Australian Dollar';
  description = '';
  batchPayments = false;
  disconnect = false;

  openEditPopup() {
    this.showPopup = true;
  }

  closeEditPopup() {
    this.showPopup = false;
  }

activeSection: string = 'dashboard';
activeTab: string = 'bank_transactions'; // Default to first tab


  // Define the dashboard tabs, including the new static tabs
  dashboardTabs: Tab[] = [
    { id: 'bank_transactions', label: 'Bank Transactions' },
    { id: 'app_transactions', label: 'App Transactions' },
    { id: 'receipts', label: 'Receipts' },
    { id: 'reconcile', label: 'Reconcile' },
    { id: 'rules', label: 'Rules' },
    { id: 'chart_of_accounts', label: 'Chart of Accounts' },
    { id: 'recurring_transactions', label: 'Recurring Transactions' }
  ];

  constructor() {}

  ngOnInit(): void {

  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }
 openModal(modalId: string) {
    this.activeModal = modalId;
    this.closeAllDropdowns(); // dropdown close kar dena
  }

  closeModal() {
    this.activeModal = null;
  }


  closeAllDropdowns() {
 
  }



}
