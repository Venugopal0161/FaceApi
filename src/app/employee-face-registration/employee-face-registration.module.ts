import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmployeeFaceRegistrationPageRoutingModule } from './employee-face-registration-routing.module';

import { EmployeeFaceRegistrationPage } from './employee-face-registration.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmployeeFaceRegistrationPageRoutingModule
  ],
  declarations: [EmployeeFaceRegistrationPage]
})
export class EmployeeFaceRegistrationPageModule {}
