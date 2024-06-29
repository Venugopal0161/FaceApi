import { Component, OnInit } from '@angular/core';
import { HttpGetService } from '../services/http-get.service';
import { ViewImagePage } from './view-image/view-image.page';
import { ModalController } from '@ionic/angular';
import { HttpPutService } from '../services/http-put.service';
import { GlobalvariablesService } from '../services/globalvariables.service';

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
    private httpPut :HttpPutService,
    private global: GlobalvariablesService,
  ) { }

  ngOnInit(): void {

    this.getFingerData();
  }

  getFingerData() {
    this.httpGet.getMasterList('fingerdatas').subscribe((res: any) => {

      res.response.forEach(element => {
        element.image = 'data:image/jpeg;base64,' + element.enrollTemplate;
      });

      this.employeeFingerData = res.response;
      this.temp = [...this.employeeFingerData];
      console.log('>>>>>',this.employeeFingerData);


      
    },
      err => {
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
deleteEmployee(id) {
  this.global.presentLoading();
  this.httpPut.update('fd?fdId='+id,'').subscribe((res: any) => {
    console.log(res);
    this.global.loadingController.dismiss();
    // this.getFingerData();
    if(res.status.message === 'SUCCESS'){
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
        this.deleteEmployee(emp.id);
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

