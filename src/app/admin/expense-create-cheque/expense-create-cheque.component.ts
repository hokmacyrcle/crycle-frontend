import { Component, OnInit, HostListener, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FeedbackDialogComponent } from '../feedback-dialog/feedback-dialog.component';
import { MatDialog } from '@angular/material/dialog';



// Same CategoryItem interface as expense
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

// Updated interface for Cheque Form Data
export interface ChequeFormData {
  payee_id: string;
  bankAccount: string;
  paymentDate: string;
  chequeNo: string;
  mailingAddress: string;
  taxInclusive: boolean;
  memo: string;
  attachments: File[];
}

// Same ValidationErrors interface as expense
export interface ValidationErrors {
  [key: string]: string;
}

// New interfaces for side panel
export interface NewAccount {
  name: string;
  type: string;
  detailType: string;
  isSubAccount: boolean;
  description: string;
}

export interface NewProduct {
  name: string;
  description: string;
  type: string;
  rate: number;
  category: string;
}

@Component({
  selector: 'app-expense-create-cheque',
  templateUrl: './expense-create-cheque.component.html',
  styleUrls: ['./expense-create-cheque.component.scss'],
})
export class ExpenseCreateChequeComponent implements OnInit {
  // Form Data - Updated for Cheque
  showCategoryDetails: boolean = true;
  showItemDetails: boolean = false;

  formData: ChequeFormData = {
    payee_id: '',
    bankAccount: '',
    paymentDate: this.getTodayDate(),
    chequeNo: '2080',
    mailingAddress: '',
    taxInclusive: true,
    memo: '',
    attachments: [],
  };

  // Category Items (Same as expense)
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

  // Dropdown Data - Updated for Cheque
  payees = [
    { id: 'payee1', name: 'ABC Suppliers' },
    { id: 'payee2', name: 'XYZ Company' },
    { id: 'payee3', name: 'Global Trade Ltd' },
    { id: 'payee4', name: 'Office Supplies Inc' },
    { id: 'payee5', name: 'Utility Company' },
  ];

  // Updated for bank accounts instead of payment accounts
  bankAccounts = [
    { value: 'checking-001', text: 'Checking Account - *001' },
    { value: 'savings-002', text: 'Savings Account - *002' },
    { value: 'business-003', text: 'Business Account - *003' },
    { value: 'cash-004', text: 'Cash Account' },
  ];

  // Same dropdown data as expense
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

  // Same error handling as expense
  showError = false;
  errorMessage = '';
  validationErrors: ValidationErrors = {};

  // Same UI state as expense
  showSaveDropdown = false;

  // Same calculated values as expense
  subtotal = 0;
  total = 0;
  balance = 53370.6; // Updated to match the cheque balance shown in image

  // Same item details array as expense
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

  // Side panel properties
  showSidePanel = false;
  sidePanelType: 'account' | 'product' = 'account';
  sidePanelTitle = '';
  currentRowIndex = -1;

  // Dropdown states
  showCategoryDropdown: boolean[] = [];
  showProductDropdown: boolean[] = [];

  // New item forms
  newAccount: NewAccount = {
    name: '',
    type: '',
    detailType: '',
    isSubAccount: false,
    description: '',
  };

  newProduct: NewProduct = {
    name: '',
    description: '',
    type: '',
    rate: 0,
    category: '',
  };

  // Sample data for dropdowns
  expenseCategories = [
    { name: 'Amortisation (and depreciation) expense - AUD', type: 'Expense' },
    { name: 'BAS Expense - AUD', type: 'Expense' },
    { name: 'Bad debts - AUD', type: 'Expense' },
    { name: 'Bank charges - AUD', type: 'Expense' },
    { name: 'Commissions and fees - AUD', type: 'Expense' },
    { name: 'Communication Expense - Fixed - AUD', type: 'Expense' },
    { name: 'Office Supplies', type: 'Expense' },
    { name: 'Travel Expenses', type: 'Expense' },
    { name: 'Professional Services', type: 'Expense' },
    { name: 'Advertising', type: 'Expense' },
  ];

  products = [
    {
      name: 'Employee Celebration',
      description: 'Employee celebration -- Anniversary / Retirement',
      type: 'Employee events',
      rate: 0,
    },
    {
      name: 'Employee Training',
      description: 'Employee training off site',
      type: 'Employee events',
      rate: 0,
    },
    {
      name: 'Name Badges',
      description: 'NB-1944',
      type: 'General services > Badges',
      rate: 15.0,
    },
    {
      name: 'Catering',
      description: 'Catering - food & beverage',
      type: 'General services',
      rate: 25.0,
    },
  ];

