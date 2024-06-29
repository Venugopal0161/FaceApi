import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { HttpGetService } from './http-get.service';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalvariablesService {

  constructor(private http: HttpClient,
    private utilServ: UtilService,
    private router: Router,
    private alertController: AlertController,
    public loadingController: LoadingController,
    private httpGet: HttpGetService) { }

  async setAppvariables(response) {
    this.utilServ.isTokenExpired();
    if (response) {
      this.setLocalStorageVariablesOnInit(response);
    }

  }

   setLocalStorageVariablesOnInit(response) {
    localStorage.setItem('token', response.token);
    // localStorage.setItem('roles', response.roles);
    localStorage.setItem('userType', response.userType);
    localStorage.setItem('multibranch', response.multibranch);
    // localStorage.setItem('multidivision', response.multidivision);
    localStorage.setItem('company', response.company);
    localStorage.setItem('companyName', response.companyName);
    localStorage.setItem('branchCode', response.branch);
    localStorage.setItem('token', response.token);
    // localStorage.setItem('division', response.division);
    localStorage.setItem('user-data', JSON.stringify(response));
  }


  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      // duration: 2000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
  }

  
  showAlert(message: string, header, inputs , subHead,buttonArray) {
    this.alertController.create({
      header: header ? header : 'Alert',
      subHeader:subHead,
      message: message,
      inputs: inputs ? inputs : [],
      buttons: buttonArray ? buttonArray : ['OK']
    })
    .then(alertEl => alertEl.present());
  }

}
