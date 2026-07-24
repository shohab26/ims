import { AuthService } from '../../services/auth.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faPenToSquare, faTrash, faEye, faTrashRestore, faList, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { StockTransfer, Warehouse, Product, TransferStatus, TRANSFER_TRANSITIONS } from '../../model/inventory.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({ selector: 'app-stock-transfers', templateUrl: './stock-transfers.component.html', styleUrl: './stock-transfers.component.css' })
export class StockTransfersComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;
  title = 'Stock Transfers'; title2 = 'Transfer Request Form'; menuType = true;
  fatrash = faTrash; editicon = faPenToSquare; faeye = faEye; faTrashRestore = faTrashRestore; faList = faList; faTrashAlt = faTrashAlt;
  transfers: StockTransfer[] = []; warehouse: Warehouse[] = []; product: Product[] = [];
  transferForm!: FormGroup; transferModel: StockTransfer = new StockTransfer();
  searchKeyword = ''; page = 1; totalPages = 1;
  viewOnly = false;
  activeTab: 'active' | 'trash' = 'active';

  constructor(public authService: AuthService, private service: ProductService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit() {
    this.transferForm = this.fb.group({
      productid: ['', Validators.required],
      from_warehouse: ['', Validators.required],
      to_warehouse: ['', Validators.required],
      qty: ['', [Validators.required, Validators.min(0.01)]]
    });
    this.load();
    this.loadRefData();
  }

  loadRefData() {
    this.service.findAllWarehouse(1, 200).subscribe({ next: r => this.warehouse = r.data, error: () => this.toast.show('Failed to load warehouses.', 'warning') });
    this.service.findAllProduct(1, 200).subscribe({ next: r => this.product = r.data, error: () => this.toast.show('Failed to load products.', 'warning') });
  }

  load() {
    const obs = this.searchKeyword ? this.service.findStockTransferByKeyword(this.searchKeyword, this.page) : this.service.findAllStockTransfer(this.page);
    obs.subscribe({ next: r => { this.transfers = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  loadTrash() {
    this.service.findTrashStockTransfer(this.page).subscribe({ next: r => { this.transfers = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  switchTab(tab: 'active' | 'trash') {
    this.activeTab = tab; this.page = 1;
    if (tab === 'active') this.load(); else this.loadTrash();
  }

  onSearch(v: string) { this.searchKeyword = v; this.page = 1; this.load(); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.activeTab === 'active' ? this.load() : this.loadTrash(); } }

  deleteTransfer(id: number) {
    this.service.deleteStockTransfer(id).subscribe({ next: () => { this.toast.show('Transfer moved to trash.', 'warning'); this.switchTab(this.activeTab); }, error: (err) => this.toast.show(err?.error?.message || 'Delete failed.', 'error') });
  }

  restoreTransfer(id: number) {
    this.service.restoreStockTransfer(id).subscribe({ next: () => { this.toast.show('Transfer restored.', 'success'); this.loadTrash(); }, error: (err) => this.toast.show(err?.error?.message || 'Restore failed.', 'error') });
  }

  openCreate() {
    this.menuType = true; this.viewOnly = false;
    this.transferModel = new StockTransfer();
    this.transferForm.reset(); this.transferForm.enable();
    if (!this.warehouse.length || !this.product.length) this.loadRefData();
  }

  viewTransfer(row: StockTransfer) {
    this.menuType = false;
    this.viewOnly = true;
    this.transferModel = row;
    this.transferForm.patchValue({ productid: row.productid, from_warehouse: row.from_warehouse, to_warehouse: row.to_warehouse, qty: row.qty });
    this.transferForm.disable();
  }

  onSubmit() {
    if (this.transferForm.valid) this.service.createStockTransfer(this.transferForm.value).subscribe({
      next: () => { this.toast.show('Transfer request created.', 'success'); this.load(); this.transferForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
      error: (err) => this.toast.show(err?.error?.message || 'Create failed.', 'error')
    });
  }

  onEditById(row: StockTransfer) {
    this.menuType = false;
    this.viewOnly = false;
    this.transferForm.enable();
    this.transferModel = { ...row };
    this.transferForm.patchValue({ productid: row.productid, from_warehouse: row.from_warehouse, to_warehouse: row.to_warehouse, qty: row.qty });
    this.transferForm.get('productid')?.disable();
    this.transferForm.get('from_warehouse')?.disable();
    this.transferForm.get('to_warehouse')?.disable();
    if (!this.warehouse.length || !this.product.length) this.loadRefData();
  }

  editTransfer() {
    if (this.transferForm.valid) {
      this.service.updateStockTransfer(this.transferModel.id, { qty: this.transferForm.value.qty }).subscribe({
        next: () => { this.toast.show('Transfer updated successfully.', 'success'); this.load(); this.transferForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
        error: (err) => this.toast.show(err?.error?.message || 'Update failed.', 'error')
      });
    }
  }

  filterProductData(id: any) { const p = this.product.find(x => x.id == id); return p ? p.pcode : ''; }
  filterWarehouseData(id: any) { const w = this.warehouse.find(x => x.id == id); return w ? w.wname : ''; }

  getNextStatuses(current: TransferStatus): TransferStatus[] { return TRANSFER_TRANSITIONS[current] || []; }

  changeStatus(transferId: number, newStatus: TransferStatus) {
    if (newStatus === 'approved' && !confirm('Approve this transfer? Stock will move between warehouses immediately.')) return;
    if (newStatus === 'rejected' && !confirm('Reject this transfer request?')) return;
    this.service.transitionStockTransferStatus(transferId, newStatus).subscribe({
      next: () => { this.toast.show(`Transfer ${newStatus}.`, 'success'); this.load(); },
      error: (err) => this.toast.show(err?.error?.message || 'Status change failed.', 'error')
    });
  }

  statusBadgeClass(status: TransferStatus): string {
    const map: Record<TransferStatus, string> = {
      pending: 'badge bg-warning text-dark', approved: 'badge bg-success', rejected: 'badge bg-danger'
    };
    return map[status] || 'badge bg-secondary';
  }

  statusBtnClass(status: TransferStatus): string {
    const map: Record<TransferStatus, string> = {
      pending: 'btn btn-sm btn-secondary', approved: 'btn btn-sm btn-success', rejected: 'btn btn-sm btn-danger'
    };
    return map[status] || 'btn btn-sm btn-secondary';
  }
}
