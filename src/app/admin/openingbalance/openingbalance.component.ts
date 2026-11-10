import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-openingbalance',
  templateUrl: './openingbalance.component.html',
  styleUrls: ['./openingbalance.component.scss']
})
export class OpeningbalanceComponent {
  openingBalanceForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.openingBalanceForm = this.fb.group({
      startDate: [''],
      earnings: this.fb.array([]),
      leave: this.fb.array([]),
      deductions: this.fb.array([]),
      reimbursements: this.fb.array([]),
      superannuations: this.fb.array([]),
    });
  }

  // ========== Earnings ==========
  get earnings(): FormArray {
    return this.openingBalanceForm.get('earnings') as FormArray;
  }

  addEarning() {
    this.earnings.push(
      this.fb.group({
        name: ['', Validators.required],
        amount: ['', Validators.required]
      })
    );
  }
  removeEarning(i: number) {
    this.earnings.removeAt(i);
  }
  // leave 
  get leave(): FormArray {
    return this.openingBalanceForm.get('leave') as FormArray;
  }
  addLeave() {
    this.leave.push(
      this.fb.group({
        name: ['', Validators.required],
        amount: ['', Validators.required]
      })
    );
  }
  removeLeave(i: number) {
    this.leave.removeAt(i);
  }

  // ========== Deductions ==========
  get deductions(): FormArray {
    return this.openingBalanceForm.get('deductions') as FormArray;
  }
  addDeduction() {
    this.deductions.push(
      this.fb.group({
        name: ['', Validators.required],
        amount: ['', Validators.required]
      })
    );
  }
  removeDeduction(i: number) {
    this.deductions.removeAt(i);
  }

  // Reimbursements
  get reimbursements(): FormArray {
    return this.openingBalanceForm.get('reimbursements') as FormArray;
  }
  addReimbursements() {
    this.reimbursements.push(
      this.fb.group({
        name: ['', Validators.required],
        amount: ['', Validators.required]
      })
    );
  }
  removeReimbursements(i: number) {
    this.reimbursements.removeAt(i);
  }

  // ========== Superannuations ==========
  get superannuations(): FormArray {
    return this.openingBalanceForm.get('superannuations') as FormArray;
  }
  addSuper() {
    this.superannuations.push(
      this.fb.group({
        fund: ['', Validators.required],
        contributionType: ['', Validators.required],
        amount: ['', Validators.required]
      })
    );
  }
  removeSuper(i: number) {
    this.superannuations.removeAt(i);
  }

  // Submit form
  onSubmit() {
    console.log(this.openingBalanceForm.value);
  }

  modal1 = false;
  selectedTax: string = '';
  selectedDate: string = '';
  notApplicable: boolean = false;

  openModal(id: number) {
    if (id === 1) this.modal1 = true;
  }

  closeModal(id: number) {
    if (id === 1) this.modal1 = false;
  }

  toggleDate() {
    if (this.notApplicable) {
      this.selectedDate = '';
    }
  }
}
