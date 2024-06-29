import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import * as faceapi from 'face-api.js';
import { HttpGetService } from '../services/http-get.service';
import { HttpPostService } from '../services/http-post.service';



import { HttpClient } from '@angular/common/http';
import '@capacitor-community/camera-preview';
import { AlertController, LoadingController } from '@ionic/angular';
import { GlobalvariablesService } from '../services/globalvariables.service';
import { ToastService } from '../services/toast.service';
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

  constructor(
    private httpGet: HttpGetService,
    private httpPost: HttpPostService,
    private http: HttpClient,
    private alertController: AlertController,
    private global: GlobalvariablesService,
    public loadingController: LoadingController,
    public toastService: ToastService,
  ) {
  }
  async ngOnInit() {
    try {
      this.global.presentLoading();
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/assets'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/assets'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/assets'),
        faceapi.nets.ageGenderNet.loadFromUri('/assets'),
      ]);
      console.log('Models loaded successfully');
      this.loadingController.dismiss();
    } catch (error) {
      this.loadingController.dismiss();
      console.error('Error loading models:', error);
    }
    this.getFingerData();
    this.capturePhoto();
  }
  getFingerData() {
    this.httpGet.getMasterList('fingerdatas').subscribe((res: any) => {
      this.employeeFingerData = res.response;
    },
      err => {
        console.error(err);
      })
  }


  clear() {
    console.log('clear');
  }
  submit() {
    console.log('subit');
  }
  async capturePhoto() {
    this.captureImg = true;
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri, // Capture as Blob
      source: CameraSource.Camera,
    });

    this.imageObj = image
    this.global.presentLoading();
    const blob = await this.uriToBlob(image.webPath);
    await this.blobToBase64(blob);
    return image;
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
        this.clickedimageSrc = base64data
        this.recgonise(base64data);
        resolve(base64data);
      };
      reader.onerror = () => {
        reject('Error converting blob to base64');
      };
      reader.readAsDataURL(blob);
    });
  }
  recgonise = async (base64data) => {
    const refFace = await faceapi.fetchImage(base64data)
    let refFaceAiData = await faceapi.detectAllFaces(refFace).withFaceLandmarks().withFaceDescriptors()
    console.log('your face captured', refFaceAiData);
    if (refFaceAiData.length >= 1) {
      let empImage: string;
      let listOfDistances = [];
      const header = 'data:image/';
      for (let emp of this.employeeFingerData) {
        empImage = header.concat(emp.fileType) + ';base64,' + emp.enrollTemplate
        const facesToCheck = await faceapi.fetchImage(empImage)
        let facesToCheckAiData = await faceapi.detectAllFaces(facesToCheck).withFaceLandmarks().withFaceDescriptors()
        let faceMatcher = new faceapi.FaceMatcher(refFaceAiData);
        facesToCheckAiData = faceapi.resizeResults(facesToCheckAiData, facesToCheck)
        const matchResults = facesToCheckAiData.map(face => {
          const { detection, descriptor } = face;
          listOfDistances.push({
            face,
            emp,
            match: faceMatcher.findBestMatch(descriptor)
          })
          return {
            face,
            match: faceMatcher.findBestMatch(descriptor)
          };

        });
      }
      // Step 2: Extract the scores
      const scores = listOfDistances.map(result => result.match.distance);
      console.log('scores lessthan 6', scores);
      // Step 3: Find the minimum score
      const minScore = Math.min(...scores);

      // Step 4: Count occurrences of the minimum score
      // const mc = scores.filter(score => score < 0.51).length;
      // console.log('mc count', mc);

      const minScoreCount = scores.filter(score => score === minScore && score < 0.51).length;
      console.log('minScoreCount', minScoreCount);
      this.loadingController.dismiss();

      // Step 5: Proceed if there is only one least value
      if (minScoreCount === 1) {
        const bestMatch = listOfDistances.find(result => result.match.distance === minScore);
        const { detection } = bestMatch.face;
        const emp = bestMatch.emp;
        const label = bestMatch.match.toString();
        // this.toastService.presentToast('Success', `Match found for ${emp.employeeName} - ${emp.employeeCode}`, 'top', 'success', 7000);
        // this.presentAlert('Success', `Match found for ${emp.employeeName} - ${emp.employeeCode}`)
        this.speak(`Heyy ${emp.employeeName}`);
        this.captureImg = true;
        this.presentAlert('Success', `Match found for ${emp.employeeName} - ${emp.employeeCode}`)
        // Ensure the label is not "unknown"
        if (!label.includes("unknown")) {
          let options = { label: "employee" };
        }
      } else if (minScoreCount === 0) {
        // this.toastService.presentToast('Error', 'No match found', 'top', 'danger', 7000);
        this.speak('Sorry, I cannot recognize you');
        this.presentAlertForError('Error', 'No match found');
      }
    }
    else {
      this.presentAlertForError('Error', 'Face not recognised properly')
      this.loadingController.dismiss();
      // this.deleteImage();
      // this.toastService.presentToast('Error', 'Face not recognised properly', 'top', 'danger', 7000)
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
    this.captureImg = false;
    this.clickedimageSrc = null;
    this.cameraActive = true;
    this.imageObj = null;
    this.capturePhoto();
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
