import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
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
   logInForm: FormGroup ;

  constructor(
    private globalServ: GlobalvariablesService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private fb: FormBuilder,
    private alertController: AlertController,
    public loadingController: LoadingController,

  ) { }

  ngOnInit(): void {
    // this.createLoginForm();
  }

  createLoginForm(): void {
    this.logInForm = this.fb.group({
      username: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])],
      // company: [''],
    });
    this.logInForm.controls['username'].setValue(localStorage.getItem('userName'))
    // this.logInForm.controls['password'].setValue('welcome1@')
  }

  login() {
    this.errorMessage = '';
this.presentLoading();
    this.authenticationService
      .login({
        username: this.username.trim(),
        password: this.password.trim(),
        
        // division: ''
      })
      .subscribe(
        (res: any) => {
          this.loadingController.dismiss();
          
          // roles present check
          // let role_present = false;
          // res.response.roles.forEach((role) => {
          //   if (this.userRoles.indexOf(role) >= 0 && !role_present) {
          //     role_present = true;
          //   }
          // });
          // && role_present
          if (res.status.message === 'SUCCESS') {
            localStorage.setItem('token', res.response.token);
            const jwtPayload = JSON.parse(window.atob(res.response.token.split('.')[1]));

            localStorage.setItem('userName', jwtPayload.sub);
            // localStorage.setItem('roles', res.response.roles);
            localStorage.setItem('company', res.response.company);
            localStorage.setItem('companyName', res.response.companyName);

            localStorage.setItem('branchCode', res.response.branch);
           
            // this.globalServ.setAppvariables(null);
            // role_present = false;
            localStorage.setItem('user-data', JSON.stringify(res.response));
            this.router.navigate(['']);
            // home
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
