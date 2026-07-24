import { AuthService } from '../../services/auth.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faPenToSquare, faTrash, faEye, faTrashRestore, faList, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Order, Product, Status, Vendor, Warehouse, PoStatus, PO_TRANSITIONS } from '../../model/inventory.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({ selector: 'app-orders', templateUrl: './orders.component.html', styleUrl: './orders.component.css' })
export class OrdersComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;
  title = 'Orders List'; title2 = 'Order Entry Form'; menuType = true;
  fatrash = faTrash; editicon = faPenToSquare; faeye = faEye; faTrashRestore = faTrashRestore; faList = faList; faTrashAlt = faTrashAlt;
  order: Order[] = []; product: Product[] = []; vendor: Vendor[] = []; status: Status[] = []; warehouse: Warehouse[] = [];
  orderForm!: FormGroup; orderModel: Order = new Order();
  searchKeyword = ''; page = 1; totalPages = 1;
  viewOnly = false;
  activeTab: 'active' | 'trash' = 'active';

  constructor(public authService: AuthService, private service: ProductService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit() {
    this.orderForm = this.fb.group({ quantity: ['', Validators.required], productid: ['', Validators.required], unit_price: ['', Validators.required], total_price: ['', Validators.required], vendorid: ['', Validators.required], warehouseid: ['', Validators.required], createdate: [''] });
    this.load();
    this.loadRefData();
  }

  loadRefData() {
    this.service.findAllProduct(1, 200).subscribe({ next: r => this.product = r.data, error: () => this.toast.show('Failed to load products.', 'warning') });
    this.service.findAllStatus(1, 200).subscribe({ next: r => this.status = r.data, error: () => this.toast.show('Failed to load statuses.', 'warning') });
    this.service.findAllVendor(1, 200).subscribe({ next: r => this.vendor = r.data, error: () => this.toast.show('Failed to load vendors.', 'warning') });
    this.service.findAllWarehouse(1, 200).subscribe({ next: r => this.warehouse = r.data, error: () => this.toast.show('Failed to load warehouses.', 'warning') });
  }

  load() {
    const kw = this.searchKeyword ? this.resolveProductId(this.searchKeyword) : '';
    const obs = kw ? this.service.findOrderByKeyword(kw, this.page) : this.service.findAllOrder(this.page);
    obs.subscribe({ next: r => { this.order = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  loadTrash() {
    this.service.findTrashOrder(this.page).subscribe({ next: r => { this.order = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
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

  deleteOrder(id: number) {
    this.service.deleteOrder(id).subscribe({ next: () => { this.toast.show('Order moved to trash.', 'warning'); this.switchTab(this.activeTab); }, error: (err) => this.toast.show(err?.error?.message || 'Delete failed.', 'error') });
  }

  restoreOrder(id: number) {
    this.service.restoreOrder(id).subscribe({ next: () => { this.toast.show('Order restored.', 'success'); this.loadTrash(); }, error: (err) => this.toast.show(err?.error?.message || 'Restore failed.', 'error') });
  }

  openCreate() {
    this.menuType = true; this.viewOnly = false;
    this.orderModel = new Order();
    this.orderForm.reset(); this.orderForm.enable();
    if (!this.product.length || !this.vendor.length || !this.status.length || !this.warehouse.length) this.loadRefData();
  }

  viewOrder(row: any) {
    this.menuType = false;
    this.viewOnly = true;
    this.orderModel = row;
    this.orderForm.patchValue({ quantity: row.quantity, productid: row.productid, unit_price: row.unit_price, total_price: row.total_price, vendorid: row.vendorid, warehouseid: row.warehouseid });
    this.orderForm.disable();
  }

  onSubmit() {
    if (this.orderForm.valid) this.service.createOrder(this.orderForm.value).subscribe({
      next: () => { this.toast.show('Order created successfully.', 'success'); this.load(); this.orderForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
      error: (err) => this.toast.show(err?.error?.message || 'Create failed.', 'error')
    });
  }

  onEditById(row: any) {
    this.menuType = false;
    this.viewOnly = false;
    this.orderForm.enable();
    this.orderModel = { ...row };
    this.orderForm.patchValue({ quantity: row.quantity, productid: row.productid, unit_price: row.unit_price, total_price: row.total_price, vendorid: row.vendorid, warehouseid: row.warehouseid });
    if (!this.product.length || !this.vendor.length || !this.warehouse.length) this.loadRefData();
  }

  editOrder() {
    if (this.orderForm.valid) { Object.assign(this.orderModel, this.orderForm.value);
      this.service.updateOrder(this.orderModel.id, this.orderModel).subscribe({
        next: () => { this.toast.show('Order updated successfully.', 'success'); this.load(); this.orderForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
        error: (err) => this.toast.show(err?.error?.message || 'Update failed.', 'error')
      });
    }
  }

  filterProductData(id: any) { const p = this.product.find(x => x.id == id); return p ? p.pcode : ''; }
  filterVendorData(id: any) { const v = this.vendor.find(x => x.id == id); return v ? v.company : ''; }
  filterStatusData(id: any) { const s = this.status.find(x => x.id == id); return s ? s.status : ''; }
  filterWarehouseData(id: any) { const w = this.warehouse.find(x => x.id == id); return w ? w.wname : ''; }
  updateUnitPrice() { const p = this.product.find(x => x.id == this.orderForm.value.productid); if (p) this.orderForm.controls['unit_price'].setValue(p.price); }
  calculate() { this.orderForm.controls['total_price'].setValue(this.orderForm.value.quantity * this.orderForm.value.unit_price); }

  getNextStatuses(current: PoStatus): PoStatus[] { return PO_TRANSITIONS[current] || []; }

  changeStatus(orderId: number, newStatus: PoStatus) {
    this.service.transitionOrderStatus(orderId, newStatus).subscribe({
      next: () => { this.toast.show(`Status changed to '${newStatus}'.`, 'success'); this.load(); },
      error: (err) => this.toast.show(err?.error?.message || 'Status change failed.', 'error')
    });
  }

  statusBadgeClass(status: PoStatus): string {
    const map: Record<PoStatus, string> = {
      draft: 'badge bg-secondary', sent: 'badge bg-primary',
      partial: 'badge bg-warning text-dark', received: 'badge bg-success', cancelled: 'badge bg-danger'
    };
    return map[status] || 'badge bg-secondary';
  }

  statusBtnClass(status: PoStatus): string {
    const map: Record<PoStatus, string> = {
      draft: 'btn btn-sm btn-secondary', sent: 'btn btn-sm btn-primary',
      partial: 'btn btn-sm btn-warning', received: 'btn btn-sm btn-success', cancelled: 'btn btn-sm btn-danger'
    };
    return map[status] || 'btn btn-sm btn-secondary';
  }
}
