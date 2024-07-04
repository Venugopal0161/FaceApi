import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AppComponent } from 'src/app/app.component';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.page.html',
  styleUrls: ['./admin-login.page.scss'],
})
export class AdminLoginPage {
  component = AppComponent;

  username = '';
  password = '';
  errorMessage = '';
  showPassword = false;
  logInForm: FormGroup;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private fb: FormBuilder,
    private comp: AppComponent,
    public loadingController: LoadingController,
    private alertController: AlertController,

  ) { }


  createLoginForm(): void {
    this.logInForm = this.fb.group({
      username: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])],
    });
    this.logInForm.controls['username'].setValue(localStorage.getItem('adminName'))
  }

  async login() {
    this.errorMessage = '';
    this.presentLoading();
    this.authenticationService
      .login({
        username: this.username.trim(),
        password: this.password.trim(),
      })
      .subscribe(
        (res: any) => {
          this.loadingController.dismiss();
          if (res.status.message === 'SUCCESS') {
            console.log(res);
            if (res.response.roles.includes('ADMIN')) {
              localStorage.setItem('admintoken', res.response.token);
              const jwtPayload = JSON.parse(window.atob(res.response.token.split('.')[1]));
              localStorage.setItem('adminName', jwtPayload.sub);
              localStorage.setItem('admin-data', JSON.stringify(res.response));
              this.router.navigateByUrl('/registeremp');
              this.comp.verifyAdminAlredyLoginOrNot();
            } else {
              this.presentAlert('You are not admin');
            }
          }
        },
        (err) => {
          this.loadingController.dismiss();
          this.errorMessage = err.error.status.message;
          this.presentAlert(err.error.status.message);
        }
      );
  }

  async presentAlert(msg: any) {
    const alert = await this.alertController.create({
      // cssClass: 'my-custom-class',
      // header: header,
      backdropDismiss: false,
      message: msg,
      buttons: ['OK'],
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
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

}