import { AuthService } from '../../services/auth.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faPenToSquare, faTrash, faEye, faTrashRestore, faList, faTrashAlt, faHistory } from '@fortawesome/free-solid-svg-icons';
import { Product, Stock, Warehouse } from '../../model/inventory.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({ selector: 'app-stocks', templateUrl: './stocks.component.html', styleUrl: './stocks.component.css' })
export class StocksComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;
  title = 'Stock List'; title2 = 'Stock Entry Form'; menuType = true;
  fatrash = faTrash; editicon = faPenToSquare; faeye = faEye; faTrashRestore = faTrashRestore; faList = faList; faTrashAlt = faTrashAlt; faHistory = faHistory;
  stock: Stock[] = []; product: Product[] = []; warehouse: Warehouse[] = [];
  stockForm!: FormGroup; stockModel: Stock = new Stock();
  searchKeyword = ''; page = 1; totalPages = 1;
  viewOnly = false;
  activeTab: 'active' | 'trash' = 'active';

  movements: any[] = []; movPage = 1; movTotalPages = 1; selectedProduct: any = null;

  constructor(public authService: AuthService, private service: ProductService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit() {
    this.stockForm = this.fb.group({ quantity: ['', Validators.required], productid: ['', Validators.required], warehouseid: ['', Validators.required], updatedate: [''] });
    this.load();
    this.loadRefData();
  }

  loadRefData() {
    this.service.findAllProduct(1, 200).subscribe({ next: r => this.product = r.data, error: () => this.toast.show('Failed to load products.', 'warning') });
    this.service.findAllWarehouse(1, 200).subscribe({ next: r => this.warehouse = r.data, error: () => this.toast.show('Failed to load warehouses.', 'warning') });
  }

  load() {
    const obs = this.searchKeyword ? this.service.findStockByKeyword(this.searchKeyword, this.page) : this.service.findAllStock(this.page);
    obs.subscribe({ next: r => { this.stock = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  loadTrash() {
    this.service.findTrashStock(this.page).subscribe({ next: r => { this.stock = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  switchTab(tab: 'active' | 'trash') {
    this.activeTab = tab; this.page = 1;
    if (tab === 'active') this.load(); else this.loadTrash();
  }

  onSearch(v: string) { this.searchKeyword = v; this.page = 1; this.load(); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.activeTab === 'active' ? this.load() : this.loadTrash(); } }

  deleteStock(id: number) {
    this.service.deleteStock(id).subscribe({ next: () => { this.toast.show('Stock moved to trash.', 'warning'); this.switchTab(this.activeTab); }, error: (err) => this.toast.show(err?.error?.message || 'Delete failed.', 'error') });
  }

  restoreStock(id: number) {
    this.service.restoreStock(id).subscribe({ next: () => { this.toast.show('Stock restored.', 'success'); this.loadTrash(); }, error: (err) => this.toast.show(err?.error?.message || 'Restore failed.', 'error') });
  }

  openCreate() {
    this.menuType = true; this.viewOnly = false;
    this.stockModel = new Stock();
    this.stockForm.reset(); this.stockForm.enable();
    if (!this.product.length || !this.warehouse.length) this.loadRefData();
  }

  viewStock(row: any) {
    this.menuType = false;
    this.viewOnly = true;
    this.stockForm.patchValue({ quantity: row.quantity, productid: row.productid, warehouseid: row.warehouseid });
    this.stockForm.disable();
  }

  onSubmit() {
    if (this.stockForm.valid) this.service.createStock(this.stockForm.value).subscribe({
      next: () => { this.toast.show('Stock created successfully.', 'success'); this.load(); this.stockForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
      error: (err) => this.toast.show(err?.error?.message || 'Create failed.', 'error')
    });
  }

  onEditById(row: any) {
    this.menuType = false;
    this.viewOnly = false;
    this.stockForm.enable();
    this.stockModel.id = row.id;
    this.stockForm.patchValue({ quantity: row.quantity, productid: row.productid, warehouseid: row.warehouseid });
    if (!this.product.length || !this.warehouse.length) this.loadRefData();
  }

  editStock() {
    if (this.stockForm.valid) { Object.assign(this.stockModel, this.stockForm.value);
      this.service.updateStock(this.stockModel.id, this.stockModel).subscribe({
        next: () => { this.toast.show('Stock updated successfully.', 'success'); this.load(); this.stockForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
        error: (err) => this.toast.show(err?.error?.message || 'Update failed.', 'error')
      });
    }
  }

  filterProductData(id: any) { const p = this.product.find(x => x.id == id); return p ? p.pcode : ''; }

  openHistory(row: any) {
    this.selectedProduct = row;
    this.movPage = 1;
    this.loadMovements();
  }

  loadMovements() {
    this.service.findStockMovements(this.selectedProduct.productid, this.movPage).subscribe({
      next: r => { this.movements = r.data; this.movTotalPages = r.totalPages; },
      error: e => console.error(e)
    });
  }

  movGoToPage(p: number) { if (p >= 1 && p <= this.movTotalPages) { this.movPage = p; this.loadMovements(); } }

  changeClass(change: number): string {
    return change > 0 ? 'text-success fw-bold' : 'text-danger fw-bold';
  }
}
