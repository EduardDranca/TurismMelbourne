import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { Relation } from '../models/relation';

const baseUrl = 'http://localhost:8080/api/users';
const relationUrl = 'http://localhost:8080/api/relations';

@Injectable({
  providedIn: 'root'
})

export class UserService {
    constructor(private http: HttpClient) { }

    getAll(): Observable<any> {
        return this.http.get(baseUrl);
    }  
    
    addUser(user: User) : Observable<any> {
      return this.http.post(baseUrl, user);
    }

    signInUser(username: String, password: String) : Observable<any> {
      return this.http.get(baseUrl + '/' + username + '/' + password);
    }

    getFavoriteAttraction(userId: String) : Observable<any> {
      return this.http.get(relationUrl + '/' + userId);
    }

    addFavoriteAttraction(relation: Relation) : Observable<any> {
      return this.http.post(relationUrl, relation);
    }
}