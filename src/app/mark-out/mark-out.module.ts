import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarkOutPageRoutingModule } from './mark-out-routing.module';

import { MarkOutPage } from './mark-out.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarkOutPageRoutingModule
  ],
  declarations: [MarkOutPage]
})
export class MarkOutPageModule {}
