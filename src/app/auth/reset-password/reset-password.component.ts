import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { throwError } from 'rxjs';
import { UpdatePasswordRequest } from 'src/app/models/updatePassword.request.payload';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  token: string;
  isTokenValid: boolean;
  resetPasswordForm: FormGroup;
  updatePasswordRequest: UpdatePasswordRequest;
  message: string;

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    //Get the token from the query parameters
    this.activatedRoute.queryParams.subscribe((params) => {
      this.token = params['token'];
      //Validate token
      this.authService.validatePasswordResetToken(this.token).subscribe(
        (res) => {
          //Token is valid
          console.log(res);
          this.isTokenValid = true;
          //Form for update password shows
          this.resetPasswordForm = new FormGroup({
            newPassword: new FormControl('', Validators.required),
            passwordMatch: new FormControl('', Validators.required),
          });

          //Initialize the update password request payload
          this.updatePasswordRequest = {
            newPassword: '',
            token: this.token,
          };

          this.message = '';
        },
        (error: HttpErrorResponse) => {
          //Token is expired or Token provided was invalid
          console.log(error.error);
          //Show invalid token message
          this.isTokenValid = false;
          this.message = 'Error!';
        }
      );
    });
  }

  /**
   * Processes the user's request to update his password,
   * calls on service to perform request to backend
   */
  resetPassword() {
    //Get the new password from form input
    let newPassword = this.resetPasswordForm.get('newPassword').value;
    this.updatePasswordRequest.newPassword = newPassword;

    //Perform backend call
    this.authService.updatePassword(this.updatePasswordRequest).subscribe(
      (res) => {
        //Set the success message, this will show as an alert
        this.message = res;
        //Reset the form upon submit
        this.resetPasswordForm.reset();
      },
      (error: HttpErrorResponse) => {
        //Unknown error occurred
        throwError(error);
      }
    );
  }
}
