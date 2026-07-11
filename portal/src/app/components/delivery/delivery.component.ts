import { AuthService } from '../../services/auth.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faPenToSquare, faTrash, faEye, faTrashRestore, faList, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Customer, Delivery, Product, Status } from '../../model/inventory.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({ selector: 'app-delivery', templateUrl: './delivery.component.html', styleUrl: './delivery.component.css' })
export class DeliveryComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;
  title = 'Delivery List'; title2 = 'Delivery Entry Form'; menuType = true;
  fatrash = faTrash; editicon = faPenToSquare; faeye = faEye; faTrashRestore = faTrashRestore; faList = faList; faTrashAlt = faTrashAlt;
  delivery: Delivery[] = []; product: Product[] = []; customer: Customer[] = []; status: Status[] = [];
  deliveryForm!: FormGroup; deliveryModel: Delivery = new Delivery();
  searchKeyword = ''; page = 1; totalPages = 1;
  viewOnly = false;
  activeTab: 'active' | 'trash' = 'active';

  constructor(public authService: AuthService, private service: ProductService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit() {
    this.deliveryForm = this.fb.group({ quantity: ['', Validators.required], productid: ['', Validators.required], statusid: ['', Validators.required], unit_price: ['', Validators.required], total_price: ['', Validators.required], deliverydate: ['', Validators.required], customerid: ['', Validators.required], createdate: [''] });
    this.load();
    this.service.findAllProduct(1, 100).subscribe({ next: r => this.product = r.data, error: e => console.log(e) });
    this.service.findAllStatus(1, 100).subscribe({ next: r => this.status = r.data, error: e => console.log(e) });
    this.service.findAllCustomer(1, 100).subscribe({ next: r => this.customer = r.data, error: e => console.log(e) });
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

  viewDelivery(row: any) {
    this.menuType = false;
    this.viewOnly = true;
    this.deliveryForm.patchValue({ quantity: row.quantity, productid: row.productid, statusid: row.statusid, unit_price: row.unit_price, total_price: row.total_price, customerid: row.customerid, deliverydate: row.deliverydate });
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
    this.deliveryModel.id = row.id;
    this.deliveryForm.patchValue({ quantity: row.quantity, productid: row.productid, statusid: row.statusid, unit_price: row.unit_price, total_price: row.total_price, customerid: row.customerid, deliverydate: row.deliverydate });
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
  updateUnitPrice() { const p = this.product.find(x => x.id == this.deliveryForm.value.productid); if (p && p.price != null) this.deliveryForm.controls['unit_price'].setValue((p.price * 1.1).toFixed(2)); }
  calculate() { this.deliveryForm.controls['total_price'].setValue(this.deliveryForm.value.quantity * this.deliveryForm.value.unit_price); }
}
