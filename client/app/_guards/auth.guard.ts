import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../_services/index';
import { map, take } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router,private authenticationService: AuthenticationService) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.authenticationService.isLoggedIn.pipe(
          take(1),
          map((isLoggedIn: boolean) => {
            if (localStorage.getItem('currentUser')) {
            return true;
            }
                this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
                return false;
          })
        );
      }
    }