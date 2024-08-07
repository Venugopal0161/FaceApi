import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttendanceLogsPage } from './attendance-logs.page';

const routes: Routes = [
  {
    path: '',
    component: AttendanceLogsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttendanceLogsPageRoutingModule {}
