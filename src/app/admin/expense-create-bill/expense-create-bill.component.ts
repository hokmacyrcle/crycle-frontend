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

export interface BillFormData {
  supplier_id: string;
  mailingAddress: string;
  terms: string;
  billDate: string;
  dueDate: string;
  billNo: string;
  taxInclusive: boolean;
  memo: string;
  attachments: File[];
}

export interface ValidationErrors {
  [key: string]: string;
}

@Component({
  selector: 'app-expense-create-bill',
  templateUrl: './expense-create-bill.component.html',
  styleUrls: ['./expense-create-bill.component.scss'],
})
export class ExpenseCreateBillComponent implements OnInit {
  // Form Data

  showCategoryDetails: boolean = true; // Start with category details open
  showItemDetails: boolean = false; // Start with item details closed

  formData: BillFormData = {
    supplier_id: '',
    mailingAddress: '',
    terms: 'Net 15',
    billDate: this.getTodayDate(),
    dueDate: this.getDatePlusDays(15),
    billNo: '',
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

  // Dropdown Data
  suppliers = [
    { id: 'sup1', name: 'ABC Suppliers' },
    { id: 'sup2', name: 'XYZ Company' },
    { id: 'sup3', name: 'Global Trade Ltd' },
  ];

  paymentTerms = [
    { value: 'Net 15', text: 'Net 15' },
    { value: 'Net 30', text: 'Net 30' },
    { value: 'Net 45', text: 'Net 45' },
    { value: 'Net 60', text: 'Net 60' },
    { value: 'Due on receipt', text: 'Due on receipt' },
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

  // Error Handling
  showError = false;
  errorMessage = '';
  validationErrors: ValidationErrors = {};

  // UI State
  showSaveDropdown = false;

  // Calculated Values
  subtotal = 0;
  total = 0;
  balanceDue = 0;

  //Item details array
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

  // Event Handlers
  onSupplierChange(): void {
    const selectedSupplier = this.suppliers.find(
      (s) => s.id === this.formData.supplier_id
    );
    if (selectedSupplier) {
      this.formData.mailingAddress = `${selectedSupplier.name}\n123 Business Street\nCity, State 12345\nCountry`;
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

  // Updated calculateTotals method to include both category and item totals
  calculateTotals(): void {
    // ✅ Subtotals
    const categorySubtotal = this.categoryItems.reduce((sum, item) => {
      return sum + (item.amount || 0);
    }, 0);

    const itemSubtotal = this.itemDetails.reduce((sum, item) => {
      return sum + (item.amount || 0);
    }, 0);

    // Combined subtotal
    this.subtotal = categorySubtotal + itemSubtotal;

    // ✅ GST for categories
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

    // ✅ GST for items
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

    // ✅ Total GST
    const totalGst = categoryGstTotal + itemGstTotal;

    // ✅ Final totals
    this.total = this.subtotal + (this.formData.taxInclusive ? 0 : totalGst);
    this.balanceDue = this.total;
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

  // Form Validation
  validateForm(): boolean {
    this.validationErrors = {};
    let isValid = true;

    if (!this.formData.supplier_id) {
      this.validationErrors['supplier_id'] = 'Supplier is required';
      isValid = false;
    }

    if (!this.formData.terms) {
      this.validationErrors['terms'] = 'Terms are required';
      isValid = false;
    }

    if (!this.formData.billDate) {
      this.validationErrors['billDate'] = 'Bill date is required';
      isValid = false;
    }

    if (!this.formData.dueDate) {
      this.validationErrors['dueDate'] = 'Due date is required';
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

  // Form Actions
  saveBill(): void {
    if (this.validateForm()) {
      console.log('Saving bill...', this.formData, this.categoryItems);
      alert('Bill saved successfully!');
      this.resetForm();
    } else {
      this.showErrorMessage('Please fix the validation errors before saving.');
    }
  }

  saveAndClose(): void {
    if (this.validateForm()) {
      console.log(
        'Saving and closing bill...',
        this.formData,
        this.categoryItems
      );
      alert('Bill saved successfully!');
      this.closeBill();
    } else {
      this.showErrorMessage('Please fix the validation errors before saving.');
    }
    this.showSaveDropdown = false;
  }

  saveAndNew(): void {
    if (this.validateForm()) {
      console.log(
        'Saving bill and creating new...',
        this.formData,
        this.categoryItems
      );
      alert('Bill saved successfully! Creating new bill...');
      this.resetForm();
    } else {
      this.showErrorMessage('Please fix the validation errors before saving.');
    }
    this.showSaveDropdown = false;
  }

  cancelBill(): void {
    if (this.hasUnsavedChanges()) {
      if (
        confirm(
          'Are you sure you want to cancel? All unsaved changes will be lost.'
        )
      ) {
        this.closeBill();
      }
    } else {
      this.closeBill();
    }
  }

  // Enhanced close functionality with unsaved changes detection
  closeBill(): void {
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

  // Alternative method to navigate to specific route
  closeBillToSpecificRoute(): void {
    if (this.hasUnsavedChanges()) {
      const confirmClose = confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmClose) {
        return;
      }
    }

    // Navigate to bills list or dashboard
    this.router.navigate(['/bills']); // Change this to your desired route
  }

  // Enhanced close with save prompt
  closeBillWithSavePrompt(): void {
    if (this.hasUnsavedChanges()) {
      const choice = confirm(
        'Do you want to save your changes before closing?\n\nClick "OK" to save and close, or "Cancel" to close without saving.'
      );

      if (choice) {
        // Save the bill first, then close
        if (this.validateForm()) {
          console.log(
            'Saving bill before closing...',
            this.formData,
            this.categoryItems
          );
          // Here you would typically make an API call to save
          // After successful save:
          this.location.back();
        } else {
          this.showErrorMessage(
            'Please fix the validation errors before saving.'
          );
          return;
        }
      } else {
        // Close without saving after confirmation
        const confirmDiscard = confirm(
          'Are you sure you want to discard your changes?'
        );
        if (confirmDiscard) {
          this.location.back();
        }
      }
    } else {
      // No changes, safe to close
      this.location.back();
    }
  }

  printBill(): void {
    console.log('Printing bill...');
    window.print();
  }

  makeRecurring(): void {
    console.log('Making bill recurring...');
    alert('Recurring bill feature coming soon!');
  }

  toggleSaveDropdown(): void {
    this.showSaveDropdown = !this.showSaveDropdown;
  }

  // Utility Methods
  resetForm(): void {
    this.formData = {
      supplier_id: '',
      mailingAddress: '',
      terms: 'Net 15',
      billDate: this.getTodayDate(),
      dueDate: this.getDatePlusDays(15),
      billNo: '',
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
      this.formData.billNo !== '' ||
      this.formData.attachments.length > 0 ||
      this.categoryItems.some(
        (item) =>
          item.category !== '' || item.description !== '' || item.amount > 0
      )
    );
  }
}
