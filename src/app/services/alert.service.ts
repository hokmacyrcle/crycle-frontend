import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  
  successSwalnew(any: any, doc: any) {
    Swal.fire(any, doc, 'success');
  }

  DangerSwalnew(any: any, doc: any) {
    Swal.fire(any, doc, 'error');
  }
}
