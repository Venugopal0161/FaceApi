import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmpModalPageRoutingModule } from './emp-modal-routing.module';

import { EmpModalPage } from './emp-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    EmpModalPageRoutingModule
  ],
  declarations: [EmpModalPage]
})
export class EmpModalPageModule {}
