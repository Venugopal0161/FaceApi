import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpGetService {

  constructor(
    private http: HttpClient,
  ) { }

  getHeaders() {
    let headers = new HttpHeaders();
    headers = headers.append(
      'Authorization',
      'Bearer ' + localStorage.getItem('token')
    );
    return headers;
  }
  nonTokenApi(master) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    return this.http.get(environment.root_url + 'initial/' + master, {
      headers,
    });
  }

  getMenuAccess() {
    let headers = new HttpHeaders();
    headers = headers.append(
      'Authorization',
      'Bearer ' + localStorage.getItem('token')
    );
    return this.http.get(
      environment.root_url + `api/menuaccess/app?app=portal&module=atlas`,
      { headers }
    );
  }

  getMasterList(master) {
    return this.http.get(environment.root_url + `api/${master}`, { headers: this.getHeaders() });
  }

  getMenuSort() {
    return this.http.get(environment.root_url + `api/menusort`, {
      headers: this.getHeaders(),
    });
  }

}
