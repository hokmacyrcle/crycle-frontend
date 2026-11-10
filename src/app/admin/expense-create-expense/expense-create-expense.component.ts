import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

export interface CategoryItem {
  category: string;
  description: string;
  amount: number;
  gst: number;
  billable: boolean;
  markupPercent: number;
  customer: string;
  class: string;
}

export interface ExpenseFormData {
  payee_id: string;
  paymentAccount: string;
  paymentDate: string;
  paymentMethod: string;
  refNo: string;
  taxInclusive: boolean;
  memo: string;
  attachments: File[];
}

export interface ValidationErrors {
  [key: string]: string;
}

@Component({
  selector: 'app-expense-create-expense',
  templateUrl: './expense-create-expense.component.html',
  styleUrls: ['./expense-create-expense.component.scss'],
})
export class ExpenseCreateExpenseComponent implements OnInit {
  // Form Data
  showCategoryDetails: boolean = true; // Start with category details open
  showItemDetails: boolean = false; // Start with item details closed

  formData: ExpenseFormData = {
    payee_id: '',
    paymentAccount: '',
    paymentDate: this.getTodayDate(),
    paymentMethod: '',
    refNo: '',
    taxInclusive: true,
    memo: '',
    attachments: [],
  };

  // Category Items
  categoryItems: CategoryItem[] = [
    {
      category: '',
      description: '',
      amount: 0,
      gst: 10,
      billable: false,
      markupPercent: 0,
      customer: '',
      class: '',
    },
    {
      category: '',
      description: '',
      amount: 0,
      gst: 10,
      billable: false,
      markupPercent: 0,
      customer: '',
      class: '',
    },
  ];

  // Dropdown Data - Updated for Expense
  payees = [
    { id: 'payee1', name: 'ABC Suppliers' },
    { id: 'payee2', name: 'XYZ Company' },
    { id: 'payee3', name: 'Global Trade Ltd' },
    { id: 'payee4', name: 'Office Supplies Inc' },
    { id: 'payee5', name: 'Utility Company' },
  ];

  paymentAccounts = [
    { value: 'visa-credit', text: 'Visa Credit Card' },
    { value: 'checking', text: 'Checking Account' },
    { value: 'savings', text: 'Savings Account' },
    { value: 'mastercard', text: 'Mastercard' },
    { value: 'amex', text: 'American Express' },
    { value: 'cash', text: 'Cash' },
  ];

  paymentMethods = [
    { value: 'credit-card', text: 'Credit Card' },
    { value: 'debit-card', text: 'Debit Card' },
    { value: 'bank-transfer', text: 'Bank Transfer' },
    { value: 'check', text: 'Check' },
    { value: 'cash', text: 'Cash' },
    { value: 'online-payment', text: 'Online Payment' },
  ];


  customers = [
    { id: 'cust1', name: 'Customer A' },
    { id: 'cust2', name: 'Customer B' },
    { id: 'cust3', name: 'Customer C' },
  ];

  classes = [
    { id: 'class1', name: 'Service' },
    { id: 'class2', name: 'Product' },
    { id: 'class3', name: 'Consulting' },
  ];


  showError = false;
  errorMessage = '';
  validationErrors: ValidationErrors = {};

  // UI State
  showSaveDropdown = false;

  // Calculated Values
  subtotal = 0;
  total = 0;
  balance = 53370.6;

  // Item details array
  itemDetails: any[] = [
    {
      productService: '',
      description: '',
      quantity: 0,
      rate: 0,
      amount: 0,
      gst: 0,
      billable: false,
      markupPercent: 0,
      salesAmount: 0,
      customer: '',
      class: '',
    },
  ];

  constructor(private router: Router, private location: Location) {}

