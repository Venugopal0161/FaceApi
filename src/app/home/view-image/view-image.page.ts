import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-view-image',
  templateUrl: './view-image.page.html',
  styleUrls: ['./view-image.page.scss'],
})
export class ViewImagePage implements OnInit {

  @Input() image: any;
  viewImage: any;

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {  
     this.viewImage = this.image;
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
}
