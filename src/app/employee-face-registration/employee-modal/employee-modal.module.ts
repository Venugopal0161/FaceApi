import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmployeeModalPageRoutingModule } from './employee-modal-routing.module';

import { EmployeeModalPage } from './employee-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    EmployeeModalPageRoutingModule
  ],
  declarations: [EmployeeModalPage]
})
export class EmployeeModalPageModule {}