  ngOnInit(): void {
    // Initialize categoryItems if not already done
    if (!this.categoryItems || this.categoryItems.length === 0) {
      this.categoryItems = [
        {
          category: '',
          description: '',
          amount: 0,
          gst: 0,
          billable: false,
          markupPercent: 0,
          customer: '',
          class: '',
        },
      ];
    }

    // Initialize itemDetails
    if (!this.itemDetails || this.itemDetails.length === 0) {
      this.itemDetails = [
        {
          productService: '',
          description: '',
          quantity: 0,
          rate: 0,
          amount: 0,
          gst: 0,
          billable: false,
          markupPercent: 0,
          salesAmount: 0,
          customer: '',
          class: '',
        },
      ];
    }
    this.calculateTotals();
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showSaveDropdown = false;
    }
  }

  // Utility Methods
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getDatePlusDays(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  // Event Handlers - Updated for Expense
  onPayeeChange(): void {
    const selectedPayee = this.payees.find(
      (p) => p.id === this.formData.payee_id
    );
    if (selectedPayee) {
      // You can set any default values when payee changes
      console.log('Selected payee:', selectedPayee.name);
    }
  }

  // Category Item Management
  addCategoryLine(): void {
    this.categoryItems.push({
      category: '',
      description: '',
      amount: 0,
      gst: 10,
      billable: false,
      markupPercent: 0,
      customer: '',
      class: '',
    });
  }

  deleteCategoryLine(index: number): void {
    if (this.categoryItems.length > 1) {
      this.categoryItems.splice(index, 1);
      this.calculateTotals();
    }
  }

  clearAllLines(): void {
    this.categoryItems = [
      {
        category: '',
        description: '',
        amount: 0,
        gst: 10,
        billable: false,
        markupPercent: 0,
        customer: '',
        class: '',
      },
    ];
    this.calculateTotals();
  }

  // Toggle methods

  toggleCategoryDetails(): void {
    this.showCategoryDetails = !this.showCategoryDetails;
  }

  toggleItemDetails(): void {
    this.showItemDetails = !this.showItemDetails;
  }

  // Item management methods
  addItemLine(): void {
    this.itemDetails.push({
      productService: '',
      description: '',
      quantity: 0,
      rate: 0,
      amount: 0,
      gst: 0,
      billable: false,
      markupPercent: 0,
      salesAmount: 0,
      customer: '',
      class: '',
    });
  }

  deleteItemLine(index: number): void {
    this.itemDetails.splice(index, 1);
    this.calculateTotals();
  }

  clearAllItemLines(): void {
    this.itemDetails = [
      {
        productService: '',
        description: '',
        quantity: 0,
        rate: 0,
        amount: 0,
        gst: 0,
        billable: false,
        markupPercent: 0,
        salesAmount: 0,
        customer: '',
        class: '',
      },
    ];
    this.calculateTotals();
  }

  // Calculation methods
  calculateItemAmount(index: number): void {
    const item = this.itemDetails[index];
    if (item) {
      item.amount = (item.quantity || 0) * (item.rate || 0);
      this.calculateSalesAmount(index);
      this.calculateTotals();
    }
  }

  calculateSalesAmount(index: number): void {
    const item = this.itemDetails[index];
    if (item) {
      const markupMultiplier = 1 + (item.markupPercent || 0) / 100;
      item.salesAmount = (item.amount || 0) * markupMultiplier;
      this.calculateTotals();
    }
  }

  // Updated calculateTotals method
  calculateTotals(): void {
    // Subtotals
    const categorySubtotal = this.categoryItems.reduce((sum, item) => {
      return sum + (item.amount || 0);
    }, 0);

    const itemSubtotal = this.itemDetails.reduce((sum, item) => {
      return sum + (item.amount || 0);
    }, 0);

    // Combined subtotal
    this.subtotal = categorySubtotal + itemSubtotal;

    // GST for categories
    const categoryGstTotal = this.categoryItems.reduce((sum, item) => {
      const amount = item.amount || 0;
      const gstRate = item.gst || 0;
      let gstAmount = 0;

      if (this.formData.taxInclusive) {
        gstAmount = amount - amount / (1 + gstRate / 100);
      } else {
        gstAmount = amount * (gstRate / 100);
      }

      return sum + gstAmount;
    }, 0);

    // GST for items
    const itemGstTotal = this.itemDetails.reduce((sum, item) => {
      const amount = item.amount || 0;
      const gstRate = item.gst || 0;
      let gstAmount = 0;

      if (this.formData.taxInclusive) {
        gstAmount = amount - amount / (1 + gstRate / 100);
      } else {
        gstAmount = amount * (gstRate / 100);
      }

      return sum + gstAmount;
    }, 0);

    // Total GST
    const totalGst = categoryGstTotal + itemGstTotal;

    // Final totals
    this.total = this.subtotal + (this.formData.taxInclusive ? 0 : totalGst);
  }

  // File Upload Handling
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size <= 20 * 1024 * 1024) {
        this.formData.attachments.push(file);
      } else {
        this.showErrorMessage(`File ${file.name} exceeds the 20MB limit.`);
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size <= 20 * 1024 * 1024) {
          this.formData.attachments.push(file);
        } else {
          this.showErrorMessage(`File ${file.name} exceeds the 20MB limit.`);
        }
      }
    }
  }

  removeAttachment(index: number): void {
    this.formData.attachments.splice(index, 1);
  }

  showExisting(): void {
    console.log('Show existing attachments');
  }

  // Form Validation - Updated for Expense
  validateForm(): boolean {
    this.validationErrors = {};
    let isValid = true;

    if (!this.formData.payee_id) {
      this.validationErrors['payee_id'] = 'Payee is required';
      isValid = false;
    }

    if (!this.formData.paymentAccount) {
      this.validationErrors['paymentAccount'] = 'Payment account is required';
      isValid = false;
    }

    if (!this.formData.paymentDate) {
      this.validationErrors['paymentDate'] = 'Payment date is required';
      isValid = false;
    }

    const hasValidItems = this.categoryItems.some(
      (item) =>
        item.category.trim() !== '' ||
        item.description.trim() !== '' ||
        item.amount > 0
    );

    if (!hasValidItems) {
      this.validationErrors['categoryItems'] =
        'At least one category item is required';
      isValid = false;
    }

    return isValid;
  }

  getValidationErrorKeys(): string[] {
    return Object.keys(this.validationErrors);
  }

  getFieldError(fieldName: string): string {
    return this.validationErrors[fieldName] || '';
  }

  // Error Display
  showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;
  }

  hideError(): void {
    this.showError = false;
    this.errorMessage = '';
    this.validationErrors = {};
  }

  // Form Actions - Updated for Expense
  saveExpense(): void {
    if (this.validateForm()) {
      console.log('Saving expense...', this.formData, this.categoryItems);
      alert('Expense saved successfully!');
      this.resetForm();
    } else {
      this.showErrorMessage('Please fix the validation errors before saving.');
    }
  }

  saveAndClose(): void {
    if (this.validateForm()) {
      console.log(
        'Saving and closing expense...',
        this.formData,
        this.categoryItems
      );
      alert('Expense saved successfully!');
      this.closeExpense();
    } else {
      this.showErrorMessage('Please fix the validation errors before saving.');
    }
    this.showSaveDropdown = false;
  }

  saveAndNew(): void {
    if (this.validateForm()) {
      console.log(
        'Saving expense and creating new...',
        this.formData,
        this.categoryItems
      );
      alert('Expense saved successfully! Creating new expense...');
      this.resetForm();
    } else {
      this.showErrorMessage('Please fix the validation errors before saving.');
    }
    this.showSaveDropdown = false;
  }

  cancelExpense(): void {
    if (this.hasUnsavedChanges()) {
      if (
        confirm(
          'Are you sure you want to cancel? All unsaved changes will be lost.'
        )
      ) {
        this.closeExpense();
      }
    } else {
      this.closeExpense();
    }
  }

  // Enhanced close functionality - Updated for Expense
  closeExpense(): void {
    if (this.hasUnsavedChanges()) {
      const confirmClose = confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmClose) {
        return;
      }
    }

    // Navigate back to previous page
    this.location.back();
  }

  printExpense(): void {
    console.log('Printing expense...');
    window.print();
  }

  makeRecurring(): void {
    console.log('Making expense recurring...');
    alert('Recurring expense feature coming soon!');
  }

  toggleSaveDropdown(): void {
    this.showSaveDropdown = !this.showSaveDropdown;
  }

  // Utility Methods - Updated for Expense
  resetForm(): void {
    this.formData = {
      payee_id: '',
      paymentAccount: '',
      paymentDate: this.getTodayDate(),
      paymentMethod: '',
      refNo: '',
      taxInclusive: true,
      memo: '',
      attachments: [],
    };

    this.categoryItems = [
      {
        category: '',
        description: '',
        amount: 0,
        gst: 10,
        billable: false,
        markupPercent: 0,
        customer: '',
        class: '',
      },
    ];

    this.calculateTotals();
    this.hideError();
  }

  hasUnsavedChanges(): boolean {
    return (
      this.formData.payee_id !== '' ||
      this.formData.memo !== '' ||
      this.formData.refNo !== '' ||
      this.formData.attachments.length > 0 ||
      this.categoryItems.some(
        (item) =>
          item.category !== '' || item.description !== '' || item.amount > 0
      )
    );
  }
}
