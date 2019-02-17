import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import { appConfig } from '../app.config';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AuthenticationService {
    private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    get isLoggedIn() {
        return this.loggedIn.asObservable();
      }
    constructor(private http: HttpClient) { }

    login(username: string, password: string) {
        return this.http.post<any>(appConfig.apiUrl + '/users/authenticate', { username: username, password: password })
            .map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    this.loggedIn.next(name);
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    
                }
                return user;
                
            });
            
    }

    logout() {
        // remove user from local storage to log user out
        this.loggedIn.next(false);
        localStorage.removeItem('currentUser');
    }
}