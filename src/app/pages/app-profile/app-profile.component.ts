
import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-app-profile',
  templateUrl: './app-profile.component.html',
  styleUrls: ['./app-profile.component.scss']
})
export class AppProfileComponent implements OnInit {

  first_name: any;
  last_name: any;
  country_code: any;
  mobile: any;
  dob: any;
  id: any;

  constructor(
    public util: UtilService,
    public api: ApiService,
  ) {
    this.getData();
  }

  ngOnInit(): void {
  }

  getData() {
    this.util.show();
    const param = {
      id: localStorage.getItem('uid')
    }
    this.api.post_private('v1/profile/byId',param).then((data: any) => {
      this.util.hide();
      console.log(data);
      if (data && data.status == 200 && data.data && data.data) {
        this.id = data.data.id;
        const info = data.data;
        console.log(info);
        this.first_name = info.first_name;
        this.last_name = info.last_name;
        this.country_code = info.country_code;
        this.mobile = info.mobile;
        this.dob = info.dob;
        localStorage.setItem('name', this.first_name +' '+this.last_name);
      }
    }, error => {
      this.util.hide();
      console.log(error);
      this.util.apiErrorHandler(error);
    }).catch(error => {
      this.util.hide();
      console.log(error);
      this.util.apiErrorHandler(error);
    });
  }

  update() {
    if (this.first_name == '' || this.last_name == '' || this.country_code == '' || this.mobile == '' || this.dob == '') {
      this.util.error(this.util.translate('All fields are required'));
      return false;
    }
    const param = {
      id: this.id,
      first_name: this.first_name,
      last_name: this.last_name,
      country_code: this.country_code,
      mobile: this.mobile,
      dob: this.dob
    }
    console.log(param);

    this.util.show();
    this.api.post_private('v1/profile/update', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status == 200) {
        /*this.getData();
        window.location.reload();*/
        localStorage.setItem('name', this.first_name +' '+this.last_name);
        this.util.success(this.util.translate('Profile updated successfully'));
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
