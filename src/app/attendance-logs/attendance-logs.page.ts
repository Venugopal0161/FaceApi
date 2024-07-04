import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ViewImagePage } from '../home/view-image/view-image.page';
import { IndexedDBService } from '../services/indexedDb.service';

@Component({
  selector: 'app-attendance-logs',
  templateUrl: './attendance-logs.page.html',
  styleUrls: ['./attendance-logs.page.scss'],
})
export class AttendanceLogsPage implements OnInit {
  records: any[] = [];
  content_loaded: boolean = false;

  constructor(private indexedDBService: IndexedDBService,
    private modalController: ModalController,

  ) { }

  async ngOnInit() {
    const records = await this.indexedDBService.getAllRecords();
    const header = 'data:image/';
    records.forEach(x => {
      x.empImage = header.concat(x.fileType) + ';base64,' + x.image
    })
    this.records = [...records];
    this.content_loaded = true;
  }
  async viewImage(image) {
    const modal = await this.modalController.create({
      component: ViewImagePage,
      componentProps: {
        image: image
      },
    });
    modal.present();
    modal.onWillDismiss().then((d: any) => { });
  }
}
