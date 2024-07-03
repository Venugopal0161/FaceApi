import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import * as faceapi from 'face-api.js';
import { HttpGetService } from '../services/http-get.service';
import { HttpPostService } from '../services/http-post.service';



import { Router } from '@angular/router';
import '@capacitor-community/camera-preview';
import { AlertController, LoadingController, ViewWillEnter } from '@ionic/angular';
import { FaceRecognitionService } from '../services/face-recognization.service';
import { GlobalvariablesService } from '../services/globalvariables.service';
import { ToastService } from '../services/toast.service';
@Component({
  selector: 'app-employee-face-recognition',
  templateUrl: './employee-face-recognition.page.html',
  styleUrls: ['./employee-face-recognition.page.scss'],
})
export class EmployeeFaceRecognitionPage implements OnInit, ViewWillEnter {

  employeeFingerData = [];
  captureImg = false;
  clickedimageSrc: string;
  imageObj: any;
  image = null;
  cameraActive = false;
  torchActive = false;
  dbName = 'EmployeeDB';
  storeName = 'EmployeeRecords';
  deptList: any[];
  empList: any;
  constructor(
    private httpGet: HttpGetService,
    private httpPost: HttpPostService,
    private router: Router,
    private alertController: AlertController,
    private faceServ: FaceRecognitionService,
    private global: GlobalvariablesService,
    public loadingController: LoadingController,
    public toastService: ToastService,
  ) {
  }
  ionViewWillEnter() {
    // this.capturePhoto();
  }

  async ngOnInit() {
    this.getDeptList();
    // this.capturePhoto();
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
        this.deptList = dpt;
      }
    },
      err => {
        console.error(err);

      })
  }

  getEmployeesData(ev) {
    this.httpGet
      .getMasterList('empFingerData?deptCode=' + ev.target.value)
      .subscribe((res: any) => {
        this.empList = res.response;
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
      return image;
    } catch (error) {
      if (error.message === 'User cancelled photos app') {
        this.router.navigateByUrl('/recognition');
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
    // console.log(base64data);
    const getTimeAndDate = this.getDateAndTime();
    const refFace = await faceapi.fetchImage(base64data);
    let refFaceAiData = await faceapi.detectAllFaces(refFace).withFaceLandmarks().withFaceDescriptors()
    console.log('your face captured', refFaceAiData);
    if (refFaceAiData.length >= 1) {
      let empImage: string;
      let listOfDistances = [];
      const facedata = this.faceServ.listOfFaceData;

      // const header = 'data:image/';
      // for (let emp of this.employeeFingerData) {
      // empImage = header.concat(emp.fileType) + ';base64,' + emp.enrollTemplate


      // const facesToCheck = await faceapi.fetchImage(empImage);
      // let facesToCheckAiData = await faceapi.detectAllFaces(facesToCheck).withFaceLandmarks().withFaceDescriptors()
      // console.warn('facesToCheckAiData', facesToCheckAiData);

      // facesToCheckAiData = faceapi.resizeResults(facesToCheckAiData, facesToCheck)
      // console.log('facesToCheckAiData >>>>>>', facesToCheckAiData);

      console.log('facedata', facedata);

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

      // }
      // Step 2: Extract the scores
      const scores = listOfDistances.map(result => result.match.distance);
      // console.log('scores lessthan 6', scores);
      // Step 3: Find the minimum score
      const minScore = Math.min(...scores);
      console.log('minScore', scores, minScore);

      let val: number
      val = Number(minScore.toFixed(2));

      // Step 4: Count occurrences of the minimum score
      // const mc = scores.filter(score => score < 0.51).length;
      // console.log('mc count', mc);

      const minScoreCount = scores.filter(score => score === minScore && score <= 0.49).length;
      console.log('minScoreCount', minScoreCount);
      this.loadingController.dismiss();
      // Step 5: Proceed if there is only one least value
      if (minScoreCount === 1) {
        const bestMatch = listOfDistances.find(result => result.match.distance === minScore);
        const { detection } = bestMatch.face;
        const emp = bestMatch.emp;
        const label = bestMatch.match.toString();
        this.speak(`Heyy ${emp.employeeName}`);
        this.captureImg = true;
        this.presentAlert('Success', `Match found for ${emp.employeeName} - ${emp.employeeCode} with ${val}`)
        await this.storeRecord({
          "timesheetdto": {
            "dateCode": getTimeAndDate.date,
            "employeeCode": emp.employeeCode,
            "employeeName": emp.employeeName,
            "outTime": getTimeAndDate.time,
            'outDevice': localStorage.getItem('uuid'),
            "outDate": getTimeAndDate.date,
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
        });


        this.processRecords();

        // Ensure the label is not "unknown"
        if (!label.includes("unknown")) {
          let options = { label: "employee" };
        }
      } else if (minScoreCount === 0) {
        // this.toastService.presentToast('Error', 'No match found', 'top', 'danger', 7000);
        this.speak('Sorry, I cannot recognize you');
        this.presentAlertForError('Error', `No match found and got value ${val}`);
      }
    }
    else {
      this.presentAlertForError('Error', `Face not recognised properly`)
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
            this.deleteImage();
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

  openDatabase() {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
        store.createIndex('status', 'status', { unique: false });
      };

      request.onsuccess = (event: Event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  async storeRecord(record: any) {
    const db = await this.openDatabase();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise<void>((resolve, reject) => {
      record.status = 'pending';
      store.add(record);

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }
  async getPendingRecords(batchSize: number) {
    const db = await this.openDatabase();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('status');

    return new Promise<any[]>((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only('pending'));
      const records: any[] = [];
      let count = 0;

      request.onsuccess = (event: Event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && count < batchSize) {
          records.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(records);
        }
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }
  async updateRecordStatus(id: number, status: string) {
    const db = await this.openDatabase();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise<void>((resolve, reject) => {
      const request = store.get(id);

      request.onsuccess = (event: Event) => {
        const record = (event.target as IDBRequest).result;
        record.status = status;
        store.put(record);
        resolve();
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async processRecords() {
    const batchSize = 5;

    while (true) {
      const pendingRecords = await this.getPendingRecords(batchSize);
      if (pendingRecords.length === 0) {
        break;
      }

      // Make API call with pendingRecords
      try {
        await this.sendRecordsToAPI(pendingRecords); // Replace with your API call function

        // Update record status to "sent"
        for (const record of pendingRecords) {
          await this.updateRecordStatus(record.id, 'sent');
        }
      } catch (error) {
        // Update record status to "failed"
        for (const record of pendingRecords) {
          await this.updateRecordStatus(record.id, 'failed');
        }
      }
    }
  }

  async sendRecordsToAPI(records: any[]) {
    // Replace with your API call logic
    return new Promise<void>((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        console.log('Sending records:', records);
        resolve();
      }, 100000);
    });
  }


}
