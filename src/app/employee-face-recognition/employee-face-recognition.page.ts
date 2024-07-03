import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import '@capacitor-community/camera-preview';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import * as faceapi from 'face-api.js';
import { FaceRecognitionService } from '../services/face-recognization.service';
import { GlobalvariablesService } from '../services/globalvariables.service';
import { HttpGetService } from '../services/http-get.service';
import { HttpPostService } from '../services/http-post.service';
import { ToastService } from '../services/toast.service';
import { EmpModalPage } from './emp-modal/emp-modal.page';

@Component({
  selector: 'app-employee-face-recognition',
  templateUrl: './employee-face-recognition.page.html',
  styleUrls: ['./employee-face-recognition.page.scss'],
})
export class EmployeeFaceRecognitionPage implements OnInit {

  employeeFingerData = [];
  captureImg = false;
  clickedimageSrc: string;
  imageObj: any;
  image = null;
  cameraActive = false;
  torchActive = false;
  deptList: any[];
  empList: any;
  selectedEmployee: any;
  selectedEmployeeText: any;
  department = 'ALL';
  selectedEmployeefacePrint: any;

  constructor(
    private httpGet: HttpGetService,
    private httpPost: HttpPostService,
    private router: Router,
    private alertController: AlertController,
    private faceServ: FaceRecognitionService,
    private global: GlobalvariablesService,
    public loadingController: LoadingController,
    public toastService: ToastService,
    public modalController: ModalController,
  ) {
  }
  async ngOnInit() {
    this.getDeptList();
  }

