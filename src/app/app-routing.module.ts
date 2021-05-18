import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './auth/register/register.component';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { JournalComponent } from './journal/journal.component';
import { AuthGuard } from './auth/auth.guard';
import { ForgotComponent } from './auth/forgot/forgot.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

/* Register the routes of the website */
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'journal', component: JournalComponent },
  {
    path: 'profile/:username',
    component: ProfileComponent,
    canActivate: [AuthGuard], //Ensure user is logged in before visiting profile
  },
  { path: 'forgot', component: ForgotComponent },
  { path: 'resetPassword', component: ResetPasswordComponent },
];

@NgModule({
  declarations: [],
  //Imports so that the app can have routing functionality
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
