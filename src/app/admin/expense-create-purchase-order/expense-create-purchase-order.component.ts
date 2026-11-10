import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

// Purchase Order specific interfaces
export interface CategoryItem {
  category: string;
  description: string;
  amount: number;
  gst: number;
  customer: string;
  class: string;
}

export interface ItemDetail {
  productService: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  gst: number;
  customer: string;
  class: string;
}

export interface PurchaseOrderFormData {
  supplier_id: string;
  email: string;
  status: string;
  mailingAddress: string;
  shippingAddress: any;
  shipToCustomer: string;
  purchaseOrderDate: string;
  shipVia: string;
  taxInclusive: boolean;
  messageToSupplier: string;
  memo: string;
  attachments: File[];
}

export interface ValidationErrors {
  [key: string]: string;
}

@Component({
  selector: 'app-expense-create-purchase-order',
  templateUrl: './expense-create-purchase-order.component.html',
  styleUrls: ['./expense-create-purchase-order.component.scss'],
})
export class ExpenseCreatePurchaseOrderComponent implements OnInit {
  // Form Data
  showCategoryDetails: boolean = true;
  showItemDetails: boolean = false;

  formData: PurchaseOrderFormData = {
    supplier_id: '',
    email: '',
    status: 'OPEN',
    mailingAddress: '',
    shippingAddress:'',
    shipToCustomer: '',
    purchaseOrderDate: this.getTodayDate(),
    shipVia: '',
    taxInclusive: true,
    messageToSupplier: '',
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
      customer: '',
      class: '',
    },
    {
      category: '',
      description: '',
      amount: 0,
      gst: 10,
      customer: '',
      class: '',
    },
  ];

  // Item Details
  itemDetails: ItemDetail[] = [
    {
      productService: '',
      description: '',
      quantity: 0,
      rate: 0,
      amount: 0,
      gst: 0,
      customer: '',
      class: '',
    },
    {
      productService: '',
      description: '',
      quantity: 0,
      rate: 0,
      amount: 0,
      gst: 0,
      customer: '',
      class: '',
    },
  ];

  // Dropdown Data - Purchase Order specific
  suppliers = [
    {
      id: 'supplier1',
      name: 'ABC Suppliers Ltd',
      address: 'Supplier Company ABC_2\n2500 Garcia Ave\nSydney NSW 2000',
    },
    {
      id: 'supplier2',
      name: 'XYZ Wholesale',
      address: 'XYZ Wholesale Co\n1234 Business St\nMelbourne VIC 3000',
    },
    {
      id: 'supplier3',
      name: 'Global Trade Partners',
      address: 'Global Trade Ltd\n789 Commerce Blvd\nBrisbane QLD 4000',
    },
    {
      id: 'supplier4',
      name: 'Office Supplies Direct',
      address: 'Office Direct\n456 Supply Chain Dr\nPerth WA 6000',
    },
    {
      id: 'supplier5',
      name: 'Industrial Equipment Co',
      address: 'Industrial Equipment\n321 Manufacturing Rd\nAdelaide SA 5000',
    },
  ];

  customers = [
    {
      id: 'cust1',
      name: 'Customer A',
      address: 'Customer A Ltd\n123 Business St\nSydney NSW 2000',
    },
    {
      id: 'cust2',
      name: 'Customer B',
      address: 'Customer B Corp\n456 Enterprise Ave\nMelbourne VIC 3000',
    },
    {
      id: 'cust3',
      name: 'Customer C',
      address: 'Customer C Inc\n789 Commerce Blvd\nBrisbane QLD 4000',
    },
  ];

  classes = [
    { id: 'class1', name: 'Service' },
    { id: 'class2', name: 'Product' },
    { id: 'class3', name: 'Consulting' },
    { id: 'class4', name: 'Equipment' },
    { id: 'class5', name: 'Materials' },
  ];

  // Error handling (same as expense)
  showError = false;
  errorMessage = '';
  validationErrors: ValidationErrors = {};

  // UI State (same as expense)
  showSaveDropdown = false;

  // Calculated Values (same as expense)
  subtotal = 0;
  total = 0;

  constructor(private router: Router, private location: Location) {}

  ngOnInit(): void {
    // Initialize arrays if not already done
    if (!this.categoryItems || this.categoryItems.length === 0) {
      this.categoryItems = [
        {
          category: '',
          description: '',
          amount: 0,
          gst: 10,
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
          customer: '',
          class: '',
        },
      ];
    }
    this.calculateTotals();
  }

  // Close dropdown when clicking outside (same as expense)
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showSaveDropdown = false;
    }
  }

  // Utility Methods (same as expense)
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Purchase Order specific event handlers
  onSupplierChange(): void {
    const selectedSupplier = this.suppliers.find(
      (s) => s.id === this.formData.supplier_id
    );
    if (selectedSupplier) {
      this.formData.mailingAddress = selectedSupplier.address;
      console.log('Selected supplier:', selectedSupplier.name);
    }
  }

  getSelectedCustomerAddress(): string {
    const selectedCustomer = this.customers.find(
      (c) => c.id === this.formData.shipToCustomer
    );
    return selectedCustomer ? selectedCustomer.address : '';
  }

  // Category and Item management methods (same logic as expense)
  addCategoryLine(): void {
    this.categoryItems.push({
      category: '',
      description: '',
      amount: 0,
      gst: 10,
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
        customer: '',
        class: '',
      },
    ];
    this.calculateTotals();
  }

  // Toggle methods (same as expense)
  toggleCategoryDetails(): void {
    this.showCategoryDetails = !this.showCategoryDetails;
  }

  toggleItemDetails(): void {
    this.showItemDetails = !this.showItemDetails;
  }

  // Item management methods (same as expense)
  addItemLine(): void {
    this.itemDetails.push({
      productService: '',
      description: '',
      quantity: 0,
      rate: 0,
      amount: 0,
      gst: 0,
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
        customer: '',
        class: '',
      },
    ];
    this.calculateTotals();
  }

  // Calculation methods (same as expense)
  calculateItemAmount(index: number): void {
    const item = this.itemDetails[index];
    if (item) {
      item.amount = (item.quantity || 0) * (item.rate || 0);
      this.calculateTotals();
    }
  }

  // Updated calculateTotals method (same logic as expense)
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

  // File Upload Handling (same as expense)
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

  // Form Validation - Purchase Order specific
  validateForm(): boolean {
    this.validationErrors = {};
    let isValid = true;

    if (!this.formData.supplier_id) {
      this.validationErrors['supplier_id'] = 'Supplier is required';
      isValid = false;
    }

    if (!this.formData.purchaseOrderDate) {
      this.validationErrors['purchaseOrderDate'] =
        'Purchase Order date is required';
      isValid = false;
    }

    const hasValidItems =
      this.categoryItems.some(
        (item) =>
          item.category.trim() !== '' ||
          item.description.trim() !== '' ||
          item.amount > 0
      ) ||
      this.itemDetails.some(
        (item) =>
          item.productService.trim() !== '' ||
          item.description.trim() !== '' ||
          item.amount > 0
      );

    if (!hasValidItems) {
      this.validationErrors['items'] =
        'At least one category or item is required';
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

  // Error Display (same as expense)
  showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;
  }

  hideError(): void {
    this.showError = false;
    this.errorMessage = '';
    this.validationErrors = {};
  }

  // Form Actions - Purchase Order specific
  savePurchaseOrder(): void {
    if (this.validateForm()) {
      console.log(
        'Saving purchase order...',
        this.formData,
        this.categoryItems,
        this.itemDetails
      );
      alert('Purchase Order saved successfully!');
      this.resetForm();
    } else {
      this.showErrorMessage('Please fix the validation errors before saving.');
    }
  }

  saveAndClose(): void {
    if (this.validateForm()) {
      console.log(
        'Saving and closing purchase order...',
        this.formData,
        this.categoryItems,
        this.itemDetails
      );
      alert('Purchase Order saved successfully!');
      this.closePurchaseOrder();
    } else {
      this.showErrorMessage('Please fix the validation errors before saving.');
    }
    this.showSaveDropdown = false;
  }

  saveAndNew(): void {
    if (this.validateForm()) {
      console.log(
        'Saving purchase order and creating new...',
        this.formData,
        this.categoryItems,
        this.itemDetails
      );
      alert(
        'Purchase Order saved successfully! Creating new purchase order...'
      );
      this.resetForm();
    } else {
      this.showErrorMessage('Please fix the validation errors before saving.');
    }
    this.showSaveDropdown = false;
  }

  cancelPurchaseOrder(): void {
    if (this.hasUnsavedChanges()) {
      if (
        confirm(
          'Are you sure you want to cancel? All unsaved changes will be lost.'
        )
      ) {
        this.closePurchaseOrder();
      }
    } else {
      this.closePurchaseOrder();
    }
  }

  // Enhanced close functionality - Purchase Order specific
  closePurchaseOrder(): void {
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

  printPurchaseOrder(): void {
    console.log('Printing purchase order...');
    window.print();
  }

  makeRecurring(): void {
    console.log('Making purchase order recurring...');
    alert('Recurring purchase order feature coming soon!');
  }

  toggleSaveDropdown(): void {
    this.showSaveDropdown = !this.showSaveDropdown;
  }

  // Utility Methods - Purchase Order specific
  resetForm(): void {
    this.formData = {
      supplier_id: '',
      email: '',
      status: 'OPEN',
      mailingAddress: '',
      shippingAddress: '',
      shipToCustomer: '',
      purchaseOrderDate: this.getTodayDate(),
      shipVia: '',
      taxInclusive: true,
      messageToSupplier: '',
      memo: '',
      attachments: [],
    };

    this.categoryItems = [
      {
        category: '',
        description: '',
        amount: 0,
        gst: 10,
        customer: '',
        class: '',
      },
    ];

    this.itemDetails = [
      {
        productService: '',
        description: '',
        quantity: 0,
        rate: 0,
        amount: 0,
        gst: 0,
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
      this.formData.email !== '' ||
      this.formData.messageToSupplier !== '' ||
      this.formData.memo !== '' ||
      this.formData.shipVia !== '' ||
      this.formData.attachments.length > 0 ||
      this.categoryItems.some(
        (item) =>
          item.category !== '' || item.description !== '' || item.amount > 0
      ) ||
      this.itemDetails.some(
        (item) =>
          item.productService !== '' ||
          item.description !== '' ||
          item.amount > 0
      )
    );
  }
}
