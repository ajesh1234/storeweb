
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService } from '../../services/api.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-app-password',
  templateUrl: './app-password.component.html',
  styleUrls: ['./app-password.component.scss']
})
export class AppPasswordComponent implements OnInit {
  @ViewChild('largeModal') public largeModal: ModalDirective;


  oldPassword: any = '';
  newPassword: any = '';
  confirmPassword: any = '';

  id: any;
  haveData: boolean = false;
  
  constructor(
    public util: UtilService,
    public api: ApiService,
  ) {

  }

  ngOnInit(): void {
  }

  createSettings() {

    if (this.oldPassword == '' || this.newPassword == null || this.confirmPassword == '') {
      this.util.error(this.util.translate('All fields are required'));
      return false;
    }
    if (this.newPassword != this.confirmPassword) {
      this.util.error(this.util.translate('New and confirm password not matching'));
      return false;
    }
    this.update();
  }

  update() {
    const param = {
      current_password: this.oldPassword,
      new_password: this.newPassword,
      id: localStorage.getItem('uid')
    }

    this.util.show();
    this.api.post_private('v1/profile/upassword', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status == 200) {
        this.util.success(this.util.translate('Password has been changed successfully'));
        window.location.reload();
      }

    }, error => {
      console.log(error);
      this.util.hide();
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.util.hide();
      this.util.apiErrorHandler(error);
    });
  }

}