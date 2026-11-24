import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  
  successSwalnew(any: any, doc: any) {
    Swal.fire({ title: any || 'Done', text: doc, icon: 'success', confirmButtonText: 'OK' });
  }

  DangerSwalnew(any: any, doc: any) {
    Swal.fire({ title: any || 'Something went wrong', text: doc, icon: 'error', confirmButtonText: 'OK' });
  }

  /** Small message in the corner that goes away on its own. */
  toast(message: string) {
    Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2600, timerProgressBar: false, icon: 'success', title: message });
  }

  /** Asks before something that cannot be undone. Resolves true when the person confirms. */
  confirm(title: string, text: string, confirmLabel: string): Promise<boolean> {
    return Swal.fire({
      title, text, icon: 'warning', showCancelButton: true, confirmButtonText: confirmLabel, cancelButtonText: 'Cancel', focusCancel: true
    }).then(r => r.isConfirmed);
  }
}
