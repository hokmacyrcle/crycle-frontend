import { Component } from '@angular/core';

@Component({
  selector: 'app-setting-superannuation',
  templateUrl: './setting-superannuation.component.html',
  styleUrls: ['./setting-superannuation.component.scss']
})
export class SettingSuperannuationComponent {
  openDropdown: number | null = null;
  openModalId: string | null = null; // 'add' | 'edit'

  funds = [
    { name: 'Corporate Super (OnePath Masterfund)', type: 'Regulated', spin: 'MMF0393AU', employerNumber: '23123' },
    { name: 'HESTA Super (HESTA)', type: 'Regulated', spin: 'HST0100AU', employerNumber: '1234' }
  ];

  toggleDropdown(i: number) {
    this.openDropdown = this.openDropdown === i ? null : i;
  }

  selectedType: string = 'regulated'; // default value

  openModal(id: string) {
    this.openModalId = id;
  }

  closeModal() {
    this.openModalId = null;
  }
}
