import { AuthService } from '../../services/auth.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faPenToSquare, faTrash, faEye, faTrashRestore, faList, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Return, Delivery, Product, ReturnStatus, RETURN_TRANSITIONS } from '../../model/inventory.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({ selector: 'app-returns', templateUrl: './returns.component.html', styleUrl: './returns.component.css' })
export class ReturnsComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;
  title = 'Returns List'; title2 = 'Return Request Form'; menuType = true;
  fatrash = faTrash; editicon = faPenToSquare; faeye = faEye; faTrashRestore = faTrashRestore; faList = faList; faTrashAlt = faTrashAlt;
  returns: Return[] = []; delivery: Delivery[] = []; product: Product[] = [];
  returnForm!: FormGroup; returnModel: Return = new Return();
  searchKeyword = ''; page = 1; totalPages = 1;
  viewOnly = false;
  activeTab: 'active' | 'trash' = 'active';

  constructor(public authService: AuthService, private service: ProductService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit() {
    this.returnForm = this.fb.group({ delivery_id: ['', Validators.required], qty: ['', [Validators.required, Validators.min(0.01)]], reason: [''] });
    this.load();
    this.loadRefData();
  }

  loadRefData() {
    this.service.findAllDelivery(1, 200).subscribe({ next: r => this.delivery = r.data, error: () => this.toast.show('Failed to load deliveries.', 'warning') });
    this.service.findAllProduct(1, 200).subscribe({ next: r => this.product = r.data, error: () => this.toast.show('Failed to load products.', 'warning') });
  }

  load() {
    const obs = this.searchKeyword ? this.service.findReturnByKeyword(this.searchKeyword, this.page) : this.service.findAllReturn(this.page);
    obs.subscribe({ next: r => { this.returns = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  loadTrash() {
    this.service.findTrashReturn(this.page).subscribe({ next: r => { this.returns = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  switchTab(tab: 'active' | 'trash') {
    this.activeTab = tab; this.page = 1;
    if (tab === 'active') this.load(); else this.loadTrash();
  }

  onSearch(v: string) { this.searchKeyword = v; this.page = 1; this.load(); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.activeTab === 'active' ? this.load() : this.loadTrash(); } }

  deleteReturn(id: number) {
    this.service.deleteReturn(id).subscribe({ next: () => { this.toast.show('Return moved to trash.', 'warning'); this.switchTab(this.activeTab); }, error: (err) => this.toast.show(err?.error?.message || 'Delete failed.', 'error') });
  }

  restoreReturn(id: number) {
    this.service.restoreReturn(id).subscribe({ next: () => { this.toast.show('Return restored.', 'success'); this.loadTrash(); }, error: (err) => this.toast.show(err?.error?.message || 'Restore failed.', 'error') });
  }

  openCreate() {
    this.menuType = true; this.viewOnly = false;
    this.returnModel = new Return();
    this.returnForm.reset(); this.returnForm.enable();
    if (!this.delivery.length || !this.product.length) this.loadRefData();
  }

  viewReturn(row: Return) {
    this.menuType = false;
    this.viewOnly = true;
    this.returnModel = row;
    this.returnForm.patchValue({ delivery_id: row.delivery_id, qty: row.qty, reason: row.reason });
    this.returnForm.disable();
  }

  onSubmit() {
    if (this.returnForm.valid) this.service.createReturn(this.returnForm.value).subscribe({
      next: () => { this.toast.show('Return request created.', 'success'); this.load(); this.returnForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
      error: (err) => this.toast.show(err?.error?.message || 'Create failed.', 'error')
    });
  }

  onEditById(row: Return) {
    this.menuType = false;
    this.viewOnly = false;
    this.returnForm.enable();
    this.returnModel = { ...row };
    this.returnForm.patchValue({ delivery_id: row.delivery_id, qty: row.qty, reason: row.reason });
    this.returnForm.get('delivery_id')?.disable();
    if (!this.delivery.length || !this.product.length) this.loadRefData();
  }

  editReturn() {
    if (this.returnForm.valid) {
      this.service.updateReturn(this.returnModel.id, { qty: this.returnForm.value.qty, reason: this.returnForm.value.reason }).subscribe({
        next: () => { this.toast.show('Return updated successfully.', 'success'); this.load(); this.returnForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
        error: (err) => this.toast.show(err?.error?.message || 'Update failed.', 'error')
      });
    }
  }

  filterProductData(id: any) { const p = this.product.find(x => x.id == id); return p ? p.pcode : ''; }
  deliveryLabel(id: any) {
    const d = this.delivery.find(x => x.id == id);
    if (!d) return `#${id}`;
    return `#${d.id} — ${this.filterProductData(d.productid)} (qty: ${d.quantity})`;
  }

  getNextStatuses(current: ReturnStatus): ReturnStatus[] { return RETURN_TRANSITIONS[current] || []; }

  changeStatus(returnId: number, newStatus: ReturnStatus) {
    if (newStatus === 'approved' && !confirm('Approve this return? Stock will be restocked immediately.')) return;
    if (newStatus === 'rejected' && !confirm('Reject this return request?')) return;
    this.service.transitionReturnStatus(returnId, newStatus).subscribe({
      next: () => { this.toast.show(`Return ${newStatus}.`, 'success'); this.load(); },
      error: (err) => this.toast.show(err?.error?.message || 'Status change failed.', 'error')
    });
  }

  statusBadgeClass(status: ReturnStatus): string {
    const map: Record<ReturnStatus, string> = {
      requested: 'badge bg-warning text-dark', approved: 'badge bg-success', rejected: 'badge bg-danger'
    };
    return map[status] || 'badge bg-secondary';
  }

  statusBtnClass(status: ReturnStatus): string {
    const map: Record<ReturnStatus, string> = {
      requested: 'btn btn-sm btn-secondary', approved: 'btn btn-sm btn-success', rejected: 'btn btn-sm btn-danger'
    };
    return map[status] || 'btn btn-sm btn-secondary';
  }
}
