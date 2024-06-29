import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { EmployeeFaceRecognitionPageRoutingModule } from './employee-face-recognition-routing.module';
import { EmployeeFaceRecognitionPage } from './employee-face-recognition.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmployeeFaceRecognitionPageRoutingModule
  ],
  declarations: [EmployeeFaceRecognitionPage]
})
export class EmployeeFaceRecognitionPageModule {}
