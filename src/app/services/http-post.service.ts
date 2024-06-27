import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpPostService {

  constructor(private http: HttpClient) { }
  create(master, data) {
    let headers = new HttpHeaders();
    headers = headers.append("Authorization", "Bearer " + localStorage.getItem('token'));
    headers = headers.append("Content-Type", "application/json");
    return this.http.post(`${environment.connect_url}${master}`, data, { headers });
  }


}
