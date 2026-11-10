import { Component } from '@angular/core';

@Component({
  selector: 'app-banktransactiontable',
  templateUrl: './banktransactiontable.component.html',
  styleUrls: ['./banktransactiontable.component.scss']
})
export class BanktransactiontableComponent {
activeTab: string = 'bank_transactions'; // Added to match *ngIf condition
  activeModal: string = '';
  selectedRow: number | null = null;
  transactions = [
    { date: '07/22/2025', description: 'A Rental', payee: '', categoryOrMatch: 'Uncategorized Income', spent: '', received: '$200.00', action: 'Add' },
    { date: '07/20/2025', description: 'Hicks Hardware', payee: 'Hicks Hardware', categoryOrMatch: '1 match found\nCheck 75 07/20/2025 -$228.75 Hicks Hardware', spent: '$228.75', received: '', action: 'Match' },
    { date: '06/25/2025', description: 'Pg E', payee: 'PG&E', categoryOrMatch: '1 match found\nBill Payment 06/25/2025 -$114.09 PG&E', spent: '$114.09', received: '', action: 'Match' }
  ];
  selectedAction = { categorize: false, match: false, recordAsTransfer: false };
  currentTransactionIndex: number | null = null;
  selectedCategory: string = 'Uncategorized Income'; // For simple category
  categorizeData = {
    supplierCustomerProject: '',
    payee: '',
    account: '',
    mealsEntertainment: '',
    productService: '',
    customerProject: '',
    billable: false,
    gst: '',
    class: '',
    memo: '',
    bankDetail: 'Coffee Place, Street, Anytown',
    createRule: false,
    exclude: false
  }; // Object to hold categorize form data
  transferData = {
    transferredTo: '',
    uncategorizedExpense: '',
    memo: '',
    bankDetail: 'Supplies Depot, Anytown',
    createRule: false,
    exclude: false
  }; // Object to hold transfer form data

  // Added missing properties for modal2
  selectedAccountName: string = 'Cash and cash equivalents';
  selectedAccountType: string = 'Cash and cash equivalents';
  selectedDetailType: string = 'Cash and cash equivalents';
  isSubaccount: boolean = false;
  selectedGSTCode: string = '';
  selectedCurrency: string = 'AUD (Australian Dollar)';
  description: string = '';
  batchPayments: boolean = false;
  disconnect: boolean = false;
  balance: number = 0; // Example balance, adjust as needed
  selectedBalanceSheet: string = 'Cash and cash equivalents';

  // Open the add modal with transaction data
  openAddModal(index: number) {
    this.currentTransactionIndex = index;
    this.selectedAction = { categorize: false, match: false, recordAsTransfer: false }; // Reset selections
    this.categorizeData = {
      supplierCustomerProject: '',
      payee: '',
      account: '',
      mealsEntertainment: '',
      productService: '',
      customerProject: '',
      billable: false,
      gst: '',
      class: '',
      memo: '',
      bankDetail: 'Coffee Place, Street, Anytown',
      createRule: false,
      exclude: false
    }; // Reset categorize data
    this.transferData = {
      transferredTo: '',
      uncategorizedExpense: '',
      memo: '',
      bankDetail: 'Supplies Depot, Anytown',
      createRule: false,
      exclude: false
    }; // Reset transfer data
    this.activeModal = 'modal3';
  }

  // Update the transaction based on checkbox selection
  updateTransaction() {
    if (this.currentTransactionIndex !== null) {
      const transaction = this.transactions[this.currentTransactionIndex];

      // Enforce single selection: deselect other checkboxes when one is selected
      if (this.selectedAction.categorize) {
        this.selectedAction.match = false;
        this.selectedAction.recordAsTransfer = false;
        transaction.action = 'Categorize';
        transaction.categoryOrMatch = this.categorizeData.account || 'Categorizing...'; // Use account as category or fallback
        if (this.categorizeData.account === 'Meals and Entertainment') {
          transaction.categoryOrMatch += ` - ${this.categorizeData.mealsEntertainment}`;
        } else if (this.categorizeData.account === 'Product/Service') {
          transaction.categoryOrMatch += ` - ${this.categorizeData.productService}`;
        }
        transaction.categoryOrMatch += ` (Payee: ${this.categorizeData.payee}, Customer/Project: ${this.categorizeData.customerProject}, GST: ${this.categorizeData.gst}, Memo: ${this.categorizeData.memo})`;
      } else if (this.selectedAction.match) {
        this.selectedAction.categorize = false;
        this.selectedAction.recordAsTransfer = false;
        transaction.action = 'Match';
        transaction.categoryOrMatch = transaction.categoryOrMatch || 'Matching...'; // Preserve existing match data
      } else if (this.selectedAction.recordAsTransfer) {
        this.selectedAction.categorize = false;
        this.selectedAction.match = false;
        transaction.action = 'Record as transfer';
        transaction.categoryOrMatch = `Transferred to: ${this.transferData.transferredTo}, Uncategorized Expense: ${this.transferData.uncategorizedExpense}, Memo: ${this.transferData.memo}`;
      } else {
        transaction.action = 'Add'; // Reset if no selection
        transaction.categoryOrMatch = transaction.categoryOrMatch || 'Uncategorized Income'; // Reset or keep original
      }
    }
  }

  // Save the transaction and close modal
  saveTransaction() {
    this.updateTransaction();
    this.closeModal();
  }

  // Open other modals (e.g., modal2 for editing)
  openModal(modal: string, data?: any) {
    this.activeModal = modal;
    // Handle data if provided (e.g., for modal2)
    if (data) {
      // Implement logic to prefill modal2 fields if needed
    }
  }

  // Close any modal
  closeModal() {
    this.activeModal = '';
    this.currentTransactionIndex = null;
  }

  // Toggle row selection (for highlighting or other purposes)
  toggleRowSelection(index: number) {
    this.selectedRow = this.selectedRow === index ? null : index;
  }

  // Added saveModal method to match the button in modal2
  saveModal() {
    // Implement save logic for modal2 if needed
    this.closeModal();
  }

  // Handle file input change (placeholder)
  onFileChange(event: any) {
    // Implement file handling logic if needed
    console.log('File selected:', event.target.files[0]);
  }
}