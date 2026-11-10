import { Component } from '@angular/core';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent {
  activeTab = 'overview';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
