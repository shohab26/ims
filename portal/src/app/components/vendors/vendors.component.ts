import { AuthService } from '../../services/auth.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faPenToSquare, faTrash, faEye, faTrashRestore, faList, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Vendor } from '../../model/inventory.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({ selector: 'app-vendors', templateUrl: './vendors.component.html', styleUrl: './vendors.component.css' })
export class VendorsComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;
  title = 'Vendors List'; title2 = 'Vendor Entry Form'; menuType = true;
  fatrash = faTrash; editicon = faPenToSquare; faeye = faEye; faTrashRestore = faTrashRestore; faList = faList; faTrashAlt = faTrashAlt;
  vendor: Vendor[] = []; vendorForm!: FormGroup; vendorModel: Vendor = new Vendor();
  searchKeyword = ''; page = 1; totalPages = 1;
  viewOnly = false;
  activeTab: 'active' | 'trash' = 'active';

  constructor(public authService: AuthService, private service: ProductService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit() {
    this.vendorForm = this.fb.group({ address: ['', Validators.required], cell: ['', Validators.required], contact_person: ['', Validators.required], company: ['', Validators.required], email: [''] });
    this.load();
  }

  load() {
    const obs = this.searchKeyword ? this.service.findVendorByKeyword(this.searchKeyword, this.page) : this.service.findAllVendor(this.page);
    obs.subscribe({ next: r => { this.vendor = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  loadTrash() {
    this.service.findTrashVendor(this.page).subscribe({ next: r => { this.vendor = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  switchTab(tab: 'active' | 'trash') {
    this.activeTab = tab; this.page = 1;
    if (tab === 'active') this.load(); else this.loadTrash();
  }

  onSearch(v: string) { this.searchKeyword = v; this.page = 1; this.load(); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.activeTab === 'active' ? this.load() : this.loadTrash(); } }

  deleteVendor(id: number) {
    this.service.deleteVendor(id).subscribe({ next: () => { this.toast.show('Vendor moved to trash.', 'warning'); this.switchTab(this.activeTab); }, error: () => this.toast.show('Delete failed.', 'error') });
  }

  restoreVendor(id: number) {
    this.service.restoreVendor(id).subscribe({ next: () => { this.toast.show('Vendor restored.', 'success'); this.loadTrash(); }, error: () => this.toast.show('Restore failed.', 'error') });
  }

  viewVendor(row: any) {
    this.menuType = false;
    this.viewOnly = true;
    this.vendorForm.patchValue({ address: row.address, cell: row.cell, contact_person: row.contact_person, company: row.company, email: row.email });
    this.vendorForm.disable();
  }

  onSubmit() {
    if (this.vendorForm.valid) this.service.createVendor(this.vendorForm.value).subscribe({
      next: () => { this.toast.show('Vendor created successfully.', 'success'); this.load(); this.vendorForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
      error: () => this.toast.show('Create failed.', 'error')
    });
  }

  onEditById(row: any) {
    this.menuType = false;
    this.viewOnly = false;
    this.vendorForm.enable();
    this.vendorModel.id = row.id;
    this.vendorForm.patchValue({ address: row.address, cell: row.cell, contact_person: row.contact_person, company: row.company, email: row.email });
  }

  editVendor() {
    if (this.vendorForm.valid) { Object.assign(this.vendorModel, this.vendorForm.value);
      this.service.updateVendor(this.vendorModel.id, this.vendorModel).subscribe({
        next: () => { this.toast.show('Vendor updated successfully.', 'success'); this.load(); this.vendorForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
        error: () => this.toast.show('Update failed.', 'error')
      });
    }
  }
}
