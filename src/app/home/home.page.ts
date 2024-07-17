import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as faceapi from 'face-api.js';
import { GlobalvariablesService } from '../services/globalvariables.service';
import { HttpGetService } from '../services/http-get.service';
import { HttpPutService } from '../services/http-put.service';
import { IndexedDBService } from '../services/indexedDb.service';
import { ViewImagePage } from './view-image/view-image.page';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  employeeFingerData: any;
  searchText = '';
  temp = [];

  // language: string = '';
  // last_slide: boolean = false;

  // @ViewChild('swiper') swiper: SwiperComponent;

  // // Swiper config
  // config: SwiperOptions = {
  //   slidesPerView: 1,
  //   spaceBetween: 50,
  //   pagination: { clickable: false },
  //   allowTouchMove: false // set true to allow swiping
  // }

  constructor(
    private httpGet: HttpGetService,
    private modalController: ModalController,
    private httpPut: HttpPutService,
    private indexDb: IndexedDBService,
    private global: GlobalvariablesService,
  ) { }

  ngOnInit(): void {

    this.getFingerData();
  }

  async getFingerData() {
    this.global.presentLoading();
    this.httpGet.getMasterList('fingerdatas').subscribe(async (res: any) => {
      res.response.forEach(element => {
        element.image = 'data:image/jpeg;base64,' + element.enrollTemplate;
      });
      this.global.loadingController.dismiss();
      this.employeeFingerData = res.response;
      this.temp = [...this.employeeFingerData];
      const recordsFromDb = await this.indexDb.getAllRecords();
      let employeeCodeSet = new Set(this.employeeFingerData.map(e => e.employeeCode));
      let missingEmployeeRecords = recordsFromDb.filter(emp => !employeeCodeSet.has(emp.emp.employeeCode));
      missingEmployeeRecords.forEach(x => {
        this.indexDb.deleteRecord(x.id);
      })
      const records = await this.indexDb.getAllRecords();

      let empCodeSet = new Set(records.map(emp => emp.emp.employeeCode));
      let missingRecords = this.employeeFingerData.filter(empData => !empCodeSet.has(empData.employeeCode));
      if (missingRecords.length > 0) {
        let records: any;
        const faceDetectionPromises = missingRecords.map(async (emp) => {
          // const empImage = header.concat(emp.fileType) + ';base64,' + emp.enrollTemplate;
          const facesToCheck = await faceapi.fetchImage(emp.image);
          let facesToCheckAiData = await faceapi.detectAllFaces(facesToCheck).withFaceLandmarks().withFaceDescriptors();
          facesToCheckAiData = faceapi.resizeResults(facesToCheckAiData, facesToCheck);
          records = {
            facesToCheckAiData: facesToCheckAiData,
            emp: {
              employeeCode: emp.employeeCode,
              employeeName: emp.employeeName,
            }
          };
          this.indexDb.storeRecord(records);
        });
      }
    },
      err => {
        this.global.loadingController.dismiss();
        console.error(err);
      })
  }

async viewImage(image){
  const modal = await this.modalController.create({
    component: ViewImagePage,
    componentProps: {
      image: image
    },
  });
  modal.present();
  modal.onWillDismiss().then((d: any) => {});
}
  async deleteEmployee(emp) {
    this.global.presentLoading();
    const allrecords = await this.indexDb.getAllRecords();
    const found = allrecords.find(ep => ep.emp.employeeCode === emp.employeeCode)
    this.indexDb.deleteRecord(found.id);
    this.httpPut.update('fd?fdId=' + emp.id, '').subscribe((res: any) => {
      // this.getFingerData();
      if (res.status.message === 'SUCCESS') {
        this.global.loadingController.dismiss();
      this.global.showAlert('Employee Deleted Successfully', 'Success','','','');
      this.getFingerData();
    }
  },
    err => {
    this.global.loadingController.dismiss();
      console.error(err);
    })

}

  searchEmployee(e) {}


  confirm(emp) {
    this.global.showAlert('' ,'Are you sure ?','','you want to delete ' + emp.employeeName + ' record ?',
    [{
     text:'No',
     role:'cancel',
    },
     {
       text:'Yes',
       handler: () => {
         this.deleteEmployee(emp);
       }
     }
   ]);
 }

 updateFilter(event) {
  const val = event.target.value.toString().toLowerCase();
  const temp = this.temp.filter(function (d) {
    return d.employeeName.toString().toLowerCase().indexOf(val) !== -1 || d.employeeCode.toLowerCase().indexOf(val) !== -1 || !val;;
  });
  this.employeeFingerData = temp;
}

}

