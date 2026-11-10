import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './home/login/login.component';
import { authGuard } from './core/auth.guard';

const routes: Routes = [
  { path: 'admin', component: AdminComponent, canActivate: [authGuard], children: [{ path: '', loadChildren: () => import('./admin/admin.module').then(admin => admin.AdminModule) },] },

  {
    path: '', component: HomeComponent, children: [{ path: '', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },]

  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
