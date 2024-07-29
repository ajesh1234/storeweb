
import { UtilService } from './../../services/util.service';
import { Component } from '@angular/core';

import * as moment from 'moment';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { INavData } from '@coreui/angular';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent {
  public sidebarMinimized = false;
  public currentYear: any;
  public name: any;
  public navData: INavData[] = [];
  noticount: any;
  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router
  ) {
    this.currentYear = moment().format('YYYY');
    this.name = localStorage.getItem('name');
    setTimeout(() => {
      this.util.navItems.filter(x => x.name = this.util.translate(x.name));
      console.log('navparam', this.util.navItems);;
      this.navData = this.util.navItems;
    }, 2000);
  }
  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }

  ngOnInit() {
    setInterval(() => {
      this.notificationcount();
    }, 10000);
  }

  notificationcount() {
    const param = {
      id: localStorage.getItem('uid')
    };
    this.api.post_private('v1/orders/newstoreOrders',param).then((data) => {
      if (data && data.status && data.status == 200 && data.success) {
        this.noticount = data.data;
        if(this.noticount>0){
          let audio: HTMLAudioElement = new Audio('https://drive.google.com/uc?export=download&id=1M95VOpto1cQ4FQHzNBaLf0WFQglrtWi7');
          audio.play(); 
        }
      }
    }, error => {
      console.log(error);
    }).catch(error => {
      console.log(error);
    });
  }

  openDashboard() {
    //if(this.noticount > 0){
      if(this.router.url !== '/dashboard'){
        this.router.navigate(['dashboard']);
      }else{
        window.location.reload();
      }
    //}    
  }

  logout() {
    this.util.show();
    this.api.post_private('v1/auth/logout', {}).then((data) => {
      this.util.hide();
      console.log(data);
      localStorage.removeItem('uid');
      localStorage.removeItem('name');
      localStorage.removeItem('token');
      this.router.navigateByUrl('login');
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

  openSettings() {
    this.router.navigate(['app-settings']);
  }

  openProfile() {
    this.router.navigate(['app-profile']);
  }

  openPassword() {
    this.router.navigate(['app-password']);
  }

  updateStore(status) {
    Swal.fire({
      title: this.util.translate('Are you sure?'),
      text: this.util.translate('To update this store?'),
      icon: 'question',
      showConfirmButton: true,
      confirmButtonText: this.util.translate('Yes'),
      showCancelButton: true,
      cancelButtonText: this.util.translate('Cancel'),
      backdrop: false,
      background: 'white'
    }).then((data) => {
      if (data && data.value) {
        console.log('update it');
        const body = {
          id: localStorage.getItem('uid'),
          isClosed: status
        };
        this.util.show();
        this.api.post_private('v1/profile/updatestore', body).then((data: any) => {
          this.util.hide();
          console.log("+++++++++++++++", data);
          if (data && data.status && data.status === 200 && data.success) {
            this.util.success(this.util.translate('Status Updated !'));
            this.util.store.isClosed = status;
          }
        }, error => {
          this.util.hide();
          console.log('Error', error);
          this.util.apiErrorHandler(error);
        }).catch(error => {
          this.util.hide();
          console.log('Err', error);
          this.util.apiErrorHandler(error);
        });
      }
    });
  }
}
