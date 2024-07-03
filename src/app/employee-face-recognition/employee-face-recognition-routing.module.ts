import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmployeeFaceRecognitionPage } from './employee-face-recognition.page';

const routes: Routes = [
  {
    path: '',
    component: EmployeeFaceRecognitionPage
  },
  {
    path: 'emp-modal',
    loadChildren: () => import('./emp-modal/emp-modal.module').then( m => m.EmpModalPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeeFaceRecognitionPageRoutingModule {}
