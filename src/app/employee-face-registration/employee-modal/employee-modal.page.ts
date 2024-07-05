import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';

@Component({
  selector: 'app-employee-modal',
  templateUrl: './employee-modal.page.html',
  styleUrls: ['./employee-modal.page.scss'],
})
export class EmployeeModalPage implements OnInit {

  @Input() dept: any;

  selectedEmployee: any;
  selectedEmployeeIndex: any;
  empList = [];
  temp = []
  empLoaded = false
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
      // this.appUtilService.employeeDetails = this.selectedEmployee
      // localStorage.setItem('paidVendor', this.selectedEmployee)
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
    this.router.navigateByUrl('/registeremp')
  }

  highlightSelected(index, employee) {
    this.selectedEmployeeIndex = index
    this.selectedEmployee = employee 
  }

  getEmployeesData() {
    this.empLoaded = true
    this.httpGet
      .getMasterList('empFingerData?deptCode=' + this.dept + '&isPresent=false')
      .subscribe((res: any) => {
        this.empList = res.response;
        this.temp = [...this.empList];
        this.empLoaded = false
      },
        err => {
          this.empLoaded = false
          console.error(err);
        })
  }

  updateFilter(event) {
    this.selectedEmployeeIndex = null
    const val = event.target.value.toString().toLowerCase();
    const temp = this.temp.filter(function (d) {
      return d.employeeName.toString().toLowerCase().indexOf(val) !== -1 || d.employeeCode.toLowerCase().indexOf(val) !== -1 || !val;;
    });
    this.empList = temp;
  }


}
