import { Routes } from '@angular/router';
import { Signin } from './sites/signin/signin';
import { MainLayout } from './main-layout/main-layout';
import { Signup } from './sites/signup/signup';
import { Projects } from './sites/projects/projects';
import { Workspace } from './sites/workspace/workspace';

export const routes: Routes = [
    {path: 'signin', component: Signin},
    {path: '', component: MainLayout},
    {path: 'signup', component: Signup},
    {path: 'projects', component: Projects},
    {path: 'workspace', component: Workspace}
];
