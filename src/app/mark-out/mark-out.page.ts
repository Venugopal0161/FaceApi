import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, LoadingController } from '@ionic/angular';
import * as faceapi from 'face-api.js';
import { FaceRecognitionService } from '../services/face-recognization.service';
import { GlobalvariablesService } from '../services/globalvariables.service';
import { HttpGetService } from '../services/http-get.service';
import { HttpPostService } from '../services/http-post.service';
import { IndexedDBService } from '../services/indexedDb.service';
import { ToastService } from '../services/toast.service';
@Component({
  selector: 'app-mark-out',
  templateUrl: './mark-out.page.html',
  styleUrls: ['./mark-out.page.scss'],
})
export class MarkOutPage implements OnInit {
  employeeFingerData = [];
  captureImg = false;
  clickedimageSrc: string;
  imageObj: any;
  image = null;
  cameraActive = false;
  torchActive = false;
  constructor(
    private httpGet: HttpGetService,
    private httpPost: HttpPostService,
    private router: Router,
    private alertController: AlertController,
    private faceServ: FaceRecognitionService,
    private global: GlobalvariablesService,
    public loadingController: LoadingController,
    private indexDb: IndexedDBService,
    public toastService: ToastService,
  ) {
  }
  // ionViewWillEnter() {
  //   this.capturePhoto(); 
  // }

  async ngOnInit() {
    this.capturePhoto();
  }

  async capturePhoto() {
    this.captureImg = false;
    this.clickedimageSrc = null;
    this.imageObj = null;
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri, // Capture as Blob
        source: CameraSource.Camera,
      });
      this.cameraActive = true;
      this.imageObj = image;
    this.global.presentLoading();
    const blob = await this.uriToBlob(image.webPath);
    await this.blobToBase64(blob);
    } catch (error) {
      if (error.message === 'User cancelled photos app') {
        this.router.navigateByUrl('/mark-out');
        this.cameraActive = false;

        // Optionally show a message to the user
      } else {
        // Handle other errors
        console.error('Error capturing photo:', error);
        this.cameraActive = false;
        // Optionally show a different message to the user
        // this.presentAlert('Photo Capture Error', 'An error occurred while capturing the photo.');
      }
    }
    return null;
  }
  async uriToBlob(uri: string): Promise<Blob> {
    const response = await fetch(uri);
    return await response.blob();
  }
  async blobToBase64(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const base64 = base64data.replace(/^data:image\/\w+;base64,/, '');
        this.captureImg = true;
        this.clickedimageSrc = base64data
        this.recgonise(base64data, base64);
        resolve(base64data);
      };
      reader.onerror = () => {
        reject('Error converting blob to base64');
      };
      reader.readAsDataURL(blob);
    });
  }
  getDateAndTime() {
    const currentDate = new Date();
    // Extract year, month, day, hours, minutes, and seconds
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // Months are zero-based
    const day = currentDate.getDate();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();

    // Format the date and time as strings
    const date = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
    const time = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    return {
      date, time
    }
  }
  recgonise = async (base64data, base64String) => {
    const refFace = await faceapi.fetchImage(base64data);
    let refFaceAiData = await faceapi.detectAllFaces(refFace).withFaceLandmarks().withFaceDescriptors()
    if (refFaceAiData.length >= 1) {
      let listOfDistances = [];
      const facedata = await this.indexDb.getAllRecords();
      let faceMatcher = new faceapi.FaceMatcher(refFaceAiData);
      facedata.forEach(element => {
        const matchResults = element.facesToCheckAiData.map(face => {
          const { detection, descriptor } = face;
          listOfDistances.push({
            face: face,
            emp: element.emp,
            match: faceMatcher.findBestMatch(descriptor)
          })
          return {
            face: face,
            match: faceMatcher.findBestMatch(descriptor)
          };
        });
      });
      // Step 2: Extract the scores
      const scores = listOfDistances.map(result => result.match.distance);
      const minScore = Math.min(...scores);
      let val: number
      val = Number(minScore.toFixed(2));
      const minScoreCount = scores.filter(score => score === minScore && score <= 0.49).length;
      this.loadingController.dismiss();
      // Step 5: Proceed if there is only one least value
      if (minScoreCount === 1) {
        const bestMatch = listOfDistances.find(result => result.match.distance === minScore);
        const { detection } = bestMatch.face;
        const emp = bestMatch.emp;
        const label = bestMatch.match.toString();
        this.speak(`Heyy ${emp.employeeName}`);
        this.captureImg = true;
        this.presentAlert('Success', `Marked-Out for ${emp.employeeName} - ${emp.employeeCode}`)
        this.SendDataToApi(emp, base64String);
      } else if (minScoreCount === 0) {
        this.speak('Sorry, I cannot recognize you');
        this.presentAlertForError('Error', `No match found`);
      }
    }
    else {
      this.presentAlertForError('Error', `Face not recognised properly`)
      this.loadingController.dismiss();
    }

  }

  SendDataToApi(emp, base64String) {
    const getTimeAndDate = this.getDateAndTime();
    const obj = {
      "timesheetdto": {
        "dateCode": getTimeAndDate.date,
        "employeeCode": emp.employeeCode,
        "employeeName": emp.employeeName,
        "outTime": getTimeAndDate.time,
        'outDevice': localStorage.getItem('deviceId'),
        "outDate": getTimeAndDate.date,
        application: 'X_Face'
      },
      "type": "OUT",
      fileName: emp.employeeCode + getTimeAndDate.time + getTimeAndDate.date,
      fileType: this.imageObj.format,
      image: base64String,
      // locationLog: {
      //   "latitude": this.latCode,
      //   "longitude": this.longCode,
      //   "deviceId": localStorage.getItem('uuid')
      // }
    }
    this.httpPost.create('timesheet', obj).subscribe(async (res: any) => {
      if (res.status.message === 'Record Already exist') {
      }
      else if (res.status.message === 'SUCCESS') {
        //   const alert = await this.alertController.create({
        //     cssClass: 'my-custom-class',
        //     header: 'Success',
        //     message: 'Attendance marked',
        //     buttons: [
        //       {
        //         text: 'Ok',
        //         handler: () => {
        //           this.cameraActive = false;
        //           this.captureImg = false;
        //         }
        //       }
        //     ],

        //   });
        //   await alert.present();
        //   const { role } = await alert.onDidDismiss();
      }
      // else {
      //   this.presentAlertForError('Error', res.status.message)
      // }
    },
      (err) => {
        console.error(err);
        // this.presentAlertForError('Error', err.error.status.message)
      })
  }

  speak(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1; // Set the rate (0.1 to 10)
      utterance.pitch = 2; // Set the pitch (0 to 2)
      utterance.volume = 1; // Set the volume (0 to 1)

      window.speechSynthesis.speak(utterance);

    } else {
      console.warn('Text-to-Speech is not supported in this browser.');
    }
  }

  deleteImage() {
    this.capturePhoto();
    this.captureImg = false;
    this.clickedimageSrc = null;
    this.cameraActive = true;
    this.imageObj = null;
    // this.alertController.dismiss();
  }
  async presentAlert(header, msg) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: header,
      message: msg,
      backdropDismiss: false,
      buttons: [ 
        {
          text: 'Ok',
          handler: () => {
            this.deleteImage();
          }
        }
      ],

    });
    await alert.present();

    const { role } = await alert.onDidDismiss();
  }
  async presentAlertForError(header, msg) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class-danger',
      header: header,
      message: msg,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.deleteImage();
          }
        }
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
  }


}
