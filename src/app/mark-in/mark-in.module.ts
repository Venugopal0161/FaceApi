import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarkInPageRoutingModule } from './mark-in-routing.module';

import { MarkInPage } from './mark-in.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarkInPageRoutingModule
  ],
  declarations: [MarkInPage]
})
export class MarkInPageModule {}
