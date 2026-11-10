import { Component, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
// Interface for the rule data
export interface Rule {
  priority: number;
  ruleName: string;
  appliedTo: string;
  conditions: string;
  settings: string;
  autoAdd: boolean;
  status: string;
}

const RULE_DATA: Rule[] = [
  { priority: 1, ruleName: 'Rule 1', appliedTo: 'All Users', conditions: 'Age > 18', settings: 'Notify Admin', autoAdd: true, status: 'Active' },
  { priority: 2, ruleName: 'Rule 2', appliedTo: 'Guests', conditions: 'Location = US', settings: 'Restrict Access', autoAdd: false, status: 'Inactive' },
  { priority: 3, ruleName: 'Rule 3', appliedTo: 'Admins', conditions: 'Role = Admin', settings: 'Full Access', autoAdd: true, status: 'Active' }
];

@Component({
  selector: 'app-bankrulestransactions',
  templateUrl: './bankrulestransactions.component.html',
  styleUrls: ['./bankrulestransactions.component.scss']
})
export class BankrulestransactionsComponent {
 displayedColumns: string[] = ['priority', 'ruleName', 'appliedTo', 'conditions', 'settings', 'autoAdd', 'status', 'action'];
  dataSource = new MatTableDataSource<Rule>(RULE_DATA);
  @ViewChild(MatSort) sort!: MatSort;

  showCreateRuleForm = false;
  newRule = {
    ruleName: '',
    moneyOut: 'Money out',
    include: 'All',
    conditionType: 'Contains',
    conditionValue: '',
    transactionType: 'Expense',
    category: 'Select a category',
    productService: 'Product/service',
    payee: 'Recommended',
    gst: 'Optional',
    customer: 'Select a customer',
    autoAdd: false
  };
  ruleNameError = false;

  ngOnInit(): void {
    this.dataSource.sort = this.sort;
  }

  openCreateRuleForm(): void {
    this.showCreateRuleForm = true;
    this.resetForm();
  }

  closeCreateRuleForm(): void {
    this.showCreateRuleForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newRule = {
      ruleName: '',
      moneyOut: 'Money out',
      include: 'All',
      conditionType: 'Contains',
      conditionValue: '',
      transactionType: 'Expense',
      category: 'Select a category',
      productService: 'Product/service',
      payee: 'Recommended',
      gst: 'Optional',
      customer: 'Select a customer',
      autoAdd: false
    };
    this.ruleNameError = false;
  }

  saveRule(): void {
    if (!this.newRule.ruleName.trim()) {
      this.ruleNameError = true;
      return;
    }
    this.ruleNameError = false;
    const newPriority = this.dataSource.data.length + 1;
    const newRuleData: Rule = {
      priority: newPriority,
      ruleName: this.newRule.ruleName,
      appliedTo: this.newRule.moneyOut,
      conditions: `${this.newRule.conditionType} ${this.newRule.conditionValue}`,
      settings: this.newRule.productService,
      autoAdd: this.newRule.autoAdd,
      status: 'Active'
    };
    this.dataSource.data = [...this.dataSource.data, newRuleData];
    this.closeCreateRuleForm();
  }

  addCondition(): void {
    // Add logic to handle additional conditions if needed
    console.log('Add condition clicked');
  }

  addAssignment(): void {
    // Add logic to handle additional assignments if needed
    console.log('Add assignment clicked');
  }

  viewRule(priority: number): void {
    console.log(`View rule with priority: ${priority}`);
  }

  editRule(priority: number): void {
    console.log(`Edit rule with priority: ${priority}`);
  }

  deleteRule(priority: number): void {
    console.log(`Delete rule with priority: ${priority}`);
  }
}