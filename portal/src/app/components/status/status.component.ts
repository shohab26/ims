import { AuthService } from '../../services/auth.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faPenToSquare, faTrash, faEye, faTrashRestore, faList, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Status } from '../../model/inventory.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({ selector: 'app-status', templateUrl: './status.component.html', styleUrl: './status.component.css' })
export class StatusComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;
  title = 'Status List'; title2 = 'Status Entry Form'; menuType = true;
  fatrash = faTrash; editicon = faPenToSquare; faeye = faEye; faTrashRestore = faTrashRestore; faList = faList; faTrashAlt = faTrashAlt;
  status: Status[] = []; statusForm!: FormGroup; statusModel: Status = new Status();
  searchKeyword = ''; page = 1; totalPages = 1;
  viewOnly = false;
  activeTab: 'active' | 'trash' = 'active';

  constructor(public authService: AuthService, private service: ProductService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit() { this.statusForm = this.fb.group({ status: ['', Validators.required] }); this.load(); }

  load() {
    const obs = this.searchKeyword ? this.service.findStatusByKeyword(this.searchKeyword, this.page) : this.service.findAllStatus(this.page);
    obs.subscribe({ next: r => { this.status = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  loadTrash() {
    this.service.findTrashStatus(this.page).subscribe({ next: r => { this.status = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  switchTab(tab: 'active' | 'trash') {
    this.activeTab = tab; this.page = 1;
    if (tab === 'active') this.load(); else this.loadTrash();
  }

  onSearch(v: string) { this.searchKeyword = v; this.page = 1; this.load(); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.activeTab === 'active' ? this.load() : this.loadTrash(); } }

  deleteStatus(id: number) {
    this.service.deleteStatus(id).subscribe({ next: () => { this.toast.show('Status moved to trash.', 'warning'); this.switchTab(this.activeTab); }, error: () => this.toast.show('Delete failed.', 'error') });
  }

  restoreStatus(id: number) {
    this.service.restoreStatus(id).subscribe({ next: () => { this.toast.show('Status restored.', 'success'); this.loadTrash(); }, error: () => this.toast.show('Restore failed.', 'error') });
  }

  openCreate() {
    this.menuType = true; this.viewOnly = false;
    this.statusModel = new Status();
    this.statusForm.reset(); this.statusForm.enable();
  }

  viewStatus(row: any) {
    this.menuType = false;
    this.viewOnly = true;
    this.statusForm.patchValue({ status: row.status });
    this.statusForm.disable();
  }

  onSubmit() {
    if (this.statusForm.valid) this.service.createStatus(this.statusForm.value).subscribe({
      next: () => { this.toast.show('Status created successfully.', 'success'); this.load(); this.statusForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
      error: () => this.toast.show('Create failed.', 'error')
    });
  }

  onEditById(row: any) {
    this.menuType = false;
    this.viewOnly = false;
    this.statusForm.enable();
    this.statusModel.id = row.id;
    this.statusForm.controls['status'].setValue(row.status);
  }

  editStatus() {
    if (this.statusForm.valid) { this.statusModel.status = this.statusForm.value.status;
      this.service.updateStatus(this.statusModel.id, this.statusModel).subscribe({
        next: () => { this.toast.show('Status updated successfully.', 'success'); this.load(); this.statusForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
        error: () => this.toast.show('Update failed.', 'error')
      });
    }
  }
}
