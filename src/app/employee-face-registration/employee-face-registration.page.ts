import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LoadingController } from '@ionic/angular';
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
      .getMasterList('empFingerData?deptCode=' + ev.target.value)
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
    if (this.selectedEmpCode) {
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
    } else {
      this.toastService.presentToast('Error', 'Please select employee', 'top', 'danger', 2000);
      return null; // Add a return statement here
    }
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
      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Set the max width and height
          const maxWidth = 800;
          const maxHeight = 600;
          let width = img.width;
          let height = img.height;

          // Calculate the new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height *= maxWidth / width));
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width *= maxHeight / height));
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          // Adjust the quality of the image
          let quality = 0.7;
          const step = 0.05;

          const compress = () => {
            canvas.toBlob(
              (blob) => {
                if (blob.size / 1024 <= maxSizeKB || quality <= 0.1) {
                  resolve(blob);
                } else {
                  quality -= step;
                  compress();
                }
              },
              'image/jpeg',
              quality
            );
          };

          compress();
        };
      };
      reader.onerror = (error) => {
        reject('Error reading file: ' + error);
      };
    });
  }
  async submit() {
    if (this.selectedEmpCode) {
      if (this.base64String) {
        const selectedEmpRecord = this.empList.find(x => x.employeeCode == this.selectedEmpCode);
        const obj = {
          base64: this.base64String,
          empCode: selectedEmpRecord.employeeCode,
          empName: selectedEmpRecord.employeeName,
          "employeeCode": selectedEmpRecord.employeeCode,
          "employeeName": selectedEmpRecord.employeeName,
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
