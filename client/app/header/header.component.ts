import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AuthenticationService } from '../_services/index';
import { User } from '../_models/index';


@Component({
  moduleId: module.id,
  selector: 'app-header',
  templateUrl: 'header.component.html'
})
export class HeaderComponent implements OnInit {
  currentUser: User;
  isLoggedIn$: Observable<boolean>;

  constructor(private authenticationService: AuthenticationService) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
   }

  ngOnInit() {
    this.isLoggedIn$ = this.authenticationService.isLoggedIn;
  }


}