  getDeptList() {
    this.httpGet.getMasterList('depts/active').subscribe((res: any) => {
      let dpt = [];
      if (res.response.length > 0) {
        dpt = res.response;
        dpt.unshift({
          deptCode: 'ALL',
          deptName: 'ALL'
        })
        this.deptList = res.response;
      }
    },
      err => {
        console.error(err);
      })
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
        this.router.navigateByUrl('/recognition');
        this.cameraActive = false;
        // Optionally show a message to the user
      } else {
        // Handle other errors
        console.error('Error capturing photo:', error);
        this.cameraActive = false;
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
    console.log('your face captured', refFaceAiData);
    if (refFaceAiData.length >= 1) {
      let empImage: string;
      let listOfDistances = [];
      const facedata = [this.selectedEmployeefacePrint];
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
      // Step 3: Find the minimum score
      const minScore = Math.min(...scores);
      console.log('minScore', scores, minScore);

      let val: number
      val = Number(minScore.toFixed(2));

      const minScoreCount = scores.filter(score => score === minScore && score <= 0.49).length;
      console.log('minScoreCount', minScoreCount);
      this.loadingController.dismiss();
      // Step 5: Proceed if there is only one least value
      if (minScoreCount === 1) {
        const bestMatch = listOfDistances.find(result => result.match.distance === minScore);
        const { detection } = bestMatch.face;
        const emp = bestMatch.emp;
        const label = bestMatch.match.toString();
        this.captureImg = true;
        if (emp.employeeCode == this.selectedEmployee.employeeCode) {
          this.presentAlert('Success', `Match found for ${emp.employeeName} - ${emp.employeeCode} with ${val}`)
        }
      } else if (minScoreCount === 0) {
        this.speak('Sorry, I cannot recognize you');
        this.presentAlertForError('Error', `No match found and got value ${val}`);
      }
    }
    else {
      this.presentAlertForError('Error', `Face not recognised properly`)
      this.loadingController.dismiss();
    }

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
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.cameraActive = false;
            this.captureImg = true;
            // this.clickedimageSrc = null;
            // this.imageObj = null;

          }
        }
      ],

    });
    console.log('efef');

    await alert.present();

    const { role } = await alert.onDidDismiss();
  }
  async presentAlertForError(header, msg) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class-danger',
      header: header,
      message: msg,
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



  async openModal() {
    if (!this.captureImg) {
      const modal = await this.modalController.create({
        component: EmpModalPage,
        backdropDismiss: false,
        cssClass: 'auto-height',
        componentProps: {
          // empList: this.empList
          dept: this.department
        }
      });
      modal.onDidDismiss().then((d: any) => {
        this.selectedEmployee = d.data.empRecord;
        console.log('selectedEmployee', this.selectedEmployee);
        console.log(this.faceServ.listOfFaceData);

        this.selectedEmployeefacePrint = this.faceServ.listOfFaceData.find(x => x.emp.employeeCode == this.selectedEmployee.employeeCode);
        console.log('selectedEmployeefacePrint', this.selectedEmployeefacePrint);
      });
      return await modal.present();
    }
  }

  async markInFun() {
    const getTimeAndDate = this.getDateAndTime();
    const obj = {
      "timesheetdto": {
        "dateCode": getTimeAndDate.date,
        "employeeCode": this.selectedEmployee.employeeCode,
        "employeeName": this.selectedEmployee.employeeName,
        "outTime": getTimeAndDate.time,
        'outDevice': localStorage.getItem('uuid'),
        "outDate": getTimeAndDate.date,
      },
      "type": "IN",
      fileName: this.selectedEmployee.employeeCode + getTimeAndDate.time + getTimeAndDate.date,
      fileType: this.imageObj.format,
      image: this.clickedimageSrc.replace(/^data:image\/\w+;base64,/, '')
    }
    this.global.presentLoading();

    this.httpPost.create('timesheet', obj).subscribe(async (res: any) => {
      this.global.loadingController.dismiss();
      if (res.status.message === 'Record Already exist') {
        this.presentAlertForError('Error', `Attendance already marked`)
      }
      else if (res.status.message === 'SUCCESS') {
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'Success',
          message: 'Attendance marked',
          buttons: [
            {
              text: 'Ok',
              handler: () => {
                this.cameraActive = false;
                this.captureImg = false;
              }
            }
          ],

        });
        await alert.present();
        const { role } = await alert.onDidDismiss();
      }
      else {
        this.presentAlertForError('Error', res.status.message)
      }
    },
      (err) => {
        console.error(err);
        this.global.loadingController.dismiss();
        this.presentAlertForError('Error', err.error.status.message)
      })
  }


  async markOutFun() {
    const getTimeAndDate = this.getDateAndTime();
    const obj = {
      "timesheetdto": {
        "dateCode": getTimeAndDate.date,
        "employeeCode": this.selectedEmployee.employeeCode,
        "employeeName": this.selectedEmployee.employeeName,
        "outTime": getTimeAndDate.time,
        'outDevice': localStorage.getItem('uuid'),
        "outDate": getTimeAndDate.date,
      },
      "type": "OUT",
      fileName: this.selectedEmployee.employeeCode + getTimeAndDate.time + getTimeAndDate.date,
      fileType: this.imageObj.format,
      image: this.clickedimageSrc.replace(/^data:image\/\w+;base64,/, '')
    }
    this.global.presentLoading();
    this.httpPost.create('timesheet', obj).subscribe(async (res: any) => {
      this.global.loadingController.dismiss();
      if (res.status.message === 'Record Already exist') {
        this.presentAlertForError('Error', `Attendance already marked`)
      }
      else if (res.status.message === 'SUCCESS') {
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'Success',
          message: 'Attendance marked',
          buttons: [
            {
              text: 'Ok',
              handler: () => {
                this.cameraActive = false;
                this.captureImg = false;
              }
            }
          ],

        });
        await alert.present();
        const { role } = await alert.onDidDismiss();
      }
      else {
        this.presentAlertForError('Error', res.status.message)
      }
    },
      (err) => {
        console.error(err);
        this.global.loadingController.dismiss();
        this.presentAlertForError('Error', err.error.status.message)
      })
  }
}
