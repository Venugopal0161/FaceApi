import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule,HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthGuard } from './authentication/guards/auth.guard';
import { LoginGuard } from './authentication/guards/login.guard';
import { MyHttpInterceptor } from './services/http.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(),
     AppRoutingModule, IonicStorageModule.forRoot({
      driverOrder: [Drivers.SecureStorage, Drivers.IndexedDB, Drivers.LocalStorage]
    }),
     HttpClientModule,
     FormsModule, 
     ReactiveFormsModule,
     
    ],

  providers: [AuthGuard, LoginGuard,{ provide: HTTP_INTERCEPTORS,  useClass: MyHttpInterceptor, multi: true }],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
