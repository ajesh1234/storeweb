
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ApiService } from '../../services/api.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  stores: any[] = [];
  storeId: any;
  storecommission: any;
  from: any;
  to: any;
  allOrders: any[] = [];
  storeOrder: any[] = [];
  totalAmount: any = 0;
  commisionAmount: any = 0;
  toPay: any = 0;
  apiCalled: boolean;
  storename: any;

  totalAmountsFromOrder: any = 0;
  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.storeId = parseInt(localStorage.getItem('uid'));
  }

  ngOnInit(): void {
  }

  getStats() {
    console.log('from', this.from);
    console.log('to', this.to);
    if (this.from && this.to) {

      console.log('ok');
      const param = {
        id: localStorage.getItem('uid'),
        from: moment(this.from, 'YYYY-MM-DD HH:mm A').utcOffset("+05:30").format('YYYY-MM-DD HH:mm'),
        to: moment(this.to, 'YYYY-MM-DD HH:mm A').utcOffset("+05:30").format('YYYY-MM-DD 23:59'),
      };
      console.log(param);
      this.util.show();
      this.apiCalled = false;
      this.storeOrder = [];
      this.api.post_private('v1/orders/getStoreStatsDataWithDates', param).then((data: any) => {
        this.apiCalled = true;
        this.util.hide();
        console.log(data);
        if (data && data.status == 200 && data.data.length) {
          this.storecommission = data.commission.commission;
          console.log('commustion', this.storecommission);
          let total = 0;
          data.data.forEach(async (element) => {
            if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.orders)) {
              element.orders = JSON.parse(element.orders);
              element.date_time = moment(element.date_time).format('dddd, MMMM Do YYYY');
              element.orders = await element.orders.filter(x => x.store_id == this.storeId);
              console.log(element.discount);
              if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.status)) {
                const info = JSON.parse(element.status);

                const selected = await info.filter(x => x.id == this.storeId);
                if (selected && selected.length) {
                  if (selected[0].status == 'delivered') {
                    /*await element.orders.forEach(calc => {
                      if (calc.variations && calc.variations !== '' && typeof calc.variations == 'string') {
                        calc.variations = JSON.parse(calc.variations);
                        console.log(calc['variant']);
                        if (calc["variant"] == undefined) {
                          calc['variant'] = 0;
                        }
                      }
                      if (calc && calc.discount == 0) {
                        if (calc.size == 1 || calc.size == 1) {
                          if (calc.variations[0].items[calc.variant].discount && calc.variations[0].items[calc.variant].discount !== 0) {
                            total = total + (parseFloat(calc.variations[0].items[calc.variant].discount) * calc.quantiy);
                          } else {
                            total = total + (parseFloat(calc.variations[0].items[calc.variant].price) * calc.quantiy);
                          }
                        } else {
                          total = total + (parseFloat(calc.original_price) * calc.quantiy);
                        }
                      } else {
                        if (calc.size == 1 || calc.size == 1) {
                          if (calc.variations[0].items[calc.variant].discount && calc.variations[0].items[calc.variant].discount !== 0) {
                            total = total + (parseFloat(calc.variations[0].items[calc.variant].discount) * calc.quantiy);
                          } else {
                            total = total + (parseFloat(calc.variations[0].items[calc.variant].price) * calc.quantiy);
                          }
                        } else {
                          total = total + (parseFloat(calc.sell_price) * calc.quantiy);
                        }
                      }
                    });*/
                    total = total + (element.total - element.discount);
                    this.storeOrder.push(element);
                  }
                }
              }
            }
          });

          setTimeout(() => {
            function percentage(num, per) {
              return (num / 100) * per;
            }
            console.log(this.storeOrder);
            console.log(total, this.storecommission);
            const totalPrice = percentage(total, parseFloat(this.storecommission));
            console.log('commistion====>>>>>', totalPrice.toFixed(2));
            this.commisionAmount = totalPrice.toFixed(2);
            this.totalAmount = total;
            this.toPay = this.commisionAmount;
          }, 1000);

        }
      }, error => {
        this.util.hide();
        console.log(error);
        this.apiCalled = true;
        this.util.error(this.util.translate('Something went wrong'));
      }).catch((error) => {
        this.util.hide();
        console.log(error);
        this.apiCalled = true;
        this.util.error(this.util.translate('Something went wrong'));
      });
    } else {
      console.log('not valid');
      this.util.error(this.util.translate('All Fields are required'));
      return false;
    }
  }

  getCommisions(total) {
    return ((parseFloat(total) * this.storecommission) / 100).toFixed(2);
  }

  donwloadPDF() {

  }
  today() {
    return moment().format('ll');
  }
  getDate(date) {
    return moment(date).format('ll');
  }
  getName() {
    return this.storeOrder[0].name + '_' + moment(this.from).format('DDMMYYYY') + '_' + moment(this.to).format('DDMMYYYY');
  }

}
