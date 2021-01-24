import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attraction } from '../models/attraction'

const baseUrl = 'http://localhost:8080/api/attractions';

@Injectable({
  providedIn: 'root'
})

export class AttractionService {
    constructor(private http: HttpClient) { }

    getAll(): Observable<any> {
        return this.http.get(baseUrl);
    }  
    
    addAttraction(attraction: Attraction) : Observable<any> {
      return this.http.post(baseUrl, attraction);
    }

    getAttractionByType(type: string) : Observable<any> {
      return this.http.get(baseUrl + '/type/' + type);
    }
}