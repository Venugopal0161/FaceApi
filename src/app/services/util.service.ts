import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalvariablesService } from './globalvariables.service';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  constructor(
    private router: Router,
    // private global: GlobalvariablesService,
    private alertController: AlertController,
    // private globalService: GlobalvariablesService,
  ) { }

  // isTokenExpired() {
  //   const JWT = localStorage.getItem('token');
  //   const jwtPayload = JWT ? JSON.parse(window.atob(JWT.split('.')[1])) : null;
  //   const isExpired =
  //     Math.floor(new Date().getTime() / 1000) >= jwtPayload.exp;
  //   if (isExpired) {
  //     // this.router.navigateByUrl('dashboard');
  //    this.globalService.presentAlert('Session Expired', 'Your session has expired. Please login again');
  //   }
  // }

  isTokenExpired() {
    const JWT = localStorage.getItem('token');
    const jwtPayload = JSON.parse(window.atob(JWT.split('.')[1]));
    const isExpired =
      Math.floor(new Date().getTime() / 1000) >= jwtPayload.exp;
    if (isExpired) {
      // this.router.navigateByUrl('dashboard');
      this.presentAlert('Session Expired', 'Your session has expired. Please login again');

    }
  }

  logout(): void {
    // localStorage.clear();
    localStorage.removeItem('user-data');
    localStorage.removeItem('token');
    localStorage.removeItem('branch');
    localStorage.removeItem('branchCode');
    this.router.navigateByUrl('/login');
  }

  async presentAlert(msg ,header) {
    const alert = await this.alertController.create({
      // cssClass: 'my-custom-class',
      header: header,
      message: msg,
      buttons: ['OK'],
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
  }

}
