import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { FaceRecognitionService } from 'src/app/services/face-recognization.service';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  loading: any;
  constructor(private router: Router,
    private faceRecognitionService: FaceRecognitionService,
    public loadingController: LoadingController,
    private global: GlobalvariablesService,
  ) { }

  async canActivate(): Promise<boolean> {
    if (localStorage.getItem('user-data')) {
      await this.faceRecognitionService.loadModels();
      return false;
    }
    return true;
  }

}
