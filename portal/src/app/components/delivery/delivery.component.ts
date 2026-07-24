import { AuthService } from '../../services/auth.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faPenToSquare, faTrash, faEye, faTrashRestore, faList, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Customer, Delivery, Product, Status, Warehouse, ShipmentStatus, SHIPMENT_TRANSITIONS } from '../../model/inventory.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({ selector: 'app-delivery', templateUrl: './delivery.component.html', styleUrl: './delivery.component.css' })
export class DeliveryComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;
  title = 'Delivery List'; title2 = 'Delivery Entry Form'; menuType = true;
  fatrash = faTrash; editicon = faPenToSquare; faeye = faEye; faTrashRestore = faTrashRestore; faList = faList; faTrashAlt = faTrashAlt;
  delivery: Delivery[] = []; product: Product[] = []; customer: Customer[] = []; status: Status[] = []; warehouse: Warehouse[] = [];
  deliveryForm!: FormGroup; deliveryModel: Delivery = new Delivery();
  searchKeyword = ''; page = 1; totalPages = 1;
  viewOnly = false;
  activeTab: 'active' | 'trash' = 'active';

  constructor(public authService: AuthService, private service: ProductService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit() {
    this.deliveryForm = this.fb.group({
      quantity: ['', Validators.required], productid: ['', Validators.required],
      unit_price: ['', Validators.required], total_price: ['', Validators.required],
      deliverydate: ['', Validators.required], customerid: ['', Validators.required],
      warehouseid: ['', Validators.required],
      tracking_number: [''], shipping_address: [''], carrier: [''], createdate: ['']
    });
    this.load();
    this.loadRefData();
  }

  loadRefData() {
    this.service.findAllProduct(1, 200).subscribe({ next: r => this.product = r.data, error: () => this.toast.show('Failed to load products.', 'warning') });
    this.service.findAllStatus(1, 200).subscribe({ next: r => this.status = r.data, error: () => this.toast.show('Failed to load statuses.', 'warning') });
    this.service.findAllCustomer(1, 200).subscribe({ next: r => this.customer = r.data, error: () => this.toast.show('Failed to load customers.', 'warning') });
    this.service.findAllWarehouse(1, 200).subscribe({ next: r => this.warehouse = r.data, error: () => this.toast.show('Failed to load warehouses.', 'warning') });
  }

  load() {
    const kw = this.searchKeyword ? this.resolveProductId(this.searchKeyword) : '';
    const obs = kw ? this.service.findDeliveryByKeyword(kw, this.page) : this.service.findAllDelivery(this.page);
    obs.subscribe({ next: r => { this.delivery = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  loadTrash() {
    this.service.findTrashDelivery(this.page).subscribe({ next: r => { this.delivery = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  switchTab(tab: 'active' | 'trash') {
    this.activeTab = tab; this.page = 1;
    if (tab === 'active') this.load(); else this.loadTrash();
  }

  resolveProductId(kw: string): string {
    const p = this.product.find(x => x.pcode?.toUpperCase() === kw.toUpperCase());
    return p ? String(p.id) : kw;
  }

  onSearch(v: string) { this.searchKeyword = v; this.page = 1; this.load(); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.activeTab === 'active' ? this.load() : this.loadTrash(); } }

  deleteDelivery(id: number) {
    this.service.deleteDelivery(id).subscribe({ next: () => { this.toast.show('Delivery moved to trash.', 'warning'); this.switchTab(this.activeTab); }, error: (err) => this.toast.show(err?.error?.message || 'Delete failed.', 'error') });
  }

  restoreDelivery(id: number) {
    this.service.restoreDelivery(id).subscribe({ next: () => { this.toast.show('Delivery restored.', 'success'); this.loadTrash(); }, error: (err) => this.toast.show(err?.error?.message || 'Restore failed.', 'error') });
  }

  openCreate() {
    this.menuType = true; this.viewOnly = false;
    this.deliveryModel = new Delivery();
    this.deliveryForm.reset(); this.deliveryForm.enable();
    if (!this.product.length || !this.customer.length || !this.status.length || !this.warehouse.length) this.loadRefData();
  }

  viewDelivery(row: any) {
    this.menuType = false;
    this.viewOnly = true;
    this.deliveryModel = row;
    this.deliveryForm.patchValue({ quantity: row.quantity, productid: row.productid, unit_price: row.unit_price, total_price: row.total_price, customerid: row.customerid, warehouseid: row.warehouseid, deliverydate: row.deliverydate, tracking_number: row.tracking_number, shipping_address: row.shipping_address, carrier: row.carrier });
    this.deliveryForm.disable();
  }

  onSubmit() {
    if (this.deliveryForm.valid) this.service.createDelivery(this.deliveryForm.value).subscribe({
      next: () => { this.toast.show('Delivery created successfully.', 'success'); this.load(); this.deliveryForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
      error: (err) => this.toast.show(err?.error?.message || 'Create failed.', 'error')
    });
  }

  onEditById(row: any) {
    this.menuType = false;
    this.viewOnly = false;
    this.deliveryForm.enable();
    this.deliveryModel = { ...row };
    this.deliveryForm.patchValue({ quantity: row.quantity, productid: row.productid, unit_price: row.unit_price, total_price: row.total_price, customerid: row.customerid, warehouseid: row.warehouseid, deliverydate: row.deliverydate, tracking_number: row.tracking_number, shipping_address: row.shipping_address, carrier: row.carrier });
    if (!this.product.length || !this.customer.length || !this.warehouse.length) this.loadRefData();
  }

  editDelivery() {
    if (this.deliveryForm.valid) { Object.assign(this.deliveryModel, this.deliveryForm.value);
      this.service.updateDelivery(this.deliveryModel.id, this.deliveryModel).subscribe({
        next: () => { this.toast.show('Delivery updated successfully.', 'success'); this.load(); this.deliveryForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
        error: (err) => this.toast.show(err?.error?.message || 'Update failed.', 'error')
      });
    }
  }

  filterProductData(id: any) { const p = this.product.find(x => x.id == id); return p ? p.pcode : ''; }
  filterCustomerData(id: any) { const c = this.customer.find(x => x.id == id); return c ? c.customer_name : ''; }
  filterStatusData(id: any) { const s = this.status.find(x => x.id == id); return s ? s.status : ''; }
  filterWarehouseData(id: any) { const w = this.warehouse.find(x => x.id == id); return w ? w.wname : ''; }
  updateUnitPrice() { const p = this.product.find(x => x.id == this.deliveryForm.value.productid); if (p && p.price != null) this.deliveryForm.controls['unit_price'].setValue((p.price * 1.1).toFixed(2)); }
  calculate() { this.deliveryForm.controls['total_price'].setValue(this.deliveryForm.value.quantity * this.deliveryForm.value.unit_price); }

  getNextStatuses(current: ShipmentStatus): ShipmentStatus[] { return SHIPMENT_TRANSITIONS[current] || []; }

  changeStatus(row: any, newStatus: ShipmentStatus) {
    const body: any = { status: newStatus };
    if (newStatus === 'shipped' && !row.tracking_number) {
      const tn = prompt('Enter tracking number:');
      if (!tn) return;
      body.tracking_number = tn;
    }
    this.service.transitionDeliveryStatus(row.id, body).subscribe({
      next: () => { this.toast.show(`Status changed to '${newStatus}'.`, 'success'); this.load(); },
      error: (err) => this.toast.show(err?.error?.message || 'Status change failed.', 'error')
    });
  }

  statusBadgeClass(status: ShipmentStatus): string {
    const map: Record<ShipmentStatus, string> = {
      pending: 'badge bg-secondary', packed: 'badge bg-info text-dark',
      shipped: 'badge bg-primary', delivered: 'badge bg-success', returned: 'badge bg-danger'
    };
    return map[status] || 'badge bg-secondary';
  }

  statusBtnClass(status: ShipmentStatus): string {
    const map: Record<ShipmentStatus, string> = {
      pending: 'btn btn-sm btn-secondary', packed: 'btn btn-sm btn-info',
      shipped: 'btn btn-sm btn-primary', delivered: 'btn btn-sm btn-success', returned: 'btn btn-sm btn-danger'
    };
    return map[status] || 'btn btn-sm btn-secondary';
  }
}
