import { AuthService } from '../../services/auth.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faPenToSquare, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import { Category } from '../../model/inventory.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({ selector: 'app-categories', templateUrl: './categories.component.html', styleUrl: './categories.component.css' })
export class CategoriesComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;
  title = 'Categories List'; title2 = 'Category Entry Form'; menuType = true;
  fatrash = faTrash; editicon = faPenToSquare; faeye = faEye;
  cate: Category[] = []; cateForm!: FormGroup; cateModel: Category = new Category();
  searchKeyword = ''; page = 1; totalPages = 1;
  viewOnly = false;

  constructor(public authService: AuthService, private service: ProductService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit() { this.cateForm = this.fb.group({ cname: ['', Validators.required] }); this.load(); }

  load() {
    const obs = this.searchKeyword ? this.service.findCategoryByKeyword(this.searchKeyword, this.page) : this.service.findAllCategory(this.page);
    obs.subscribe({ next: r => { this.cate = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  onSearch(v: string) { this.searchKeyword = v; this.page = 1; this.load(); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.load(); } }

  deleteCategory(id: number) {
    this.service.deleteCategory(id).subscribe({ next: () => { this.toast.show('Category deleted.', 'warning'); this.load(); }, error: () => this.toast.show('Delete failed.', 'error') });
  }

  viewCategory(row: any) {
    this.menuType = false;
    this.viewOnly = true;
    this.cateForm.patchValue({ cname: row.cname });
    this.cateForm.disable();
  }

  onSubmit() {
    if (this.cateForm.valid) this.service.createCategory(this.cateForm.value).subscribe({
      next: () => { this.toast.show('Category created successfully.', 'success'); this.load(); this.cateForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
      error: () => this.toast.show('Create failed.', 'error')
    });
  }

  onEditById(row: any) {
    this.menuType = false;
    this.viewOnly = false;
    this.cateForm.enable();
    this.cateModel.id = row.id;
    this.cateForm.controls['cname'].setValue(row.cname);
  }

  editCategory() {
    if (this.cateForm.valid) { this.cateModel.cname = this.cateForm.value.cname;
      this.service.updateCategory(this.cateModel.id, this.cateModel).subscribe({
        next: () => { this.toast.show('Category updated successfully.', 'success'); this.load(); this.cateForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
        error: () => this.toast.show('Update failed.', 'error')
      });
    }
  }
}
