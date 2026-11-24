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

  /** An item is active when the page is inside it, unless a more specific item also matches (Customers lives under /admin/sales). */
  isActive(item: MenuItem): boolean {
    const url = this.router.url.split('?')[0].toLowerCase();
    const inside = (m: MenuItem) => url === m.route.toLowerCase() || url.startsWith(m.route.toLowerCase() + '/');
    return inside(item) && !this.menuItems.some(o => o !== item && o.route.length > item.route.length && inside(o));
  }
}
