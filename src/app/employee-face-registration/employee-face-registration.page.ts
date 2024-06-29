import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LoadingController } from '@ionic/angular';
import Compressor from 'compressorjs';
import { HttpGetService } from '../services/http-get.service';
import { HttpPostService } from '../services/http-post.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-employee-face-registration',
  templateUrl: './employee-face-registration.page.html',
  styleUrls: ['./employee-face-registration.page.scss'],
})
export class EmployeeFaceRegistrationPage implements OnInit {
  deptList = [];
  empList = [];
  selectedEmpCode: string;
  captureImg = false;
  base64String: string;
  imageSrc: string;
  imageObj: any;

  constructor(
    private httpGet: HttpGetService,
    private httpPost: HttpPostService,
    private toastService: ToastService,
    private loadingController: LoadingController,

  ) { }

  ngOnInit() {
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
        this.deptList = dpt;
      }
    },
      err => {
        console.error(err);

      })
  }

  getEmployeesData(ev) {
    this.httpGet
      .getMasterList('empswithpayroll?dept=' + ev.target.value + '&image=false')
      .subscribe((res: any) => {
        this.empList = res.response;
      },
        err => {
          console.error(err);
        })
  }
  changeInEmp(ev) {
    this.selectedEmpCode = ev.target.value
  }
  clear() {
    this.imageSrc = null;
    this.base64String = null;
    this.captureImg = false;
    this.imageObj = null
  }


  async capturePhoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri, // Capture as Blob
      source: CameraSource.Camera,
    });

    this.imageObj = image
    // Convert Uri to Blob
    const blob = await this.uriToBlob(image.webPath);
    // Resize and compress the image
    const compressedBlob = await this.resizeAndCompressImage(blob, 2);
    // Convert compressed blob to base64 for storage or display
    await this.blobToBase64(compressedBlob);
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
        this.imageSrc = base64data
        this.base64String = base64;
        this.captureImg = true;

        resolve(base64data);
      };
      reader.onerror = () => {
        reject('Error converting blob to base64');
      };
      reader.readAsDataURL(blob);
    });
  }

  resizeAndCompressImage(imageBlob: Blob, maxSizeKB: number): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      new Compressor(imageBlob, {
        quality: 0.6, // Adjust quality (0 to 1)
        maxWidth: 800, // Max width to control size
        maxHeight: 600, // Max height to control size
        success(result) {
          resolve(result);
        },
        error(err) {
          console.error('Image compression error:', err);
          reject(err);
        },
      });
    });
  }
  async submit() {
    if (this.selectedEmpCode) {
      if (this.base64String) {
        const selectedEmpRecord = this.empList.find(x => x.employeeMaster.employeeCode == this.selectedEmpCode);
        const obj = {
          base64: this.base64String,
          empCode: selectedEmpRecord.employeeMaster.employeeCode,
          empName: selectedEmpRecord.employeeMaster.employeeName,
          "employeeCode": selectedEmpRecord.employeeMaster.employeeCode,
          "employeeName": selectedEmpRecord.employeeMaster.employeeName,
          "enrollTemplate": this.base64String,
          "fileType": this.imageObj.format,
        }
        this.httpPost.create('fingerdata', obj).subscribe((res: any) => {
          if (res.status.message == 'SUCCESS') {
            this.toastService.presentToast('Success', 'Employee registered Successfully', 'top', 'success', 2000);
            this.clear();
          } else {
            this.toastService.presentToast('Error', res, 'top', 'danger', 2000);
          }
        },
          err => {
            this.toastService.presentToast('Error', err.error.status.message, 'top', 'danger', 2000);
          })
      }
      else {
        this.toastService.presentToast('Error', 'Please take employee image', 'top', 'danger', 2000);
      }
    }
    else {
      this.toastService.presentToast('Error', 'Please select employee', 'top', 'danger', 2000);
    }
  }

}
