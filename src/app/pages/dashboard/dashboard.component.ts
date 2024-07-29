
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import * as moment from 'moment';
import { ApiService } from '../../services/api.service';
import { UtilService } from '../../services/util.service';
import Swal from 'sweetalert2';
@Component({
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  newOrders: any[] = [];
  onGoingOrders: any[] = [];
  onPickOrders: any[] = [];
  oldOrders: any[] = [];
  dummy = Array(5);
  olders: any[] = [];
  order: any = 0;
  reviews: any = 0;
  products: any = 0;
  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router
  ) {
    this.getHome();
    this.getUserByID();
  }

  ngOnInit() {

  }

  openPage(url) {
    this.router.navigate([url]);
  }

  getHome() {
    const param = {
      id: localStorage.getItem('uid')
    };
    this.api.post_private('v1/home/getStoreDashboard', param).then((data: any) => {
      console.log('by store id', data);
      if (data && data.status && data.status == 200) {
        this.order = data.data.orders;
        this.reviews = data.data.reviews;
        this.products = data.data.products;
        this.getOrders();
      }
    }, error => {
      console.log(error);
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.util.apiErrorHandler(error);
    });
  }

  getOrders() {
    const param = {
      id: localStorage.getItem('uid'),
      limit: 5000000
    };

    this.api.post_private('v1/orders/getByStoreForApps', param).then((data: any) => {
      console.log('by store id', data);
      this.dummy = [];
      this.newOrders = [];
      this.onGoingOrders = [];
      this.onPickOrders = [];
      this.oldOrders = [];
      this.olders = [];
      if (data && data.status && data.status == 200 && data.data.length > 0) {
        data.data.forEach(async (element, index) => {
          if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.orders)) {
            element.orders = JSON.parse(element.orders);
            element.date_time = moment(element.date_time).format('dddd, MMMM Do YYYY');
            element.orders = await element.orders.filter(x => x.store_id == localStorage.getItem('uid'));
            if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.status)) {
              const info = JSON.parse(element.status);
              const selected = info.filter(x => x.id == localStorage.getItem('uid'));
              if (selected && selected.length) {
                element.orders.forEach(order => {
                  if (order.variations && order.variations !== '' && typeof order.variations == 'string') {
                    console.log('strings', element.id);
                    order.variations = JSON.parse(order.variations);
                    console.log(order['variant']);
                    if (order["variant"] == undefined) {
                      order['variant'] = 0;
                    }
                  }
                });

                const status = selected[0].status;
                element['storeStatus'] = status;
                if (status == 'created') {
                  this.newOrders.push(element);
                } else if (element.order_to=='home' && (status == 'accepted' || status == 'picked' || status == 'ongoing')) {
                  this.onGoingOrders.push(element);
                } /*else if (element.order_to=='store' && (status == 'accepted' || status == 'picked' || status == 'ongoing')) {
                  this.onPickOrders.push(element);
                }*/ else if (status == 'rejected' || status == 'cancelled' || status == 'delivered' || status == 'refund') {
                  this.olders.push(element);
                }
              }
            }
          }
        });
      }
    }, error => {
      console.log(error);
      this.dummy = [];
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.dummy = [];
      this.util.apiErrorHandler(error);
    });
  }

  goToOrder(item) {
    console.log(item);
    const navData: NavigationExtras = {
      queryParams: {
        id: item.id
      }
    };
    this.router.navigate(['/order-detail'], navData);
  }

  getUserByID() {
    const body = {
      id: localStorage.getItem('uid')
    }
    this.api.post_private('v1/profile/getStoreFromId', body).then((data: any) => {
      console.log(">>>>><<<<<", data);
      if (data && data.success && data.status === 200) {
        this.util.userInfo = data.data;
        localStorage.setItem('name', data.data.first_name +' '+data.data.last_name);
        this.util.store = data.store;
      } else {
        localStorage.removeItem('uid');
        localStorage.removeItem('token');
      }
    }, err => {
      localStorage.removeItem('uid');
      localStorage.removeItem('token');
      this.util.userInfo = null;
      console.log(err);
    }).catch((err) => {
      localStorage.removeItem('uid');
      localStorage.removeItem('token');
      this.util.userInfo = null;
      console.log(err);
    });
  }

  pickdrop() {
    const format = 'H:mm:ss';
    const ctime = moment().format('HH:mm:ss');
    const time = moment(ctime, format);
    const beforeTime = moment(this.util.general.openTime, format);
    const afterTime = moment(this.util.general.closeTime, format);

    if (time.isBetween(beforeTime, afterTime)) {
      Swal.fire({
        title: this.util.translate('Are you sure?'),
        text: this.util.translate('You want to create a drop request?'),
        icon: 'question',
        confirmButtonText: this.util.translate('Yes'),
        cancelButtonText: this.util.translate('Cancel'),
        showCancelButton: true,
        backdrop: false,
        background: 'white'
      }).then((data) => {
        console.log(data);
        if (data && data.value) {
          const orderStatus = [];
          const info = {
              id: 1,
              status: 'created'
            }
          orderStatus.push(info)
          const notes = [
            {
              status: 1,
              value: 'Order Created',
              time: moment().format('lll'),
            }
          ];

          const otherdetails = [
            {
              pickupAddress: this.util.store.name +','+this.util.store.address+','+this.util.store.zipcode,
              pickupLat: this.util.store.lat,
              pickupLng: this.util.store.lng,
              distance: '',
              destinationAddress: '',
              destinationLat: '',
              destinationLng: '',
              duration: '',
              rname: '',
              rmobile: '',
              comment: ''
            }
          ];
          const param = {
            uid: localStorage.getItem('uid'),
            cid: this.util.store.cid,
            date_time: moment().format('YYYY-MM-DD HH:mm:ss'),
            paid_method: 'cod',
            orders: JSON.stringify(otherdetails),
            notes: JSON.stringify(notes),
            driver_id: '',
            total: 0,
            tax: 0,
            grand_total: 0,
            delivery_charge: 0,
            coupon_code: '',
            discount: 0,
            pay_key: 'cod',
            status: JSON.stringify(orderStatus),
            assignee: '',
            extra: '',
            payStatus: 1,
            wallet_used: 0,
            wallet_price: 0
          }
          console.log(param);
          this.util.show();
          this.api.post_private('v1/pickorders/create', param).then((data: any) => {
            console.log(data);
            this.util.hide();
            if (data && data.status && data.status === 200 && data.data && data.data.id) {
              this.util.success(this.util.translate('Your order request has been sent successfully'));
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
      });
    }else{
      this.util.success(this.util.translate('Sorry, service available between '+ this.getTime(beforeTime) +' to '+ this.getTime(afterTime)));
    }
  }

  getTime(time) {
    return moment(time, ['h:mm A']).format('hh:mm A');
  }
}
