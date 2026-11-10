import { Component } from '@angular/core';

@Component({
  selector: 'app-setting-holidays',
  templateUrl: './setting-holidays.component.html',
  styleUrls: ['./setting-holidays.component.scss']
})
export class SettingHolidaysComponent {
  groups: string[] = [
    'All Holidays',
    'Australian Capital Territory',
    'New South Wales',
    'Northern Territory',
    'Queensland',
    'South Australia',
    'Tasmania',
    'Victoria',
    'Western Australia'
  ];

  selectedGroup: string = 'All Holidays';

  holidays: Record<string, { name: string; date: string }[]> = {
    'All Holidays': [
      { name: "New Year's Day", date: 'Wednesday, 1 Jan 2025' },
      { name: 'Australia Day Holiday', date: 'Monday, 27 Jan 2025' },
      { name: 'Labour Day', date: 'Monday, 3 Mar 2025' },
      { name: 'Canberra Day', date: 'Monday, 10 Mar 2025' },
      { name: 'Good Friday', date: 'Friday, 18 Apr 2025' },
      { name: 'Easter Saturday', date: 'Saturday, 19 Apr 2025' }
    ],
    'Australian Capital Territory': [
      { name: 'Canberra Day', date: 'Monday, 10 Mar 2025' }
    ],
    'New South Wales': [
      { name: 'Labour Day', date: 'Monday, 6 Oct 2025' }
    ],
    'Northern Territory': [
      { name: 'May Day', date: 'Monday, 5 May 2025' }
    ],
    'Queensland': [
      { name: 'Ekka Holiday', date: 'Wednesday, 13 Aug 2025' }
    ],
    'South Australia': [
      { name: 'Adelaide Cup Day', date: 'Monday, 10 Mar 2025' }
    ],
    'Tasmania': [
      { name: 'Eight Hour Day', date: 'Monday, 10 Mar 2025' }
    ],
    'Victoria': [
      { name: 'Melbourne Cup Day', date: 'Tuesday, 4 Nov 2025' }
    ],
    'Western Australia': [
      { name: 'WA Day', date: 'Monday, 2 Jun 2025' }
    ]
  };

  get holidayNames(): string[] {
    return Object.values(this.holidays)
      .flat()
      .map(h => h.name);
  }
  selectedDate: string = '';

  selectGroup(group: string) {
    this.selectedGroup = group;
  }

  openModalId: number | null = null;

  modalTitle: Record<number, string> = {
    1: "Add Holiday",
    2: "Holiday Group",
    3: "Edit Holiday",
    4: "Delete Holiday"
  };

  openModal(id: number) {
    this.openModalId = id;
  }

  closeModal() {
    this.openModalId = null;
  }

}
