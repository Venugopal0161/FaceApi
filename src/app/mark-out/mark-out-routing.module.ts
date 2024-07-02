import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarkOutPage } from './mark-out.page';

const routes: Routes = [
  {
    path: '',
    component: MarkOutPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarkOutPageRoutingModule {}
