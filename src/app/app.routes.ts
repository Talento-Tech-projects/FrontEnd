import { Routes } from '@angular/router';
import { Signin } from './sites/signin/signin';
import { MainLayout } from './main-layout/main-layout';
import { Signup } from './sites/signup/signup';

export const routes: Routes = [
    {path: 'signin', component: Signin},
    {path: '', component: MainLayout},
    {path: 'signup', component: Signup}
];
