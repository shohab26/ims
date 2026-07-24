import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { ProductService } from '../../services/product.service';
import { Customer, Delivery, Order, Product, Status, Vendor, LowStockItem, InventoryValueSummary, OverdueInvoicesSummary, TopCustomerRow, TopProductRow } from '../../model/inventory.model';

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
  lowStockItems: LowStockItem[] = []

  totalSaleOrder: any;
  totalSaleDelivery: any;
  revenue: any;

  inventoryValue: InventoryValueSummary | null = null;
  pendingOrdersCount = 0;
  overdueInvoices: OverdueInvoicesSummary | null = null;
  topCustomers: TopCustomerRow[] = [];
  topProducts: TopProductRow[] = [];

  // ── Line chart: Revenue (last 12 months) ──
  revenueChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Revenue',
      borderColor: '#0f3460',
      backgroundColor: 'rgba(15,52,96,0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointBackgroundColor: '#0f3460',
    }]
  };
  revenueChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
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
    this.loadLowStock();
    this.loadRevenueChart();
    this.loadInventoryValue();
    this.loadPendingOrders();
    this.loadOverdueInvoices();
    this.loadTopCustomers();
    this.loadTopProducts();
  }

  loadLowStock() {
    this.service.findLowStockProducts().subscribe({
      next: res => { this.lowStockItems = res; },
      error: err => { console.log(err); }
    });
  }

  loadRevenueChart() {
    this.service.getRevenueChart(12).subscribe({
      next: res => {
        this.revenueChartData = {
          ...this.revenueChartData,
          labels: res.labels,
          datasets: [{ ...this.revenueChartData.datasets[0], data: res.data }]
        };
      },
      error: err => { console.log(err); }
    });
  }

  loadInventoryValue() {
    this.service.getInventoryValue().subscribe({
      next: res => { this.inventoryValue = res; },
      error: err => { console.log(err); }
    });
  }

  loadPendingOrders() {
    this.service.getPendingOrdersCount().subscribe({
      next: res => { this.pendingOrdersCount = res.count; },
      error: err => { console.log(err); }
    });
  }

  loadOverdueInvoices() {
    this.service.getOverdueInvoices(5).subscribe({
      next: res => { this.overdueInvoices = res; },
      error: err => { console.log(err); }
    });
  }

  loadTopCustomers() {
    this.service.getTopCustomers(5, 12).subscribe({
      next: res => { this.topCustomers = res; },
      error: err => { console.log(err); }
    });
  }

  loadTopProducts() {
    this.service.getTopProducts(5, 12).subscribe({
      next: res => { this.topProducts = res; },
      error: err => { console.log(err); }
    });
  }

  loadOrder() {
    this.service.findLatestOrder().subscribe({
      next: res => { this.order = res; },
      error: err => { console.log(err); }
    })
  }
  loadDelivery() {
    this.service.findLatestDelivery().subscribe({
      next: res => { this.delivery = res; },
      error: err => { console.log(err); }
    })
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
    } else {
      this.revenue = 0;
    }
  }

  findRevenue(sale: number, purchase: number) {
    let revenue = (sale - purchase) * 100 / (purchase);
    return revenue.toFixed(2);

  }





}
