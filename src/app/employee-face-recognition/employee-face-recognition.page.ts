import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import * as faceapi from 'face-api.js';
import { HttpGetService } from '../services/http-get.service';
import { HttpPostService } from '../services/http-post.service';

import { CameraPreview } from '@capacitor-community/camera-preview';

import { CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';

import { HttpClient } from '@angular/common/http';
import '@capacitor-community/camera-preview';
import { Capacitor } from '@capacitor/core';
import { LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
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
    private global: GlobalvariablesService,
    public loadingController: LoadingController,
    public toastService: ToastService,

    // private cameraPreview: CameraPreviewOptions,
    // private CameraPreviewPictureOptions: CameraPreviewPictureOptions
  ) {

  }
  ngOnInit(): void {
    this.getFingerData();
    this.capturePhoto();
  }

  openCamera() {
    const cameraPreview: CameraPreviewOptions = {
      position: 'front',
      parent: 'cameraPreview',
      className: 'cameraPreview',
    }
    CameraPreview.start(cameraPreview);
    this.cameraActive = true;
  }


  async stopCamera() {
  // await CameraPreview.stop();
    this.cameraActive = false;
    console.log('stoped venu');

  }


  async captureImage() {
    const CameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 90

    };

    const result = await CameraPreview.capture(CameraPreviewPictureOptions);
    this.image = `data:image/jpeg;base64,${result.value}`;
    this.recgonise(this.image);
    this.stopCamera();
  }

  flipCamera() { }






















  // fingerdatas
  getFingerData() {
    this.httpGet.getMasterList('fingerdatas').subscribe((res: any) => {
      console.log(res);
      this.employeeFingerData = res.response;
    },
      err => {
        console.error(err);

      })
  }

  clickToRecgonise() {
    this.capturePhoto();
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
    // console.log('Original image:', image);

    // // Convert Uri to Blob
    const blob = await this.uriToBlob(image.webPath);

    // Resize and compress the image
    // const compressedBlob = await this.resizeAndCompressImage(blob, 50);

    console.log('Compressed blob:', blob);

    // Convert compressed blob to base64 for storage or display
    await this.blobToBase64(blob);

    return image;
    // this.imageSrc = image.dataUrl;
    // this.captureImg = true;
    // this.imageObj = image;
    // console.log('Original dataUrl:', image.dataUrl);

    // // Convert dataUrl to base64 string
    // const base64 = image.dataUrl.replace(/^data:image\/\w+;base64,/, '');

    // // Resize and compress the image to reduce size under 50KB
    // const compressedBase64 = await this.resizeAndCompressImage(image, 50);

    // console.log('Compressed base64:', compressedBase64);
    // this.base64String = compressedBase64;

    // return image;
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

        // console.log('Base64 data:', base64data);
        this.clickedimageSrc = base64data
        // this.base64String = base64;
        this.recgonise(base64data);
        resolve(base64data);
      };
      reader.onerror = () => {
        reject('Error converting blob to base64');
      };
      reader.readAsDataURL(blob);
    });
  }
  getModelPath = (fileName: string) => {
    return Capacitor.convertFileSrc(`assets/models/${fileName}`);
  };

  // private async loadModel(url: string): Promise<any> {
  //   const response = await this.http.get(url, { responseType: 'arraybuffer' }).toPromise();
  //   const buffer = new Uint8Array(response);
  //   return faceapi.tf.io.decodeWeights(buffer, [
  //     { name: 'face_landmark_68_model', shape: [1, 1, 1024, 18], dtype: 'float32' },
  //     { name: 'face_recognition_model', shape: [1, 1, 1024, 18], dtype: 'float32' },
  //     { name: 'age_gender_model', shape: [1, 1, 1024, 18], dtype: 'float32' },
  //   ]);
  // }
  // getModelPath = (fileName: string) => {
  //    this.http.get(`assets/models/weights/${fileName}`).subscribe((res: any) => {
  //     console.log(res);
  //      return res.response
  //   })
  // };
  recgonise = async (base64data) => {
    console.log('came in run block venu');
    this.global.presentLoading();

    try {
      console.log('>>>', faceapi.nets.ssdMobilenetv1.loadFromUri(this.getModelPath('ssd_mobilenetv1_model-weights_manifest.json')));

      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(this.getModelPath('ssd_mobilenetv1_model-weights_manifest.json')),
        faceapi.nets.faceLandmark68Net.loadFromUri(this.getModelPath('face_landmark_68_model-weights_manifest.json')),
        faceapi.nets.faceRecognitionNet.loadFromUri(this.getModelPath('face_recognition_model-weights_manifest.json')),
        faceapi.nets.ageGenderNet.loadFromUri(this.getModelPath('age_gender_model-weights_manifest.json')),
      ]);
      console.log('Models loaded successfully>>> 1');
    } catch (error) {
      console.error('Error loading models1:', error);
    }

    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
        faceapi.nets.ageGenderNet.loadFromUri('/assets/models'),
      ]);
      console.log('Models loaded successfully>>2');
    } catch (error) {
      console.error('Error loading models2:', error);
    }

    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(environment.modelsBaseUrl),
        faceapi.nets.faceLandmark68Net.loadFromUri(environment.modelsBaseUrl),
        faceapi.nets.faceRecognitionNet.loadFromUri(environment.modelsBaseUrl),
        faceapi.nets.ageGenderNet.loadFromUri(environment.modelsBaseUrl),
      ]);
      console.log('Models loaded successfully>>3');
    } catch (error) {
      console.error('Error loading models3:', error);
    }
    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('./assets/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./assets/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./assets/models'),
        faceapi.nets.ageGenderNet.loadFromUri('./assets/models'),
      ]);
      console.log('Models loaded successfully>>4');
    } catch (error) {
      console.error('Error loading models4:', error);
    }

    // await Promise.all([
    //   faceapi.nets.ssdMobilenetv1.loadFromUri('../../assets/public/assets/models/weights'),
    //   faceapi.nets.faceLandmark68Net.loadFromUri('../../assets/public/assets/models/weights'),
    //   faceapi.nets.faceRecognitionNet.loadFromUri('../../assets/public/assets/models/weights'),
    //   faceapi.nets.ageGenderNet.loadFromUri('../../assets/public/assets/models/weights')
    // ])
    // D: \refer\basic_mobile_template\android\app\src\main\assets\public\assets\models\weights)

    const refFace = await faceapi.fetchImage(base64data)
    let refFaceAiData = await faceapi.detectAllFaces(refFace).withFaceLandmarks().withFaceDescriptors()
    console.log('your face captured venu', refFaceAiData);
    if (refFaceAiData.length > 0) {
      let empImage: string;
      let listOfDistances = [];
      const header = 'data:image/';
      console.log('starting to itterate venu');

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
      console.log('itteration done venu');

      console.log('listOfDistances venu', listOfDistances);
      // Step 2: Extract the scores
      const scores = listOfDistances.map(result => result.match.distance);
      console.log('scores lessthan 6 venu', scores);

      // Step 3: Find the minimum score
      const minScore = Math.min(...scores);

      // Step 4: Count occurrences of the minimum score
      const minScoreCount = scores.filter(score => score === minScore).length;
      console.log('minScoreCount venu', minScoreCount);
      this.loadingController.dismiss();

      // Step 5: Proceed if there is only one least value
      if (minScoreCount === 1) {
        const bestMatch = listOfDistances.find(result => result.match.distance === minScore);
        const { detection } = bestMatch.face;
        const emp = bestMatch.emp;
        const label = bestMatch.match.toString();
        console.warn(label, emp.employeeName);
        this.toastService.presentToast('Success', `Match found for ${emp.employeeName}`, 'top', 'success', 2000);
        this.speak(`Heyy ${emp.employeeName}`);

        // Ensure the label is not "unknown"
        if (!label.includes("unknown")) {
          let options = { label: "employee" };
        }
      } else if (minScoreCount === 0) {
        this.toastService.presentToast('Error', 'No match found', 'top', 'danger', 2000);
        this.speak('Sorry, I cannot recognize you');
      }
      this.deleteImage();
    }
    this.loadingController.dismiss();
    this.toastService.presentToast('Error', 'face not recognised properly', 'top', 'danger', 2000);

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
  }

}
