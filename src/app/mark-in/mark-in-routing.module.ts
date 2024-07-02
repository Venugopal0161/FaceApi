import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarkInPage } from './mark-in.page';

const routes: Routes = [
  {
    path: '',
    component: MarkInPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarkInPageRoutingModule {}
