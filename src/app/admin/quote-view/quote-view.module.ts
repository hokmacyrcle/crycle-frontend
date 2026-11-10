import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { QuoteViewComponent } from './quote-view.component';

@NgModule({
  declarations: [
    QuoteViewComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    QuoteViewComponent
  ]
})
export class QuoteViewModule { }
