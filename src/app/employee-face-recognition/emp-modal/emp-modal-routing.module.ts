import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmpModalPage } from './emp-modal.page';

const routes: Routes = [
  {
    path: '',
    component: EmpModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmpModalPageRoutingModule {}
