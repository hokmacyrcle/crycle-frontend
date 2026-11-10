import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payroll-setting',
  templateUrl: './payroll-setting.component.html',
  styleUrls: ['./payroll-setting.component.scss']
})
export class PayrollSettingComponent {
   isDefaultActive = false;

  constructor(private router: Router) {}

  ngOnInit() {
    if (this.router.url.includes('organisation')) {
      this.isDefaultActive = true;
    }
  }
 }
