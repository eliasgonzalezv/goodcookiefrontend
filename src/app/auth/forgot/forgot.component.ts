import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ForgotPasswordRequest } from 'src/app/models/forgotPassword.request.payload';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css'],
})
export class ForgotComponent implements OnInit {
  //Get a hold of the forgot password form
  forgotForm: FormGroup;
  forgotPasswordRequest: ForgotPasswordRequest;
  message: string;
  isError: boolean;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.forgotForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });

    this.forgotPasswordRequest = {
      email: '',
    };

    this.message = '';
  }

  /**
   * Uses the form input to call on service
   * and send the forgot password email to the user
   */
  forgotPassword() {
    //Read email from the form field
    let email = this.forgotForm.get('email').value;

    this.forgotPasswordRequest.email = email;

    // console.log(email);
    //!Wait for response if response is success then
    //!go to success page
    //!else go to login

    //Call on service to perform backend call
    this.authService.forgotPassword(this.forgotPasswordRequest).subscribe(
      (res) => {
        //Go to success page
        this.isError = false;
        this.message = res;
        this.forgotForm.reset();
        console.log(this.message);
        // this.router.navigateByUrl('/success');
        // this.router.navigateByUrl('/login');
      },
      (error: HttpErrorResponse) => {
        // console.error(error.error);
        this.isError = true;
        this.message = error.error;
        this.forgotForm.reset();
        console.log(this.message);
      }
    );
  }
}
