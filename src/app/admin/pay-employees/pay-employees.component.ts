import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

interface PayRun {
  frequency: string;
  period: string;
  paymentDate: string;
  wages: number;
  tax: number;
  super: number;
  netPay: number;
  status: string;
  latest?: boolean;
}

@Component({
  selector: 'app-pay-employees',
  templateUrl: './pay-employees.component.html',
  styleUrls: ['./pay-employees.component.scss']
})
export class PayEmployeesComponent {
  draftPayRun: PayRun = {
    frequency: 'Fortnightly Calendar',
    period: 'Fortnight ending 14 Aug 2025',
    paymentDate: '15 Aug 2025',
    wages: 11031.66,
    tax: 2380.0,
    super: 812.85,
    netPay: 8451.66,
    status: 'Draft'
  };

  payRunHistory: PayRun[] = [
    {
      frequency: 'Weekly Calendar',
      period: 'Week ending 14 Aug 2025',
      paymentDate: '15 Aug 2025',
      wages: 1008.0,
      tax: 180.0,
      super: 90.72,
      netPay: 828.0,
      status: 'Overdue',
      latest: true
    },
    {
      frequency: 'Weekly Calendar',
      period: 'Week ending 07 Aug 2025',
      paymentDate: '08 Aug 2025',
      wages: 1179.0,
      tax: 131.0,
      super: 106.11,
      netPay: 1048.0,
      status: 'Overdue'
    },
    {
      frequency: 'Weekly Calendar',
      period: 'Week ending 31 Jul 2025',
      paymentDate: '01 Aug 2025',
      wages: 2244.5,
      tax: 439.0,
      super: 182.16,
      netPay: 1805.5,
      status: 'Overdue'
    },
    {
      frequency: 'Fortnightly Calendar',
      period: 'Fortnight ending 31 Jul 2025',
      paymentDate: '01 Aug 2025',
      wages: 6094.25,
      tax: 1032.0,
      super: 544.88,
      netPay: 4862.25,
      status: 'Overdue',
      latest: true
    },
    {
      frequency: 'Weekly Calendar',
      period: 'Week ending 24 Jul 2025',
      paymentDate: '25 Jul 2025',
      wages: 1527.0,
      tax: 213.0,
      super: 137.43,
      netPay: 1314.0,
      status: 'Overdue'
    }
  ];

  showModal = false;
  payRunType = '';
  unscheduled = { startDate: '', endDate: '', paymentDate: '' };
  hasChild = false;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events.subscribe(() => {
      this.hasChild = this.route.firstChild != null;
    });
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.payRunType = '';
    this.unscheduled = { startDate: '', endDate: '', paymentDate: '' };
  }

  savePayRun() {
    let isValid = false;

    if (this.payRunType === 'unscheduled') {
      if (this.unscheduled.startDate && this.unscheduled.endDate && this.unscheduled.paymentDate) {
        isValid = true;
      }

    } else if (this.payRunType) {
      isValid = true;
    }

    if (isValid) {
      this.closeModal();
      this.router.navigate(['pay-employees-details'], { relativeTo: this.route });
      
    } else {
      alert('Please fill all required fields before saving.');
    }
  }


}
