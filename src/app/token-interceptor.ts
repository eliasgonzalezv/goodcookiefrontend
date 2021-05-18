import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { AuthService } from './auth/shared/auth.service';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { LoginResponse } from './auth/login/login.response';

@Injectable({
  providedIn: 'root',
})
/**
 * Handles refresh and jwt. Adds both the refresh and jwt tokens to the headers
 * of each request to the backend.
 */
export class TokenInterceptor implements HttpInterceptor {
  //Acts like a semaphore to block outgoing calls to backend temporarily
  refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject(null);
  isTokenRefreshing: boolean = false;

  constructor(public authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    //Skip process of adding authorization header if we are making a request to phrase, login or refresh
    if (
      req.url.indexOf('refresh') !== -1 ||
      req.url.indexOf('login') !== -1 ||
      req.url.indexOf('phrase') !== -1
    ) {
      return next.handle(req);
    }
    //Extract and read jwt from localstorage
    const jwtToken = this.authService.getJwtToken();
    //check if we have a valid token already
    if (jwtToken) {
      //Handle error response from backend
      return next.handle(this.addToken(req, jwtToken)).pipe(
        catchError((error) => {
          if (error instanceof HttpErrorResponse && error.status === 403) {
            //Token sent could be expired
            return this.handleAuthErrors(req, next);
          } else {
            return throwError(error);
          }
        })
      );
    }
    return next.handle(req);
  }

  /**
   * Adds the jwt token to the authorization header of the request for authentication
   * in the backend.
   * @param req The current http request that the token will be added to
   * @param jwtToken The token that will be added to the header of the request
   * @returns The request with the added authorization header
   */
  addToken(req: HttpRequest<any>, jwtToken: string) {
    return req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + jwtToken),
    });
  }

  /**
   * Handles authentication errors. In case the jwt sent
   * is expired, this method blocks all outgoing request to the
   * backend temporarily in order to refresh the token. Once this
   * is obtained the request is handled.
   * @param req The request we just received an authentication error for
   * @param next A handler object to handle the request after refresh token is obtained
   * @returns An observable object containing an http event
   */
  private handleAuthErrors(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isTokenRefreshing) {
      //Temporarily block to make refresh token request
      this.isTokenRefreshing = true;
      this.refreshTokenSubject.next(null);
      //Make a refresh token request to backend
      return this.authService.refreshToken().pipe(
        switchMap((refreshTokenResponse: LoginResponse) => {
          //Obtain new token from backend
          this.isTokenRefreshing = false;
          //Add the token to the subject for later access.
          this.refreshTokenSubject.next(
            refreshTokenResponse.authenticationToken
          );
          //Add the new token to the authorization header and handle the request
          return next.handle(
            this.addToken(req, refreshTokenResponse.authenticationToken)
          );
        })
      );
    } else {
      //Take new token to submit request
      return this.refreshTokenSubject.pipe(
        filter((result) => result !== null),
        take(1),
        switchMap((res) => {
          return next.handle(
            this.addToken(req, this.authService.getJwtToken())
          );
        })
      );
    }
  }
}
