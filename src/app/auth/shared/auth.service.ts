import { Injectable, Output } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { RegisterRequestPayload } from '../../models/register-request.payload';
import { Observable, throwError } from 'rxjs';
import { LoginRequestPayload } from '../../models/login.request.payload';
import { LoginResponse } from '../login/login.response';
import { LocalStorageService } from 'ngx-webstorage';
import { map, tap } from 'rxjs/operators';
import { EventEmitter } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ForgotPasswordRequest } from 'src/app/models/forgotPassword.request.payload';
import { UpdatePasswordRequest } from 'src/app/models/updatePassword.request.payload';

@Injectable({
  providedIn: 'root',
})
/* Service class that performs authentication calls to backend */
export class AuthService {
  //loggedIn as output
  @Output() loggedIn: EventEmitter<boolean> = new EventEmitter();
  @Output() username: EventEmitter<string> = new EventEmitter();

  //username aas output

  refreshTokenPayload = {
    refreshToken: this.getRefreshToken(),
    username: this.getUsername(),
  };

  //HttpClient for requests and localStorage service to provide access to
  //web browser local storage
  constructor(
    private httpClient: HttpClient,
    private localStorage: LocalStorageService
  ) {}

  /**
   * Extracts and returns the Jwt from localstorage
   */
  getJwtToken() {
    return this.localStorage.retrieve('authenticationToken');
  }

  /**
   *Extracts and returns the username from the localstorage
   */
  getUsername() {
    return this.localStorage.retrieve('username');
  }

  /**
   * Extracts and returns the refresh token from the localstorage
   */
  getRefreshToken() {
    return this.localStorage.retrieve('refreshToken');
  }

  //Checks and returns to see if the user is logged in
  isLoggedIn(): boolean {
    return this.getJwtToken() != null;
  }
  /**
   * Makes a refresh token request to backend.
   * Saves the new token into local storage and
   * returns the LoginResponse object containing this infomation.
   */
  refreshToken() {
    const refreshTokenPayload = {
      refreshToken: this.getRefreshToken(),
      username: this.getUsername(),
    };

    //Make refresh token request
    return this.httpClient
      .post<LoginResponse>(
        'http://localhost:8080/api/auth/refresh/token',
        refreshTokenPayload
      )
      .pipe(
        tap((response) => {
          //Erase previous values
          this.localStorage.clear('authenticationToken');
          this.localStorage.clear('expiresAt');
          //Save to localstorage
          this.localStorage.store(
            'authenticationToken',
            response.authenticationToken
          );
          this.localStorage.store('expiresAt', response.expiresAt);
        })
      );
  }

  /**
   * Performs a POST request to the backend register endpoint
   * @param registerRequestPayload the payload containing the user information to register
   * @returns An observable object indicating the response of the register api call
   */
  register(registerRequestPayload: RegisterRequestPayload): Observable<any> {
    //Perform post request to backend in order to register user
    return this.httpClient.post(
      'http://localhost:8080/api/auth/register',
      registerRequestPayload,
      { responseType: 'text' }
    );
  }

  /**
   * Performs a POST request to the backend login endpoint
   * @param loginRequestPayload  the payload containing the user infomartion to be authenticated
   * @returns a LoginResponsePayload containing
   */
  login(loginRequestPayload: LoginRequestPayload): Observable<boolean> {
    //Perform post request to backend
    return this.httpClient
      .post<LoginResponse>(
        'http://localhost:8080/api/auth/login',
        loginRequestPayload
      )
      .pipe(
        //Map the response to browsers local storage
        map((data) => {
          this.localStorage.store(
            'authenticationToken',
            data.authenticationToken
          );
          this.localStorage.store('username', data.username);
          this.localStorage.store('refreshToken', data.refreshToken);
          this.localStorage.store('expiresAt', data.expiresAt);

          //emit loggedIn true
          this.loggedIn.emit(true);
          //emit username
          this.username.emit(data.username);
          return true;
        })
      );
  }

  /**
   * Performs a call to backend to logout the current user
   * and deletes the credential information stored in
   * user's browser local storage.
   */
  logout() {
    //Perform logout call to backend
    this.httpClient
      .post('http://localhost:8080/api/auth/logout', this.refreshTokenPayload, {
        responseType: 'text',
      })
      .subscribe(
        (data) => {
          console.log(data);
        },
        (error) => {
          throwError(error);
        }
      );
    //clear the local storage values
    this.localStorage.clear('authenticationToken');
    this.localStorage.clear('username');
    this.localStorage.clear('refreshToken');
    this.localStorage.clear('expiresAt');
  }

  /**
   * Performs a backend call to send the forgot password email and token to
   * the email associated with the account to reset the password for.
   * @param payload the payload containing the email associated with the account to resest the password for
   */
  forgotPassword(
    forgotPasswordRequest: ForgotPasswordRequest
  ): Observable<any> {
    return this.httpClient.post(
      'http://localhost:8080/api/auth/forgot',
      forgotPasswordRequest,
      { responseType: 'text' }
    );
  }

  /**
   * Performs a call to backend to validate the password reset token
   * provided
   * @param passwordResetToken The token to validate
   */
  validatePasswordResetToken(token: string): Observable<any> {
    return this.httpClient.post(
      'http://localhost:8080/api/auth/validatePasswordToken/' + token,
      null,
      { responseType: 'text' }
    );
  }

  /**
   * Performs a call to backend to update the password for a user that
   * has reset their password.
   * @param updatePasswordRequest Payload containing the new password and token issued for user
   */
  updatePassword(updatePasswordRequest: UpdatePasswordRequest) {
    return this.httpClient.put(
      'http://localhost:8080/api/auth/updatePassword',
      updatePasswordRequest,
      { responseType: 'text' }
    );
  }
}
