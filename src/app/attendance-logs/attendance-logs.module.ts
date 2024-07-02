import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AttendanceLogsPageRoutingModule } from './attendance-logs-routing.module';

import { AttendanceLogsPage } from './attendance-logs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AttendanceLogsPageRoutingModule
  ],
  declarations: [AttendanceLogsPage]
})
export class AttendanceLogsPageModule {}
