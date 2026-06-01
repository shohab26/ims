import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { ProductService } from '../../services/product.service';
import { Customer, Delivery, Order, Product, Status, Vendor } from '../../model/inventory.model';

@Component({
  selector: 'app-main-wrapper',
  templateUrl: './main-wrapper.component.html',
  styleUrl: './main-wrapper.component.css'
})
export class MainWrapperComponent implements OnInit {

  order: Order[] = []
  delivery: Delivery[] = []
  vendor: Vendor[] = []
  customer: Customer[] = []
  product: Product[] = []
  status: Status[] = []

  totalSaleOrder: any;
  totalSaleDelivery: any;
  revenue: any;

  // ── Bar chart: Purchase vs Sales ──
  barChartData: ChartData<'bar'> = {
    labels: ['Total Purchase', 'Total Sales'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['rgba(15,52,96,0.85)', 'rgba(5,150,105,0.85)'],
      borderRadius: 6,
      borderSkipped: false
    }]
  };
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
  };

  // ── Doughnut chart: Orders vs Deliveries ──
  doughnutData: ChartData<'doughnut'> = {
    labels: ['Orders', 'Deliveries'],
    datasets: [{ data: [0, 0], backgroundColor: ['#0f3460', '#e94560'], hoverOffset: 6 }]
  };
  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
    cutout: '70%'
  };

  constructor(private service: ProductService) { }
  ngOnInit(): void {
    this.loadOrder();
    this.loadProduct();
    this.loadVendor();
    this.loadStatus();
    this.loadDelivery();
    this.loadCustomer();
    this.gettotalSaleOrder();
    this.gettotalSaleDelivery();
    
  }

  loadOrder() {
    this.service.findLatestOrder().subscribe({
      next: res => {
        this.order = res;
        this.updateDoughnut();
      },
      error: err => { console.log(err); }
    })
  }
  loadDelivery() {
    this.service.findLatestDelivery().subscribe({
      next: res => {
        this.delivery = res;
        this.updateDoughnut();
      },
      error: err => { console.log(err); }
    })
  }

  updateDoughnut() {
    this.doughnutData = {
      ...this.doughnutData,
      datasets: [{ ...this.doughnutData.datasets[0], data: [this.order.length, this.delivery.length] }]
    };
  }

  // all product
  loadProduct() {
    this.service.findAllProduct(1, 100).subscribe({
      next: res => {
        this.product = res.data;
      },
      error: err => {
        console.log(err);
      }
    })
  }

  // all status
  loadStatus() {
    this.service.findAllStatus(1, 100).subscribe({
      next: res => {
        this.status = res.data;
      },
      error: err => {
        console.log(err);
      }
    })
  }

  //all vendor
  loadVendor() {
    this.service.findAllVendor(1, 100).subscribe({
      next: res => {
        this.vendor = res.data;
      },
      error: err => {
        console.log(err);
      }
    })
  }
  //all customer
  loadCustomer() {
    this.service.findAllCustomer(1, 100).subscribe({
      next: res => {
        this.customer = res.data;
      },
      error: err => {
        console.log(err);
      }
    })
  }



  //filter for product name
  filterProductData(dataid: any): any {

    let productcode: Product[] = this.product.filter(pro => pro.id == dataid);

    let dataValue = productcode;
    // console.log("product code",dataValue[0].pcode)
    return dataValue[0].pcode;

  }
  filterVendorData(dataid: any): any {

    let vendor: Vendor[] = this.vendor.filter(pro => pro.id == dataid);

    let dataValue = vendor;
    // console.log("Vendor",dataValue[0].company)
    return dataValue[0].company;

  }
  filterCustomerData(dataid: any): any {

    let cust: Customer[] = this.customer.filter(pro => pro.id == dataid);

    let dataValue = cust;
    // console.log("Vendor",dataValue[0].company)
    return dataValue[0].customer_name;

  }
  //filter status
  filterStatusData(dataid: any): any {

    let status: Status[] = this.status.filter(pro => pro.id == dataid);

    let dataValue = status;
    // console.log("product code",dataValue[0].status)
    return dataValue[0].status;

  }

  // get total purchase amount
  gettotalSaleOrder() {
    this.service.findTotalOrder().subscribe({
      next: (res: any) => {
        this.totalSaleOrder = res[0]['sum'];
        this.setRevenue();
      },
      error: err => {
        console.log(err);
      }
    })
  }
  // get total Sales amount
  gettotalSaleDelivery() {
   this.service.findTotalDelivery().subscribe({
      next: (res: any) => {
        this.totalSaleDelivery = res[0]['sum'];
        this.setRevenue();
      },
      error: err => {
        console.log(err);
      }
    });
  }


  setRevenue() {
    let sale: number = this.totalSaleDelivery;
    let purchase: number = this.totalSaleOrder;
    if (sale != null && purchase != null) {
      this.revenue = this.findRevenue(sale, purchase);
      // update bar chart
      this.barChartData = {
        ...this.barChartData,
        datasets: [{ ...this.barChartData.datasets[0], data: [purchase, sale] }]
      };
    } else {
      this.revenue = 0;
    }
  }

  findRevenue(sale: number, purchase: number) {
    let revenue = (sale - purchase) * 100 / (purchase);
    return revenue.toFixed(2);

  }





}
