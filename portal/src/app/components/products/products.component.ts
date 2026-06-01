import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Category, Product } from '../../model/inventory.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({ selector: 'app-products', templateUrl: './products.component.html', styleUrl: './products.component.css' })
export class ProductsComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;
  title = 'Products List'; title2 = 'Product Entry Form'; menuType = true;
  fatrash = faTrash; editicon = faPenToSquare;
  product: Product[] = []; cate: Category[] = []; productForm!: FormGroup; productModel: Product = new Product();
  searchKeyword = ''; page = 1; totalPages = 1;

  constructor(private service: ProductService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit() {
    this.productForm = this.fb.group({ pname: ['', Validators.required], pcode: ['', Validators.required], pcate: ['', Validators.required], price: ['', Validators.required], createdate: [''] });
    this.load();
    this.service.findAllCategory(1, 100).subscribe({ next: r => this.cate = r.data, error: e => console.log(e) });
  }

  load() {
    const obs = this.searchKeyword ? this.service.findProductByKeyword(this.searchKeyword, this.page) : this.service.findAllProduct(this.page);
    obs.subscribe({ next: r => { this.product = r.data; this.totalPages = r.totalPages; }, error: e => console.log(e) });
  }

  onSearch(v: string) { this.searchKeyword = v; this.page = 1; this.load(); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.load(); } }

  deleteProduct(id: number) {
    this.service.deleteProduct(id).subscribe({ next: () => { this.toast.show('Product deleted.', 'warning'); this.load(); }, error: () => this.toast.show('Delete failed.', 'error') });
  }

  onSubmit() {
    if (this.productForm.valid) this.service.createProduct(this.productForm.value).subscribe({
      next: () => { this.toast.show('Product created successfully.', 'success'); this.load(); this.productForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
      error: () => this.toast.show('Create failed.', 'error')
    });
  }

  onEditById(row: any) { this.menuType = false; this.productModel.id = row.id; this.productForm.patchValue({ pname: row.pname, pcode: row.pcode, pcate: row.pcate, price: row.price }); }

  editProduct() {
    if (this.productForm.valid) { Object.assign(this.productModel, this.productForm.value);
      this.service.updateProduct(this.productModel.id, this.productModel).subscribe({
        next: () => { this.toast.show('Product updated successfully.', 'success'); this.load(); this.productForm.reset(); this.menuType = true; this.closeModal.nativeElement.click(); },
        error: () => this.toast.show('Update failed.', 'error')
      });
    }
  }

  filterCategoriesData(id: any) { const c = this.cate.find(x => x.id == id); return c ? c.cname : ''; }
}
