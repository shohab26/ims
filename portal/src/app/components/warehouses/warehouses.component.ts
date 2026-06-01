import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Warehouse } from '../../model/inventory.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({ selector: 'app-warehouses', templateUrl: './warehouses.component.html', styleUrl: './warehouses.component.css' })
export class WarehousesComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;
  title = 'Warehouses List'; title2 = 'Warehouse Entry Form'; menuType = true;
  fatrash = faTrash; editicon = faPenToSquare;
  warehouse: Warehouse[] = []; wareForm!: FormGroup; wareModel: Warehouse = new Warehouse();
  searchKeyword = ''; page = 1; totalPages = 1;

  constructor(private service: ProductService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit() { this.wareForm = this.fb.group({ wname: ['', Validators.required] }); this.load(); }

  load() {
    const obs = this.searchKeyword ? this.service.findWarehouseByKeyword(this.searchKeyword, this.page) : this.service.findAllWarehouse(this.page);
    obs.subscribe({ next: r => { this.warehouse = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  onSearch(v: string) { this.searchKeyword = v; this.page = 1; this.load(); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.load(); } }

  deleteWarehouse(id: number) {
    this.service.deleteWarehouse(id).subscribe({ next: () => { this.toast.show('Warehouse deleted.', 'warning'); this.load(); }, error: () => this.toast.show('Delete failed.', 'error') });
  }

  onSubmit() {
    if (this.wareForm.valid) this.service.createWarehouse(this.wareForm.value).subscribe({
      next: () => { this.toast.show('Warehouse created successfully.', 'success'); this.load(); this.wareForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
      error: () => this.toast.show('Create failed.', 'error')
    });
  }

  onEditById(row: any) { this.menuType = false; this.wareModel.id = row.id; this.wareForm.controls['wname'].setValue(row.wname); }

  editWarehouse() {
    if (this.wareForm.valid) { this.wareModel.wname = this.wareForm.value.wname;
      this.service.updateWarehoue(this.wareModel.id, this.wareModel).subscribe({
        next: () => { this.toast.show('Warehouse updated successfully.', 'success'); this.load(); this.wareForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
        error: () => this.toast.show('Update failed.', 'error')
      });
    }
  }
}
