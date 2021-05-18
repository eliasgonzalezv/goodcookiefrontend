import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../shared/auth.service';
import { LoginRequestPayload } from '../../models/login.request.payload';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  //Get a hold of login form to handle form input
  loginForm: FormGroup;
  //
  loginRequestPayload: LoginRequestPayload;
  //
  isError: boolean;
  message: string;
  //Service to perform backend calls
  //ActivatedRoute to access route parameters
  //Router to redirect
  //Toastr to display messages
  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginRequestPayload = {
      username: '',
      password: '',
    };
  }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });

    //Access the query parameters sent from register page
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params.registered !== undefined && params.registered === 'true') {
        //Display success message
        this.toastr.success('Registration Successful');
      }
    });
  }

  /**
   * Populates the login request payload and calls on
   * the auth service to perform the backend api call
   */
  login() {
    //Read values from login form fields into payload's fields
    this.loginRequestPayload.username = this.loginForm.get('username').value;
    this.loginRequestPayload.password = this.loginForm.get('password').value;

    //Call on service to perform request to backend
    this.authService.login(this.loginRequestPayload).subscribe(
      (data) => {
        if (data) {
          this.isError = false;
          this.router.navigateByUrl('/');
          this.toastr.success('Login Successful');
        }
      },
      (error: HttpErrorResponse) => {
        if (error.status == 403) {
          // this.toastr.error('Incorrect username or password');
          this.isError = true;
          this.message = 'Incorrect username or password.';
        }
      }
    );
  }
}
