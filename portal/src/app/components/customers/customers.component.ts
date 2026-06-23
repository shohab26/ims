import { AuthService } from '../../services/auth.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faPenToSquare, faTrash, faEye, faTrashRestore, faList, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Customer } from '../../model/inventory.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({ selector: 'app-customers', templateUrl: './customers.component.html', styleUrl: './customers.component.css' })
export class CustomersComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;
  title = 'Customers List'; title2 = 'Customer Entry Form'; menuType = true;
  fatrash = faTrash; editicon = faPenToSquare; faeye = faEye; faTrashRestore = faTrashRestore; faList = faList; faTrashAlt = faTrashAlt;
  customer: Customer[] = []; customerForm!: FormGroup; customerModel: Customer = new Customer();
  searchKeyword = ''; page = 1; totalPages = 1;
  viewOnly = false;
  activeTab: 'active' | 'trash' = 'active';

  constructor(public authService: AuthService, private service: ProductService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit() {
    this.customerForm = this.fb.group({ address: ['', Validators.required], phone: ['', Validators.required], customer_name: ['', Validators.required], email: ['', Validators.required] });
    this.load();
  }

  load() {
    const obs = this.searchKeyword ? this.service.findCustomerByKeyword(this.searchKeyword, this.page) : this.service.findAllCustomer(this.page);
    obs.subscribe({ next: r => { this.customer = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  loadTrash() {
    this.service.findTrashCustomer(this.page).subscribe({ next: r => { this.customer = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  switchTab(tab: 'active' | 'trash') {
    this.activeTab = tab; this.page = 1;
    if (tab === 'active') this.load(); else this.loadTrash();
  }

  onSearch(v: string) { this.searchKeyword = v; this.page = 1; this.load(); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.activeTab === 'active' ? this.load() : this.loadTrash(); } }

  deleteCustomer(id: number) {
    this.service.deleteCustomer(id).subscribe({ next: () => { this.toast.show('Customer moved to trash.', 'warning'); this.switchTab(this.activeTab); }, error: () => this.toast.show('Delete failed.', 'error') });
  }

  restoreCustomer(id: number) {
    this.service.restoreCustomer(id).subscribe({ next: () => { this.toast.show('Customer restored.', 'success'); this.loadTrash(); }, error: () => this.toast.show('Restore failed.', 'error') });
  }

  viewCustomer(row: any) {
    this.menuType = false;
    this.viewOnly = true;
    this.customerForm.patchValue({ address: row.address, phone: row.phone, customer_name: row.customer_name, email: row.email });
    this.customerForm.disable();
  }

  onSubmit() {
    if (this.customerForm.valid) this.service.createCustomer(this.customerForm.value).subscribe({
      next: () => { this.toast.show('Customer created successfully.', 'success'); this.load(); this.customerForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
      error: () => this.toast.show('Create failed.', 'error')
    });
  }

  onEditById(row: any) {
    this.menuType = false;
    this.viewOnly = false;
    this.customerForm.enable();
    this.customerModel.id = row.id;
    this.customerForm.patchValue({ address: row.address, phone: row.phone, customer_name: row.customer_name, email: row.email });
  }

  editCustomer() {
    if (this.customerForm.valid) { Object.assign(this.customerModel, this.customerForm.value);
      this.service.updateCustomer(this.customerModel.id, this.customerModel).subscribe({
        next: () => { this.toast.show('Customer updated successfully.', 'success'); this.load(); this.customerForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
        error: () => this.toast.show('Update failed.', 'error')
      });
    }
  }
}
