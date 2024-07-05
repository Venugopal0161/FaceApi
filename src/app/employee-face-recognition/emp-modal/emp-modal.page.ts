import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';

@Component({
  selector: 'app-emp-modal',
  templateUrl: './emp-modal.page.html',
  styleUrls: ['./emp-modal.page.scss'],
})
export class EmpModalPage implements OnInit {

  @Input() dept: any;

  selectedEmployee: any;
  selectedEmployeeIndex: any;
  empList = [];
  temp = []

  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private global: GlobalvariablesService,
    private httpGet: HttpGetService,
  ) { }

  ngOnInit(): void {
    this.getEmployeesData();
  }

  searchbarInput(event) {}

  radioChange(event) {
    this.selectedEmployee = event.detail.value;
  }

  add() {
    if (this.selectedEmployee) {
      this.modalCtrl.dismiss({
        empRecord: this.selectedEmployee,
        dismissed: true,
      });
    }
  }
  dismiss() {
    this.modalCtrl.dismiss({
      dismissed: true
    });
    this.router.navigateByUrl('/recognition')
  }

  highlightSelected(index, employee) {
    this.selectedEmployeeIndex = index
    this.selectedEmployee = employee 
  }

  getEmployeesData() {
    this.global.presentLoading();
    this.httpGet
      .getMasterList('empFingerData?deptCode=' + this.dept + '&isPresent=true')
      .subscribe((res: any) => {
        this.global.loadingController.dismiss();
        this.empList = res.response;
        this.temp = [...this.empList];       
      },
        err => {
          this.global.loadingController.dismiss();
          console.error(err);
        })
  }

  updateFilter(event) {
    this.selectedEmployeeIndex = null
    const val = event.target.value.toString().toLowerCase();
    const temp = this.temp.filter(function (d) {
      return d.employeeName.toString().toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.empList = temp;
  }

}
