import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
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
    console.log(this.selectedEmployee);
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
    this.router.navigateByUrl('/recognition')
  }

  highlightSelected(index, employee) {
    this.selectedEmployeeIndex = index
    this.selectedEmployee = employee
  
    // console.log(this.selectedCustomerIndex, this.selectedCustomer);
  
  }

  getEmployeesData() {
    this.httpGet
      .getMasterList('empFingerData?deptCode=' + this.dept)
      .subscribe((res: any) => {
        this.empList = res.response;
        this.temp = [...this.empList];
        console.log('empList', this.empList);
        
      },
        err => {
          console.error(err);
        })
  }

  updateFilter(event) {
    this.selectedEmployeeIndex = null
    const val = event.target.value.toString().toLowerCase();
    console.log(val);
    const temp = this.temp.filter(function (d) {
      return d.employeeName.toString().toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.empList = temp;
  }

}
