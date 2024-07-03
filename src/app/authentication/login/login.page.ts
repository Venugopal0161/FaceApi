import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FaceRecognitionService } from 'src/app/services/face-recognization.service';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  username = '';
  password = '';
  errorMessage = '';
  showPassword = false;
  logInForm: FormGroup;

  constructor(
    private authenticationService: AuthenticationService,
    private fb: FormBuilder,
    private global: GlobalvariablesService,
    private faceRecognitionService: FaceRecognitionService,
    public loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router,
  ) { }
  ngOnInit() {
    if (!localStorage.getItem('token') && localStorage.getItem('userName')) {
      this.autoLogin();
    }
  }
  createLoginForm(): void {
    this.logInForm = this.fb.group({
      username: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])],
    });
    this.logInForm.controls['username'].setValue(localStorage.getItem('userName'));
  }

  async login() {
    this.errorMessage = '';
    this.presentLoading('Please wait...');
    this.authenticationService
      .login({
        username: this.username.trim(),
        password: this.password.trim(),
      })
      .subscribe(
        (res: any) => {
          this.loadingController.dismiss();
          if (res.status.message === 'SUCCESS') {
            console.log(res.response.roles, res.response.roles.includes('DV_USER'));

            if (res.response.roles.includes('DV_USER')) {

            localStorage.setItem('token', res.response.token);
              const jwtPayload = JSON.parse(window.atob(res.response.token.split('.')[1]));
            localStorage.setItem('userName', jwtPayload.sub);
              localStorage.setItem('pswd', this.password)
            localStorage.setItem('company', res.response.company);
            localStorage.setItem('companyName', res.response.companyName);

              localStorage.setItem('branchCode', res.response.branch);
            localStorage.setItem('user-data', JSON.stringify(res.response));
              try {
              this.faceRecognitionService.loadModels();
                console.log('files loaded  from login');
              } catch (error) {
              console.error('Error loading models:', error);
            }
            } else {
              this.presentAlert('You are not authorized to access this page');
              this.errorMessage = 'You are not authorized to access this page';
            }
          }
        },
        (err) => {
          console.log(err);
          localStorage.removeItem('pswd');
          this.loadingController.dismiss();
          this.errorMessage = err.error.status.message;
          this.presentAlert(err.error.status.message);

        }
      );
  }

  async presentAlert(msg: any) {
    const alert = await this.alertController.create({
      message: msg,
      buttons: ['OK'],
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
  }
  async presentLoading(msg) {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: msg,
      // duration: 2000
    });
    await loading.present();
    const { role, data } = await loading.onDidDismiss();
  }
  async autoLogin() {
    this.errorMessage = '';
    this.global.presentLoading();
    this.authenticationService
      .login({
        username: localStorage.getItem('userName'),
        password: localStorage.getItem('pswd'),
      })
      .subscribe(
        (res: any) => {
          if (res.status.message === 'SUCCESS') {
            localStorage.setItem('token', res.response.token);
            this.global.loadingController.dismiss();

            const jwtPayload = JSON.parse(window.atob(res.response.token.split('.')[1]));
            localStorage.setItem('userName', jwtPayload.sub);
            // localStorage.setItem('roles', res.response.roles);
            localStorage.setItem('company', res.response.company);
            localStorage.setItem('companyName', res.response.companyName);

            localStorage.setItem('branchCode', res.response.branch);
            localStorage.setItem('user-data', JSON.stringify(res.response));
            this.router.navigateByUrl('/recognition');
            try {
              console.log('files loaded  from login');
              this.global.loadingController.dismiss();
            } catch (error) {
              this.global.loadingController.dismiss();
              console.error('Error loading models:', error);
            }
            // home
          }
        },
        (err) => {
          console.log(err);
          localStorage.removeItem('pswd');
          this.global.loadingController.dismiss();
          this.errorMessage = err.error.status.message;
          this.presentAlert(err.error.status.message);

        }
      );
  }
}
