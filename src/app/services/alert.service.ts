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
}
