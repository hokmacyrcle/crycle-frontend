import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Employees } from 'src/app/services/payroll.service';

@Injectable({ providedIn: 'root' })
export class EmployesStorsServiceService {
  private employeeSubject = new BehaviorSubject<Employees | null>(null);
  employee$ = this.employeeSubject.asObservable();

  private employeeTaxSubject = new BehaviorSubject<any | null>(null);
  employeeTax$ = this.employeeTaxSubject.asObservable();

  setEmployee(emp: Employees) {
    this.employeeSubject.next(emp);
  }

  getEmployee(): Employees | null {
    return this.employeeSubject.value;
  }

  setEmployeeTax(empTax: any) {
    this.employeeTaxSubject.next(empTax);
  }

  getEmployeeTax(): any | null {
    return this.employeeTaxSubject.value;
  }
}
