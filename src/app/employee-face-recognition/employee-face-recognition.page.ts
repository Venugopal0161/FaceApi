import { Component, OnInit } from '@angular/core';
import { HttpGetService } from '../services/http-get.service';
import { HttpPostService } from '../services/http-post.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import * as faceapi from 'face-api.js';

import { CameraPreview } from '@capacitor-community/camera-preview';

import { CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';

import '@capacitor-community/camera-preview';
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
    // private cameraPreview: CameraPreviewOptions,
    // private CameraPreviewPictureOptions: CameraPreviewPictureOptions
  ) {

  }
  ngOnInit(): void {
    this.getFingerData();
  }

  openCamera() {
   const cameraPreview : CameraPreviewOptions = {
        position: 'front',
        parent: 'cameraPreview',
        className: 'cameraPreview',
    }
    CameraPreview.start(cameraPreview);
    this.cameraActive = true;
  }


  async stopCamera(){
    await CameraPreview.stop();
    this.cameraActive = false;
  }


 async captureImage(){
    const CameraPreviewPictureOptions: CameraPreviewPictureOptions = {
        quality: 90
    
    };

    const result = await CameraPreview.capture(CameraPreviewPictureOptions);
    this.image = `data:image/jpeg;base64,${result.value}`;
    this.stopCamera();
 }

  flipCamera(){}






















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


  recgonise = async (base64data) => {
    console.log('came in run block venu');
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri('../../assets/models/weights'),
      faceapi.nets.faceLandmark68Net.loadFromUri('../../assets/models/weights'),
      faceapi.nets.faceRecognitionNet.loadFromUri('../../assets/models/weights'),
      faceapi.nets.ageGenderNet.loadFromUri('../../assets/models/weights'),
    ])

    const refFace = await faceapi.fetchImage(base64data)
    let refFaceAiData = await faceapi.detectAllFaces(refFace).withFaceLandmarks().withFaceDescriptors()

    // console.log(refFace);
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
    console.log('listOfDistances', listOfDistances);
    // Step 2: Extract the scores
    const scores = listOfDistances.map(result => result.match.distance);
    console.log('scores lessthan 6', scores);

    // Step 3: Find the minimum score
    const minScore = Math.min(...scores);

    // Step 4: Count occurrences of the minimum score
    const minScoreCount = scores.filter(score => score === minScore).length;
    console.log('minScoreCount', minScoreCount);

    // Step 5: Proceed if there is only one least value
    if (minScoreCount === 1) {
      const bestMatch = listOfDistances.find(result => result.match.distance === minScore);
      const { detection } = bestMatch.face;
      const emp = bestMatch.emp;
      const label = bestMatch.match.toString();
      console.warn(label, emp.employeeName);
      this.speak(`Heyy ${emp.employeeName}`);

      // Ensure the label is not "unknown"
      if (!label.includes("unknown")) {
        let options = { label: "employee" };
      }
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
}
