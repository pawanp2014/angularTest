import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { NgClass } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AppointmentService } from "../../services/appointment/appointment.service";
import { UserService } from "../../services/user/user.service";
import { CommonModule } from '@angular/common';
import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { concat } from 'rxjs/internal/observable/concat';


@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['../patient.component.scss']
})
export class GeneralComponent implements OnInit {
  general: any;
  date: Date = new Date();
  fromdate: Date = new Date(this.date.getFullYear() - 25, this.date.getMonth() - 3, 1);
  maxdate: Date = new Date(this.date.getFullYear() - 20, this.date.getMonth() - 3, 1);
  generalForm: FormGroup;
  isSubmited: boolean = false;
  msgs: Message[];
  generalDetails: any;
  steps: Number;
  fnamePattern = "^[a-zA-Z_-]{1,30}$";
  lnamePattern = "^[a-zA-Z_-]{1,30}$";
  selectedLang: any = 'en';
  constructor(private fb: FormBuilder, private router: Router, private appointmentService: AppointmentService, private messageService: MessageService, private userService: UserService) {
    this.generalForm = this.fb.group({   // Signup form
      fname: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(this.fnamePattern)]],
      lname: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(this.lnamePattern)]],
      dob: [this.fromdate, [Validators.required]],
      phone: ['', [Validators.required]],
      heightft: ['', [Validators.required]],
      heightinch: ['', Validators.required],
      weight: ['', Validators.required],
      gender: ['Male', Validators.required]
    });
  }
  title = 'Comming Soon!';

  ngOnInit() {
    if (this.userService.isAuth()) { // checking Auth 
      var type = JSON.parse(localStorage.user_login).type
      if(type != "Patient"){
        this.userService.logout();
      }
    }
    this.steps = 1;
    this.general = 1;
    this.fetchAppointment();
    this.selectedLang = localStorage.currentLang ? localStorage.currentLang : 'en' // Getting selected language
/* Des: Local multilanguage  */
    if (this.selectedLang == 'en') {
      this.selectedLang = {
        dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      };
    }
    if (this.selectedLang == 'fr') {
      this.selectedLang = {
        dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        monthNames: ["janvier", "février", "Mars", "avril", "Mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
      };
    }

    this.getProfile();
  }

  /* 
   * Function: fetchAppointment
   * Des: Fetching Appointment
   */

  fetchAppointment() {
    var tab = 'general';
    this.appointmentService.fetchAppointment(tab).subscribe(res => {
      if (res.code === 200) {
        if(res.appointemtDetail.length>0){
        
        res = this.userService.decrypt(res.appointemtDetail);      
        this.steps = res.steps ? res.steps : 1;
        this.generalDetails = res.general
        if(this.generalDetails){
          this.generalForm.patchValue({
            fname: this.generalDetails.fname ? this.generalDetails.fname : '',
            lname: this.generalDetails.lname ? this.generalDetails.lname : '',
            dob: this.generalDetails.dob ? new Date(this.generalDetails.dob) : this.fromdate,
            phone: this.generalDetails.phone ? this.generalDetails.phone : '',
            heightft: this.generalDetails.heightft ? this.generalDetails.heightft : '',
            heightinch: this.generalDetails.heightinch ? this.generalDetails.heightinch : '0',
            weight: this.generalDetails.weight ? this.generalDetails.weight : '',
            gender: this.generalDetails.gender ? this.generalDetails.gender : ''
          })
        }
      }
      }
    })
  }


/* 
* Function: generalSubmit
* Des: Save General information to DB
*/
  generalSubmit() {
    if (this.generalForm.invalid) {
      this.isSubmited = true;
      return;
    }
    var encrypted=this.userService.encrypt(this.generalForm.value)
    var generalObj = {
      general: encrypted
    }
    ;
    this.appointmentService.appointmentUpdate(generalObj).subscribe(res => {
      if (res.code === 200) {
        this.router.navigate(['/ailment']);
      }
      else {
      }
    })
  }


  /* 
   * Function: getProfile
   * Des:Get profile details for user
   */

  getProfile() {
    this.userService.getProfile().subscribe(res => {
      if (res.code === 200) {
        var generalDetails = this.userService.decrypt(res.data);

        console.log('generalDetails',generalDetails);

        if(generalDetails){
          this.generalForm.patchValue({
            fname: generalDetails.fname ? generalDetails.fname : '',
            lname: generalDetails.lname ? generalDetails.lname : '',
            dob: generalDetails.dob ? new Date(generalDetails.dob) : this.fromdate,
            phone: generalDetails.phone ? generalDetails.phone : '',
            heightft: generalDetails.heightft ? generalDetails.heightft : '',
            heightinch: generalDetails.heightinch ? generalDetails.heightinch : '0',
            weight: generalDetails.weight ? generalDetails.weight : '',
            gender: generalDetails.gender ? generalDetails.gender : ''
          })
        }       
      }
    })
  }

}
