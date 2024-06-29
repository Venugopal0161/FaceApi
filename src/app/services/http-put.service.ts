import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpPutService {

  constructor(private http: HttpClient) { }

  update(apiname,data)
   {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    headers = headers.append('Content-Type', 'application/json');
    return this.http.put(environment.connect_url+apiname,JSON.stringify(data),{headers});
   }


}



