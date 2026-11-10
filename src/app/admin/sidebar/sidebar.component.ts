import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/core/session.service';
import { MenuItem, sideMenu } from 'src/app/core/menu';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isSidebarOpen = true;
  @Input() activeSection = '';
  @Output() sectionChange = new EventEmitter<string>();

  menuItems: MenuItem[];

  constructor(private router: Router, session: SessionService) {
    this.menuItems = sideMenu(session.context); // built once
  }

  isActive(item: MenuItem): boolean {
    const url = this.router.url.split('?')[0].toLowerCase();
    return url === item.route.toLowerCase() || url.startsWith(item.route.toLowerCase() + '/');
  }
}