  constructor(
    private router: Router,
    private location: Location,
    private dialog: MatDialog
  ) {}

  // Same ngOnInit as expense
  ngOnInit(): void {
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

  // Same document click handler as expense but updated for dropdowns
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Close dropdowns when clicking outside
    if (!target.closest('td') && !target.closest('.relative')) {
      this.showCategoryDropdown = [];
      this.showProductDropdown = [];
    }

    if (!target.closest('.relative')) {
      this.showSaveDropdown = false;
    }
  }

  // Same utility methods as expense
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getDatePlusDays(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  // Updated for cheque
  onPayeeChange(): void {
    const selectedPayee = this.payees.find(
      (p) => p.id === this.formData.payee_id
    );
    if (selectedPayee) {
      console.log('Selected payee:', selectedPayee.name);
    }
  }

  // Category dropdown methods
  toggleCategoryDropdown(index: number): void {
    this.showCategoryDropdown = [];
    this.showProductDropdown = [];
    this.showCategoryDropdown[index] = !this.showCategoryDropdown[index];
  }

  selectCategory(index: number, category: any): void {
    this.categoryItems[index].category = category.name;
    this.showCategoryDropdown[index] = false;
  }

  // Product dropdown methods
  toggleProductDropdown(index: number): void {
    this.showProductDropdown = [];
    this.showCategoryDropdown = [];
    this.showProductDropdown[index] = !this.showProductDropdown[index];
  }

  selectProduct(index: number, product: any): void {
    this.itemDetails[index].productService = product.name;
    this.itemDetails[index].description = product.description;
    this.itemDetails[index].rate = product.rate;
    this.calculateItemAmount(index);
    this.showProductDropdown[index] = false;
  }

  // Side panel methods
  openNewAccountPanel(type: 'category' | 'item', rowIndex: number): void {
    this.sidePanelType = 'account';
    this.sidePanelTitle = 'New account';
    this.currentRowIndex = rowIndex;
    this.showSidePanel = true;
    this.resetNewAccount();

    // Close any open dropdowns
    this.showCategoryDropdown = [];
    this.showProductDropdown = [];
  }

  openNewProductPanel(type: 'item', rowIndex: number): void {
    this.sidePanelType = 'product';
    this.sidePanelTitle = 'Product/Service information';
    this.currentRowIndex = rowIndex;
    this.showSidePanel = true;
    this.resetNewProduct();

    // Close any open dropdowns
    this.showProductDropdown = [];
  }

  closeSidePanel(): void {
    this.showSidePanel = false;
    this.currentRowIndex = -1;
  }

  // Product type selection
  selectProductType(type: string): void {
    this.newProduct.type = type;
  }

  // Save new account
  saveNewAccount(): void {
    if (
      this.newAccount.name &&
      this.newAccount.type &&
      this.newAccount.detailType
    ) {
      const newCategory = {
        name: this.newAccount.name,
        type: this.newAccount.type,
      };

      this.expenseCategories.push(newCategory);

      // Set the new category in the current row
      if (this.currentRowIndex >= 0) {
        this.categoryItems[this.currentRowIndex].category = newCategory.name;
      }

      this.closeSidePanel();
      alert('Account created successfully!');
    }
  }

  // Save new product
  saveNewProduct(): void {
    if (this.newProduct.name && this.newProduct.type) {
      const newProduct = {
        name: this.newProduct.name,
        description: this.newProduct.description,
        type: this.newProduct.category || this.newProduct.type,
        rate: this.newProduct.rate,
      };

      this.products.push(newProduct);

      // Set the new product in the current row
      if (this.currentRowIndex >= 0) {
        this.itemDetails[this.currentRowIndex].productService = newProduct.name;
        this.itemDetails[this.currentRowIndex].description =
          newProduct.description;
        this.itemDetails[this.currentRowIndex].rate = newProduct.rate;
        this.calculateItemAmount(this.currentRowIndex);
      }

      this.closeSidePanel();
      alert('Product/Service created successfully!');
    }
  }

  // Reset forms
  resetNewAccount(): void {
    this.newAccount = {
      name: '',
      type: '',
      detailType: '',
      isSubAccount: false,
      description: '',
    };
  }

  resetNewProduct(): void {
    this.newProduct = {
      name: '',
      description: '',
      type: '',
      rate: 0,
      category: '',
    };
  }

  // Same category management methods as expense
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

  // Same toggle methods as expense
  toggleCategoryDetails(): void {
    this.showCategoryDetails = !this.showCategoryDetails;
  }

  toggleItemDetails(): void {
    this.showItemDetails = !this.showItemDetails;
  }

  // Same item management methods as expense
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

  // Same calculation methods as expense
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

  // Same calculateTotals method as expense
  calculateTotals(): void {
    const categorySubtotal = this.categoryItems.reduce((sum, item) => {
      return sum + (item.amount || 0);
    }, 0);
    const itemSubtotal = this.itemDetails.reduce((sum, item) => {
      return sum + (item.amount || 0);
    }, 0);

    this.subtotal = categorySubtotal + itemSubtotal;

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

    const totalGst = categoryGstTotal + itemGstTotal;
    this.total = this.subtotal + (this.formData.taxInclusive ? 0 : totalGst);
  }

  // Same file upload methods as expense
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

  // Updated validation for cheque
  validateForm(): boolean {
    this.validationErrors = {};
    let isValid = true;

    if (!this.formData.payee_id) {
      this.validationErrors['payee_id'] = 'Payee is required';
      isValid = false;
    }

    if (!this.formData.bankAccount) {
      this.validationErrors['bankAccount'] = 'Bank account is required';
      isValid = false;
    }

    if (!this.formData.paymentDate) {
      this.validationErrors['paymentDate'] = 'Payment date is required';
      isValid = false;
    }

    if (!this.formData.chequeNo) {
      this.validationErrors['chequeNo'] = 'Cheque number is required';
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

  // Same error handling methods as expense
  getValidationErrorKeys(): string[] {
    return Object.keys(this.validationErrors);
  }

  getFieldError(fieldName: string): string {
    return this.validationErrors[fieldName] || '';
  }

  showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;
  }

  hideError(): void {
    this.showError = false;
    this.errorMessage = '';
    this.validationErrors = {};
  }

  // Updated form actions for cheque
  saveCheque(): void {
    if (this.validateForm()) {
      console.log('Saving cheque...', this.formData, this.categoryItems);
      alert('Cheque saved successfully!');
      this.resetForm();
    } else {
      this.showErrorMessage('Please fix the validation errors before saving.');
    }
  }

  saveAndClose(): void {
    if (this.validateForm()) {
      console.log(
        'Saving and closing cheque...',
        this.formData,
        this.categoryItems
      );
      alert('Cheque saved successfully!');
      this.closeCheque();
    } else {
      this.showErrorMessage('Please fix the validation errors before saving.');
    }
    this.showSaveDropdown = false;
  }

  saveAndNew(): void {
    if (this.validateForm()) {
      console.log(
        'Saving cheque and creating new...',
        this.formData,
        this.categoryItems
      );
      alert('Cheque saved successfully! Creating new cheque...');
      this.resetForm();
    } else {
      this.showErrorMessage('Please fix the validation errors before saving.');
    }
    this.showSaveDropdown = false;
  }

  cancelCheque(): void {
    if (this.hasUnsavedChanges()) {
      if (
        confirm(
          'Are you sure you want to cancel? All unsaved changes will be lost.'
        )
      ) {
        this.closeCheque();
      }
    } else {
      this.closeCheque();
    }
  }

  closeCheque(): void {
    if (this.hasUnsavedChanges()) {
      const confirmClose = confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmClose) {
        return;
      }
    }
    this.location.back();
  }

  printCheque(): void {
    console.log('Printing cheque...');
    window.print();
  }

  // Same recurring and dropdown methods as expense
  makeRecurring(): void {
    console.log('Making cheque recurring...');
    alert('Recurring cheque feature coming soon!');
  }

  toggleSaveDropdown(): void {
    this.showSaveDropdown = !this.showSaveDropdown;
  }

  // Updated reset form for cheque
  resetForm(): void {
    this.formData = {
      payee_id: '',
      bankAccount: '',
      paymentDate: this.getTodayDate(),
      chequeNo: '2080',
      mailingAddress: '',
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

  openFeedbackDialog(): void {
    this.dialog.open(FeedbackDialogComponent, {
      width: '400px',
      panelClass: 'rounded-lg',
    });
  }

  // Updated hasUnsavedChanges for cheque
  hasUnsavedChanges(): boolean {
    return (
      this.formData.payee_id !== '' ||
      this.formData.memo !== '' ||
      this.formData.chequeNo !== '2080' ||
      this.formData.mailingAddress !== '' ||
      this.formData.attachments.length > 0 ||
      this.categoryItems.some(
        (item) =>
          item.category !== '' || item.description !== '' || item.amount > 0
      )
    );
  }
}
