import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadChildren: () => import('./authentication/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'registeremp',
    loadChildren: () => import('./employee-face-registration/employee-face-registration.module').then(m => m.EmployeeFaceRegistrationPageModule)
  },
  {
    path: 'recognition',
    loadChildren: () => import('./employee-face-recognition/employee-face-recognition.module').then(m => m.EmployeeFaceRecognitionPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
