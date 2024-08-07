import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmployeeFaceRegistrationPage } from './employee-face-registration.page';

const routes: Routes = [
  {
    path: '',
    component: EmployeeFaceRegistrationPage
  },
  {
    path: 'employee-modal',
    loadChildren: () => import('./employee-modal/employee-modal.module').then( m => m.EmployeeModalPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeeFaceRegistrationPageRoutingModule {}
