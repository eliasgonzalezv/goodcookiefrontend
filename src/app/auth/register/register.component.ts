import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../shared/auth.service';
import { RegisterRequestPayload } from '../../models/register-request.payload';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  // Get a hold of the register form to handle form input
  registerForm: FormGroup;
  // Capture information to send to backend
  registerRequestPayload: RegisterRequestPayload;
  isError: boolean;
  message: string;

  //Service object to perform backend calls
  //Router to redirect
  //Toastr to display messages for success/failure
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.registerRequestPayload = {
      username: '',
      email: '',
      password: '',
    };
  }

  ngOnInit(): void {
    //Initialize the form
    this.registerForm = new FormGroup({
      //Declare the form control fields with validation
      username: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      passwordMatch: new FormControl('', Validators.required),
    });
  }
  /**
   * Populates the register request payload and calls on
   * the auth service to perform the backend api call
   */
  register(): void {
    //Read values from register form fields into payload's fields
    this.registerRequestPayload.username = this.registerForm.get(
      'username'
    ).value;
    this.registerRequestPayload.email = this.registerForm.get('email').value;
    this.registerRequestPayload.password = this.registerForm.get(
      'password'
    ).value;

    //Call on service to perform request to backend
    this.authService.register(this.registerRequestPayload).subscribe(
      (data) => {
        //Successful response. Go to login page
        this.isError = false;
        this.router.navigate(['/login'], {
          queryParams: { registered: 'true' },
        });
      },
      (error: HttpErrorResponse) => {
        //Error obtained. Display error notification
        // this.toastr.error('Registration failed. Please try again.');
        this.message = error.error;
        this.isError = true;
      }
    );
  }
}
