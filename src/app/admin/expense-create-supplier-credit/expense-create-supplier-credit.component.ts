import { Component, OnInit, HostListener } from '@angular/core';
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

export interface SupplierCreditFormData {
  supplier_id: string;
  mailingAddress: string;
  paymentDate: string;
  refNo: string;
  taxInclusive: boolean;
  memo: string;
  attachments: File[];
}

export interface ValidationErrors {
  [key: string]: string;
}

@Component({
  selector: 'app-expense-create-supplier-credit',
  templateUrl: './expense-create-supplier-credit.component.html',
  styleUrls: ['./expense-create-supplier-credit.component.scss'],
})
export class ExpenseCreateSupplierCreditComponent implements OnInit {
  // Form Data
  showCategoryDetails: boolean = true;
  showItemDetails: boolean = false;

  formData: SupplierCreditFormData = {
    supplier_id: '',
    mailingAddress: '',
    paymentDate: this.getTodayDate(),
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

  // Dropdown Data - Updated for Supplier Credit
  suppliers = [
    { id: 'supplier1', name: 'ABC Suppliers Ltd' },
    { id: 'supplier2', name: 'Global Trading Co' },
    { id: 'supplier3', name: 'Quality Parts Inc' },
    { id: 'supplier4', name: 'Industrial Supplies' },
    { id: 'supplier5', name: 'Office Materials Co' },
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showSaveDropdown = false;
    }
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Event Handlers
  onSupplierChange(): void {
    const selectedSupplier = this.suppliers.find(
      (s) => s.id === this.formData.supplier_id
    );
    if (selectedSupplier) {
      console.log('Selected supplier:', selectedSupplier.name);
      // You can set default mailing address here if needed
    }
  }

  toggleCategoryDetails(): void {
    this.showCategoryDetails = !this.showCategoryDetails;
  }

  toggleItemDetails(): void {
    this.showItemDetails = !this.showItemDetails;
  }

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

  // Form Validation - Updated for Supplier Credit
  validateForm(): boolean {
    this.validationErrors = {};
    let isValid = true;

    if (!this.formData.supplier_id) {
      this.validationErrors['supplier_id'] = 'Supplier is required';
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


  showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;
  }

  hideError(): void {
    this.showError = false;
    this.errorMessage = '';
    this.validationErrors = {};
  }

  // Form Actions -
  saveSupplierCredit(): void {
    if (this.validateForm()) {
      console.log(
        'Saving supplier credit...',
        this.formData,
        this.categoryItems
      );
      alert('Supplier credit saved successfully!');
      this.resetForm();
    } else {
      this.showErrorMessage('Please fix the validation errors before saving.');
    }
  }

  saveAndClose(): void {
    if (this.validateForm()) {
      console.log(
        'Saving and closing supplier credit...',
        this.formData,
        this.categoryItems
      );
      alert('Supplier credit saved successfully!');
      this.closeSupplierCredit();
    } else {
      this.showErrorMessage('Please fix the validation errors before saving.');
    }
    this.showSaveDropdown = false;
  }

  saveAndNew(): void {
    if (this.validateForm()) {
      console.log(
        'Saving supplier credit and creating new...',
        this.formData,
        this.categoryItems
      );
      alert(
        'Supplier credit saved successfully! Creating new supplier credit...'
      );
      this.resetForm();
    } else {
      this.showErrorMessage('Please fix the validation errors before saving.');
    }
    this.showSaveDropdown = false;
  }

  cancelSupplierCredit(): void {
    if (this.hasUnsavedChanges()) {
      if (
        confirm(
          'Are you sure you want to cancel? All unsaved changes will be lost.'
        )
      ) {
        this.closeSupplierCredit();
      }
    } else {
      this.closeSupplierCredit();
    }
  }

  closeSupplierCredit(): void {
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

  makeRecurring(): void {
    console.log('Making supplier credit recurring...');
    alert('Recurring supplier credit feature coming soon!');
  }

  toggleSaveDropdown(): void {
    this.showSaveDropdown = !this.showSaveDropdown;
  }

  //  utility methods for Supplier Credit
  resetForm(): void {
    this.formData = {
      supplier_id: '',
      mailingAddress: '',
      paymentDate: this.getTodayDate(),
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
      this.formData.supplier_id !== '' ||
      this.formData.memo !== '' ||
      this.formData.refNo !== '' ||
      this.formData.mailingAddress !== '' ||
      this.formData.attachments.length > 0 ||
      this.categoryItems.some(
        (item) =>
          item.category !== '' || item.description !== '' || item.amount > 0
      )
    );
  }
}
