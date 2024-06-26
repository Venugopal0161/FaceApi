import { Injectable } from '@angular/core';
import { HttpGetService } from './http-get.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalvariablesService {

  constructor(private http: HttpClient,
    private utilServ: UtilService,
    private router: Router,
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

}
