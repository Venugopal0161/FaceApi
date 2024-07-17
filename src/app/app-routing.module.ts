import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './authentication/guards/auth.guard';
import { LoginGuard } from './authentication/guards/login.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadChildren: () => import('./authentication/login/login.module').then(m => m.LoginPageModule), canActivate: [LoginGuard] 
  },
  {
    path: 'adminlogin',
    loadChildren: () => import('./authentication/admin-login/admin-login.module').then(m => m.AdminLoginPageModule)
  },

  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'registeremp',
    loadChildren: () => import('./employee-face-registration/employee-face-registration.module').then(m => m.EmployeeFaceRegistrationPageModule), canActivate: [AuthGuard] 
  },
  {
    path: 'recognition',
    loadChildren: () => import('./employee-face-recognition/employee-face-recognition.module').then(m => m.EmployeeFaceRecognitionPageModule), canActivate: [AuthGuard]
  },
  {
    path: 'mark-in',
    loadChildren: () => import('./mark-in/mark-in.module').then( m => m.MarkInPageModule)
  },
  {
    path: 'mark-out',
    loadChildren: () => import('./mark-out/mark-out.module').then( m => m.MarkOutPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
