import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/core/session.service';
import { AccountService } from 'src/app/services/account.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  constructor(
    private accountService: AccountService,
    private router: Router,
    public session: SessionService
  ) { }
  showDropdown = false;

  /** Two letters for the round avatar, from the signed-in name. */
  get initials(): string {
    const parts = (this.session.userName || '').trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || 'U';
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Close dropdown if clicked outside
    if (!target.closest('.relative')) {
      this.showDropdown = false;
    }
  }
logout() {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to log out?',
    icon: 'question',
    showCancelButton: true,
    
    confirmButtonText: 'Yes, log out!',
    cancelButtonText: 'Cancel',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      this.accountService.logout().subscribe({
        next: (response) => {
          // Check status from backend response
          if (response.status === true) {
            // Successful logout
            localStorage.removeItem('access_token');
            localStorage.removeItem('token_type');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
            localStorage.removeItem('full_token');
            localStorage.removeItem('name');

            Swal.fire({
              title: 'Logged Out',
              text: 'You have been successfully logged out.',
              icon: 'success',
              confirmButtonColor: '#1976d2',
              customClass: {
                popup: 'mat-elevation-z8',
                confirmButton: 'mat-button mat-raised-button mat-primary'
              }
            }).then(() => {
              this.showDropdown = false; // Close dropdown
              this.router.navigate(['/login']);
            });
          } else {
            // Backend returned status: false, show error message
            Swal.fire({
              title: 'Error',
              text: response.message || 'Failed to log out. Please try again.',
              icon: 'error',
              confirmButtonColor: '#1976d2',
              customClass: {
                popup: 'mat-elevation-z8',
                confirmButton: 'mat-button mat-raised-button mat-primary'
              }
            });
            this.showDropdown = false;
          }
        },
        error: (error) => {
          // Handle HTTP or network errors
          let errorMessage = 'Failed to log out. Please try again.';
          
          if (error.error) {
            if (error.error.message) {
              errorMessage = error.error.message;
            } else if (error.error.error) {
              errorMessage = error.error.error;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }

          Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonColor: '#1976d2',
            customClass: {
              popup: 'mat-elevation-z8',
              confirmButton: 'mat-button mat-raised-button mat-primary'
            }
          });
          this.showDropdown = false; // Close dropdown on error
        }
      });
    } else {
      this.showDropdown = false; // Close dropdown on cancel
    }
  });
}


}



