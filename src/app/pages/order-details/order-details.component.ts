
import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService } from '../../services/api.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  @ViewChild('myModal') public myModal: ModalDirective;
  id: any;
  loaded: boolean;
  orderDetail: any[] = [];
  orders: any[] = [];
  payMethod: any;
  status: any;
  datetime: any;
  orderAt: any;
  orderInst: any;
  address: any;
  userInfo: any;
  driverInfo: any[] = [];
  changeStatusOrder: any;
  drivers: any[] = [];
  dummyDrivers: any[] = [];
  userLat: any;
  userLng: any;
  driverId: any;
  assignee: any[] = [];
  assigneeDriver: any;

  orderStatus: any[] = [];
  statusText: any = '';
  grandTotal: any;
  tax: any;
  interval: any;

  // deliveryCharge: any = 0;
  orderTax: any = 0;

  totalStores: any = 0;
  orderTotal: any = 0;
  orderTotalqty: any = 0;
  orderDiscount: any = 0;
  orderDeliveryCharge: any = 0;
  orderServiceCharge: any = 0;
  orderWalletDiscount: any = 0;
  orderTaxCharge: any = 0;
  orderGrandTotal: any = 0;

  selected_driver: any = '';
  constructor(
    private route: ActivatedRoute,
    private navCtrl: Location,
    public util: UtilService,
    public api: ApiService,
  ) {
    this.route.queryParams.subscribe((data) => {
      console.log(data);
      if (data && data.id) {
        this.id = data.id;
        this.loaded = false;
        this.getOrder();
        console.log('store=-========---=-=0-=-=-=-', this.util.store);
        if (this.util.store && this.util.store.name) {
          this.statusText = ' by ' + this.util.store.name;
        }
      } else {
        this.navCtrl.back();
      }
    });
  }

  degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    console.log(lat1, lon1, lat2, lon2);
    const earthRadiusKm = 6371;
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    lat1 = this.degreesToRadians(lat1);
    lat2 = this.degreesToRadians(lat2);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  getDrivers() {
    if (this.util.store && this.util.store.cid) {
      const param = {
        id: this.util.store.cid
      };

      this.api.post_private('v1/drivers/geyByCity', param).then((data: any) => {
        console.log('driver data--------------->>', data);
        this.dummyDrivers = [];
        if (data && data.status == 200 && data.data.length) {
          const info = data.data;
          info.forEach(async (element) => {
            const distance = await this.distanceInKmBetweenEarthCoordinates(
              this.userLat,
              this.userLng,
              parseFloat(element.lat),
              parseFloat(element.lng));

            element['distanceFrom'] = parseFloat(distance.toFixed(2));
            this.dummyDrivers.push(element);
            this.dummyDrivers = this.dummyDrivers.sort((a, b) => a.distanceFrom - b.distanceFrom);

          });
          //console.log('distace', this.dummyDrivers);
          //console.log('sort distace', this.dummyDrivers);
        }
      }, error => {
        console.log(error);
        this.util.apiErrorHandler(error);
      });
    }
  }

  getOrder() {
    const param = {
      id: this.id
    };
    this.api.post_private('v1/orders/getByIdFromStore', param).then((data: any) => {
      console.log(data);
      this.loaded = true;
      if (data && data.status && data.status == 200 && data.data) {
        const info = data.data;
        console.log(info);
        this.orderDetail = JSON.parse(info.notes);
        const order = JSON.parse(info.orders);
        console.log(order);
        const ids = [...new Set(order.map(item => item.store_id))];
        this.totalStores = ids.length;
        this.orders = order.filter(x => x.store_id == localStorage.getItem('uid'));
        this.orderTaxCharge = info.tax;
        console.log('orde->>>', this.orders);
        let total = 0;
        let totalqty = 0;
        this.orders.forEach((element) => {
          let price = 0;
          if (element.variations && element.variations !== '' && typeof element.variations == 'string') {
            console.log('strings', element.id);
            element.variations = JSON.parse(element.variations);
            console.log(element['variant']);
            if (element["variant"] == undefined) {
              element['variant'] = 0;
            }
          }
          if (element && element.discount == 0) {
            if (element.size == 1) {
              if (element.variations[0].items[element.variant].discount && element.variations[0].items[element.variant].discount !== 0) {
                price = price + (parseFloat(element.variations[0].items[element.variant].discount) * element.quantiy);
              } else {
                price = price + (parseFloat(element.variations[0].items[element.variant].price) * element.quantiy);
              }
            } else {
              price = price + (parseFloat(element.original_price) * element.quantiy);
            }
          } else {
            if (element.size == 1) {
              if (element.variations[0].items[element.variant].discount && element.variations[0].items[element.variant].discount !== 0) {
                price = price + (parseFloat(element.variations[0].items[element.variant].discount) * element.quantiy);
              } else {
                price = price + (parseFloat(element.variations[0].items[element.variant].price) * element.quantiy);
              }
            } else {
              price = price + (parseFloat(element.sell_price) * element.quantiy);
            }
          }
          console.log('PRICEEE-->', price);

          console.log(total, price);
          total = total + price;
          totalqty = totalqty + element.quantiy;
        });
        console.log('==>', total);
        this.orderTotal = total;
        this.orderTotalqty = totalqty;
        this.grandTotal = total.toFixed(2);
        const storesStatus = JSON.parse(info.status);
        console.log('------------------', storesStatus);
        this.orderStatus = storesStatus;
        const current = storesStatus.filter(x => x.id == localStorage.getItem('uid'));
        console.log('*************************', current);
        if (current && current.length) {
          this.status = current[0].status;
        }
        this.datetime = moment(info.date_time).format('dddd, MMMM Do YYYY');
        this.payMethod = info.paid_method == 'cod' ? 'COD' : 'PAID';
        this.orderAt = info.order_to;
        this.orderInst = info.order_inst;
        this.tax = info.tax;
        this.driverId = info.driver_id;
        if (this.driverId && this.driverId !== null) {
          console.log('driverInfo',data.driverInfo);
          this.driverInfo = data.driverInfo;
        }
        if (info.discount > 0) {
          this.orderDiscount = (info.discount / this.totalStores).toFixed(2);
        }
        if (info.wallet_used == 1) {
          this.orderWalletDiscount = (info.wallet_price / this.totalStores).toFixed(2);
        }
        console.log('wallet discount', this.orderWalletDiscount);
        
        this.userInfo = data.user;

        if (this.orderAt == 'home') {
          const address = JSON.parse(info.address);
          console.log('---address', address);
          if (address && address.address) {
            this.userLat = address.lat;
            this.userLng = address.lng;
            this.address = address.landmark + ' ' + address.house + ' ' + address.address + ' ' + address.pincode;
            if(this.status=='created'){
              this.getDrivers();

              this.interval = setInterval(() => {
                console.log('calling in interval');
                this.getDrivers();
              }, 20000);  
            }            

          }
          if (info.assignee && info.assignee !== '') {
            const assignee = JSON.parse(info.assignee);
            this.assignee = assignee;
            const driver = this.assignee.filter(x => x.assignee == localStorage.getItem('uid'));
            console.log('-------------', driver);
            if (driver && driver.length) {
              this.driverId = driver[0].driver;
              console.log('driverid=============', this.driverId);
            }
          }
          if (info.driver_id && info.driver_id !== '') {
            this.assigneeDriver = info.driver_id;
          }
        }
        this.orderDeliveryCharge = info.delivery_charge;
        this.orderServiceCharge = info.service_charge;
        console.log('total stores', this.totalStores);
        console.log('order total', this.orderTotal);
        console.log('order discount', this.orderDiscount);
        console.log('order delivery charge', this.orderDeliveryCharge);
        console.log('order wallet', this.orderWalletDiscount);
        console.log('order tax', this.orderTaxCharge);
        console.log('order grandtotoal', this.orderGrandTotal);
        // totalStores: any = 0;
        // orderTotal: any = 0;
        // orderDiscount: any = 0;
        // orderDeliveryCharge: any = 0;
        // orderWalletDiscount: any = 0;
        // orderTaxCharge: any = 0;
        // orderGrandTotal: any = 0;
      } else {
        this.util.apiErrorHandler(data);
      }
    }, error => {
      console.log(error);
      this.loaded = true;
      this.util.apiErrorHandler(error);
    });
  }

  ngOnInit() {
  }

  back() {
    this.navCtrl.back();
  }

  call() {
    if (this.userInfo.mobile) {
      window.open('tel:' + this.userInfo.mobile, '_system')

    } else {
      this.util.error(this.util.translate('Number not found'));
    }
  }

  email() {
    if (this.userInfo.email) {
      window.open('mailto:' + this.userInfo.email, '_system')
    } else {
      this.util.error(this.util.translate('Email not found'));
    }
  }

  printOrder() {
    // const options: InAppBrowserOptions = {
    //   location: 'no',
    //   clearcache: 'yes',
    //   zoom: 'yes',
    //   toolbar: 'yes',
    //   closebuttoncaption: 'close'
    // };
    // const browser: any = window.open(this.api.baseUrl + 'v1/orders/printStoreInvoice?id=' + this.id + '&token=' + localStorage.getItem('token') + '&storeId=' + localStorage.getItem('uid'), '_system', options);
    // browser.on('loadstop').subscribe(event => {
    //   const navUrl = event.url;
    //   console.log('navURL', navUrl);
    // });
    window.open(this.api.baseUrl + 'v1/orders/printStoreInvoice?id=' + this.id + '&token=' + localStorage.getItem('token') + '&storeId=' + localStorage.getItem('uid'), '_system');
  }

  selectDriver(item) {
    console.log(item);
    this.selected_driver = item.id;
  }

  saveDriver() {
    console.log('driver id', this.selected_driver);
    if (this.selected_driver && this.selected_driver != '' && this.selected_driver != null) {
      this.drivers = this.dummyDrivers.filter(x => x.id == this.selected_driver);
      console.log('-->>', this.drivers);

      if (this.drivers && this.drivers.length) {
        this.myModal.hide();
        const newOrderNotes = {
          status: 1,
          value: 'Order ' + 'accepted' + this.statusText,
          time: moment().format('lll'),
        };
        this.orderDetail.push(newOrderNotes);

        this.util.show();
        this.assignee = [];
        const assignee = {
          driver: this.drivers[0].id,
          assignee: localStorage.getItem('uid')
        };
        this.assignee.push(assignee);
        const param = {
          id: this.id,
          notes: JSON.stringify(this.orderDetail),
          status: JSON.stringify(this.orderStatus),
          driver_id: this.drivers[0].id,
          assignee: JSON.stringify(this.assignee),
          order_status: 'accepted'
        };
        console.log('========================', param);
        this.api.post_private('v1/orders/updateStatusStore', param).then((data: any) => {
          console.log('order', data);
          this.util.hide();
          this.updateDriver(this.drivers[0].id, 'busy');
          if (data && data.status == 200) {
            this.sendNotification('accepted');
            this.back();
          } else {
            this.util.apiErrorHandler(data);
          }
        }, error => {
          console.log(error);
          this.util.hide();
          this.util.apiErrorHandler(error);
        });
      }

    } else {
      this.util.error('Please select driver');
    }
  }

  async presentModal() {
    console.log('open modal');
    this.myModal.show();

  }

  getTotalBilling() {
    const total = parseFloat(this.orderTotal) + parseFloat(this.orderTaxCharge);
    const discount = parseFloat(this.orderDiscount);
    const grandtotal = total - discount > 0 ? total - discount : 0;
    return Math.round(grandtotal).toFixed(2);
  }

  updateDriver(uid, value) {
    const param = {
      id: uid,
      current: value
    };
    console.log('param', param);
    this.api.post_private('v1/drivers/edit_profile', param).then((data: any) => {
      console.log(data);
    }, error => {
      console.log(error);
    });
  }

  updateStatus(value) {
    if(value=='rejected'){
      const newOrderNotes = {
        status: 1,
        value: 'Order ' + this.util.translate(value) + ' due to not in stock ' + this.statusText,
        time: moment().format('lll'),
      };
      this.orderDetail.push(newOrderNotes);
    }else{
      const newOrderNotes = {
        status: 1,
        value: 'Order ' + this.util.translate(value) + this.statusText,
        time: moment().format('lll'),
      };
      this.orderDetail.push(newOrderNotes);
    }
    
    

    this.util.show();
    const param = {
      id: this.id,
      notes: JSON.stringify(this.orderDetail),
      status: JSON.stringify(this.orderStatus),
      order_status: value
    };
    this.api.post_private('v1/orders/updateStatusStore', param).then((data: any) => {
      console.log('order', data);
      this.util.hide();
      if (data && data.status == 200) {
        this.sendNotification(value);
        this.back();
      } else {
        this.util.apiErrorHandler(data);
      }
    }, error => {
      console.log(error);
      this.util.hide();
      this.util.apiErrorHandler(error);
    });
  }

  autoAssign() {
    this.drivers = this.dummyDrivers;
    if (this.drivers && this.drivers.length) {
      const newOrderNotes = {
        status: 1,
        value: 'Order ' + 'accepted' + this.statusText,
        time: moment().format('lll'),
      };
      this.orderDetail.push(newOrderNotes);

      this.util.show();
      const assignee = {
        driver: this.drivers[0].id,
        assignee: localStorage.getItem('uid')
      };
      this.assignee.push(assignee);
      console.log('*********************************', this.assignee);
      this.assigneeDriver.push(this.drivers[0].id);
      console.log('////////////////////////////', this.assigneeDriver);
      const param = {
        id: this.id,
        notes: JSON.stringify(this.orderDetail),
        status: JSON.stringify(this.orderStatus),
        driver_id: this.assigneeDriver.join(),
        assignee: JSON.stringify(this.assignee),
        order_status: 'accepted'
      };
      console.log('========================', param);
      this.api.post_private('v1/orders/updateStatusStore', param).then((data: any) => {
        console.log('order', data);
        this.util.hide();
        this.updateDriver(this.drivers[0].id, 'busy');
        if (data && data.status == 200) {
          this.sendNotification('accepted');
          this.sendDriverNotification('assigned');
          this.back();
        } else {
          this.util.apiErrorHandler(data);
        }
      }, error => {
        console.log(error);
        this.util.hide();
        this.util.apiErrorHandler(error);
      });
    }else{
      this.util.error(this.util.translate('No Driver available'));
    }
  }

  changeStatus(value) {
    console.log(value);

    this.orderStatus.forEach(element => {
      if (element.id == localStorage.getItem('uid')) {
        element.status = value;
      }
    });
    console.log(this.orderDetail);
    if (value == 'accepted' && this.orderAt == 'home') {
      if (this.util.driver_assign == 0) {
        this.presentModal();
      } else {
        this.autoAssign();
      }
    } else if (value == 'accepted' && this.orderAt !== 'home') {
      this.util.show();
      const newOrderNotes = {
        status: 1,
        value: 'Order ' + this.util.translate(value) + this.statusText,
        time: moment().format('lll'),
      };
      this.orderDetail.push(newOrderNotes);
      const param = {
        id: this.id,
        notes: JSON.stringify(this.orderDetail),
        status: JSON.stringify(this.orderStatus),
        order_status: value
      };
      this.api.post_private('v1/orders/updateStatusStore', param).then((data: any) => {
        console.log('order', data);
        this.util.hide();
        if (data && data.status == 200) {
          this.sendNotification('accepted');
          this.back();
        } else {
          this.util.apiErrorHandler(data);
        }
      }, error => {
        console.log(error);
        this.util.hide();
        this.util.apiErrorHandler(error);
      });
    } else {
      this.updateStatus(value);
    }

    // this.api
  }

  sendNotification(value) {
    if (this.userInfo && this.userInfo.fcm_token) {
      const param = {
        title: 'Order ' + this.util.translate(value),
        message: 'Your order #' + this.id + ' ' + this.util.translate(value),
        id: this.userInfo.fcm_token
      };
      this.api.post_private('v1/notification/sendNotification', param).then((data: any) => {
        console.log(data);
      }, error => {
        console.log(error);
      }).catch(error => {
        console.log(error);
      });
    }
  }

  sendDriverNotification(value) {
    if (this.drivers && this.drivers[0].fcm_token) {
      const param = {
        title: 'Order ' + this.util.translate(value),
        message: 'Order #' + this.id + ' ' + this.util.translate(value),
        id: this.drivers[0].fcm_token
      };
      this.api.post_private('v1/notification/sendNotification', param).then((data: any) => {
        console.log(data);
      }, error => {
        console.log(error);
      }).catch(error => {
        console.log(error);
      });
    }
  }

  changeOrderStatus() {
    console.log(this.changeStatusOrder);
    console.log(this.orderDetail);
    if (this.changeStatusOrder) {
      this.orderStatus.forEach(element => {
        if (element.id == localStorage.getItem('uid')) {
          element.status = this.changeStatusOrder;
        }
      });
      if (this.changeStatusOrder !== 'ongoing' && this.orderAt == 'home' && this.driverId !== 0) {
        // release driver from this order
        console.log('relase driver');

        const newOrderNotes = {
          status: 1,
          value: 'Order ' + this.util.translate(this.changeStatusOrder) + this.statusText,
          time: moment().format('lll'),
        };
        this.orderDetail.push(newOrderNotes);

        this.util.show();
        const param = {
          id: this.id,
          notes: JSON.stringify(this.orderDetail),
          status: JSON.stringify(this.orderStatus),
          order_status: this.changeStatusOrder,
          type: 'store'
        };
        this.api.post_private('v1/orders/updateStatusStore', param).then((data: any) => {
          console.log('order', data);
          this.util.hide();
          this.updateDriver(this.driverId, 'active');
          if (data && data.status == 200) {
            this.sendNotification(this.changeStatusOrder);
            this.back();
          } else {
            this.util.apiErrorHandler(data);
          }
        }, error => {
          console.log(error);
          this.util.hide();
          this.util.apiErrorHandler(error);
        });
      } else {
        const newOrderNotes = {
          status: 1,
          value: 'Order ' + this.util.translate(this.changeStatusOrder) + this.statusText,
          time: moment().format('lll'),
        };
        this.orderDetail.push(newOrderNotes);

        this.util.show();
        const param = {
          id: this.id,
          notes: JSON.stringify(this.orderDetail),
          status: JSON.stringify(this.orderStatus),
          order_status: this.changeStatusOrder
        };
        this.api.post_private('v1/orders/updateStatusStore', param).then((data: any) => {
          console.log('order', data);
          this.util.hide();
          if (data && data.status == 200) {
            this.sendNotification(this.changeStatusOrder);
            this.back();
          } else {
            this.util.apiErrorHandler(data);
          }
        }, error => {
          console.log(error);
          this.util.hide();
          this.util.apiErrorHandler(error);
        });
      }

    }
  }

}
