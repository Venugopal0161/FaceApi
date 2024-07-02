import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import * as faceapi from 'face-api.js';
import { HttpGetService } from './http-get.service';

@Injectable({
    providedIn: 'root'
})
export class FaceRecognitionService {
    employeeFingerData = [];
    listOfFaceData = [];
    loading: any;

    constructor(
        private httpGet: HttpGetService,
        public loadingController: LoadingController,

    ) {

    }

    async loadModels() {
        await this.presentLoading();
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri('/assets'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/assets'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/assets'),
            faceapi.nets.ageGenderNet.loadFromUri('/assets'),
        ]);
        console.log('Models loaded successfully');
        this.getFingerData();
    }

    async getFingerData() {
        this.httpGet.getMasterList('fingerdatas').subscribe(async (res: any) => {
            this.employeeFingerData = res.response;
            const header = 'data:image/';
            let empImage: string;
            for (let emp of this.employeeFingerData) {
                empImage = header.concat(emp.fileType) + ';base64,' + emp.enrollTemplate
                const facesToCheck = await faceapi.fetchImage(empImage);
                let facesToCheckAiData = await faceapi.detectAllFaces(facesToCheck).withFaceLandmarks().withFaceDescriptors()
                facesToCheckAiData = faceapi.resizeResults(facesToCheckAiData, facesToCheck)
                this.listOfFaceData.push({
                    facesToCheckAiData: facesToCheckAiData,
                    emp: emp
                })
            }
            console.log('listOfFaceData', this.listOfFaceData);
            await this.dismissLoading();

        },
            err => {
                console.error(err);
            })
    }

    async recognizeFace(base64data: string, employeeFingerData: any[]) {
        const refFace = await faceapi.fetchImage(base64data);
        let refFaceAiData = await faceapi.detectAllFaces(refFace).withFaceLandmarks().withFaceDescriptors();
        console.log('Your face captured', refFaceAiData);

        if (refFaceAiData.length >= 1) {
            let listOfDistances = [];
            const header = 'data:image/';

            for (let emp of employeeFingerData) {
                let empImage = header.concat(emp.fileType) + ';base64,' + emp.enrollTemplate;
                const facesToCheck = await faceapi.fetchImage(empImage);
                let facesToCheckAiData = await faceapi.detectAllFaces(facesToCheck).withFaceLandmarks().withFaceDescriptors();
                let faceMatcher = new faceapi.FaceMatcher(refFaceAiData);
                facesToCheckAiData = faceapi.resizeResults(facesToCheckAiData, facesToCheck);

                const matchResults = facesToCheckAiData.map(face => {
                    const { detection, descriptor } = face;
                    listOfDistances.push({
                        face,
                        emp,
                        match: faceMatcher.findBestMatch(descriptor)
                    });
                    return {
                        face,
                        match: faceMatcher.findBestMatch(descriptor)
                    };
                });
            }

            const scores = listOfDistances.map(result => result.match.distance);
            console.log('Scores less than 6', scores);
            const minScore = Math.min(...scores);
            const minScoreCount = scores.filter(score => score === minScore && score < 0.51).length;
            console.log('MinScoreCount', minScoreCount);

            if (minScoreCount === 1) {
                const bestMatch = listOfDistances.find(result => result.match.distance === minScore);
                return bestMatch;
            } else {
                return null;
            }
        } else {
            throw new Error('Face not recognised properly');
        }
    }
    async presentLoading() {
        this.loading = await this.loadingController.create({
            message: 'Please wait...',
            spinner: 'crescent'
        });
        await this.loading.present();
    }

    async dismissLoading() {
        if (this.loading) {
            await this.loading.dismiss();
        }
    }
}