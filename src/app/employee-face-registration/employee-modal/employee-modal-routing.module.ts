import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmployeeModalPage } from './employee-modal.page';

const routes: Routes = [
  {
    path: '',
    component: EmployeeModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeeModalPageRoutingModule {}
