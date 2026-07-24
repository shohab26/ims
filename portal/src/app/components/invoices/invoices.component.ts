import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faPenToSquare, faTrash, faEye, faFilePdf, faPlus, faMinus, faTrashRestore, faList, faTrashAlt, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Invoice, InvoiceItem, Customer, Product, Payment } from '../../model/inventory.model';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

@Component({ selector: 'app-invoices', templateUrl: './invoices.component.html', styleUrl: './invoices.component.css' })
export class InvoicesComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;

  title = 'Invoices'; title2 = 'Invoice Form';
  menuType = true; viewOnly = false;
  faTrash = faTrash; faEdit = faPenToSquare; faEye = faEye; faPdf = faFilePdf; faPlus = faPlus; faMinus = faMinus;
  faTrashRestore = faTrashRestore; faList = faList; faTrashAlt = faTrashAlt; faSend = faPaperPlane;

  invoices: Invoice[] = []; customers: Customer[] = []; products: Product[] = [];
  invoiceForm!: FormGroup; invoiceModel: Invoice = new Invoice();
  lineItems: InvoiceItem[] = [];
  searchKeyword = ''; page = 1; totalPages = 1;
  activeTab: 'active' | 'trash' = 'active';
  sendingEmailId: number | null = null;

  payments: Payment[] = []; paymentForm!: FormGroup;

  readonly statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
  readonly paymentMethods = ['cash', 'card', 'bank_transfer', 'cheque', 'other'];

  constructor(public authService: AuthService, private svc: ProductService,
              private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit() {
    this.invoiceForm = this.fb.group({
      customerid: ['', Validators.required],
      due_date:   [''],
      discount:   [0],
      tax_percent:[0],
      notes:      [''],
      status:     ['draft']
    });
    this.paymentForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      method: ['cash'],
      transaction_id: [''],
      paid_at: [new Date().toISOString().split('T')[0]],
      note: ['']
    });
    this.load();
    this.loadRefData();
  }

  loadRefData() {
    this.svc.findAllCustomer(1, 200).subscribe
    ({ next: r => this.customers = r.data, 
      error: () => this.toast.show
      ('Failed to load customers.', 'warning') });
    this.svc.findAllProduct(1, 200).subscribe
    ({ next: r => this.products = r.data, 
      error: () => this.toast.show
      ('Failed to load products.', 'warning') });
  }

  load() {
    const obs = this.searchKeyword
      ? this.svc.findInvoiceByKeyword(this.searchKeyword, this.page)
      : this.svc.findAllInvoice(this.page);
    obs.subscribe({ next: r => { this.invoices = r.data; this.totalPages = r.totalPages; } });
  }

  loadTrash() {
    this.svc.findTrashInvoice(this.page).subscribe({ next: r => { this.invoices = r.data; this.totalPages = r.totalPages; } });
  }

  switchTab(tab: 'active' | 'trash') {
    this.activeTab = tab; this.page = 1;
    if (tab === 'active') this.load(); else this.loadTrash();
  }

  onSearch(v: string) { this.searchKeyword = v; this.page = 1; this.load(); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.activeTab === 'active' ? this.load() : this.loadTrash(); } }

  // ── Line items ──────────────────────────────────────────────
  addLine() { this.lineItems.push(new InvoiceItem()); }
  removeLine(i: number) { this.lineItems.splice(i, 1); this.recalc(); }

  onProductChange(line: InvoiceItem) {
    const p = this.products.find(x => x.id === +line.productid!);
    if (p) { line.unit_price = p.price || 0; line.description = p.pname || ''; }
    this.recalcLine(line);
  }

  recalcLine(line: InvoiceItem) {
    line.total = (line.quantity || 0) * (line.unit_price || 0);
    this.recalc();
  }

  get subtotal() { return this.lineItems.reduce((s, l) => s + (l.total || 0), 0); }
  get discount() { return +(this.invoiceForm?.value?.discount || 0); }
  get taxPct()   { return +(this.invoiceForm?.value?.tax_percent || 0); }
  get taxAmt()   { return this.subtotal * this.taxPct / 100; }
  get grandTotal() { return this.subtotal - this.discount + this.taxAmt; }
  recalc() { /* triggers change detection via getter */ }

  // ── CRUD ────────────────────────────────────────────────────
  openCreate() {
    this.menuType = false; this.viewOnly = false; this.invoiceModel = new Invoice();
    this.lineItems = [new InvoiceItem()]; this.payments = [];
    this.invoiceForm.reset({ discount: 0, tax_percent: 0, status: 'draft' });
    this.invoiceForm.enable();
    if (!this.customers.length || !this.products.length) this.loadRefData();
  }

  viewInvoice(row: Invoice) {
    this.svc.findInvoiceById(row.id).subscribe({ next: inv => {
      this.menuType = false; this.viewOnly = true;
      this.invoiceModel = inv;
      this.lineItems = inv.items || [];
      this.payments = inv.payments || [];
      this.invoiceForm.patchValue({ customerid: inv.customerid, due_date: inv.due_date?.split('T')[0] || '',
        discount: inv.discount, tax_percent: inv.tax_percent, notes: inv.notes, status: inv.status });
      this.invoiceForm.disable();
      this.paymentForm.reset({ method: 'cash', paid_at: new Date().toISOString().split('T')[0] });
    }});
  }

  onEditById(row: Invoice) {
    this.svc.findInvoiceById(row.id).subscribe({ next: inv => {
      this.menuType = false; this.viewOnly = false; this.invoiceModel = inv;
      this.lineItems = inv.items || [];
      this.payments = inv.payments || [];
      this.invoiceForm.patchValue({ customerid: inv.customerid, due_date: inv.due_date?.split('T')[0] || '',
        discount: inv.discount, tax_percent: inv.tax_percent, notes: inv.notes, status: inv.status });
      this.invoiceForm.enable();
      if (!this.customers.length || !this.products.length) this.loadRefData();
    }});
  }

  onSubmit() {
    if (this.invoiceForm.invalid || !this.lineItems.length) return;
    const payload = { ...this.invoiceForm.value, items: this.lineItems };
    this.svc.createInvoice(payload).subscribe({
      next: () => { this.toast.show('Invoice created.', 'success'); this.load(); this.menuType = true; this.closeModal.nativeElement.click(); },
      error: (err) => this.toast.show(err?.error?.message || 'Create failed.', 'error')
    });
  }

  editInvoice() {
    if (this.invoiceForm.invalid || !this.lineItems.length) return;
    const payload = { ...this.invoiceForm.value, items: this.lineItems };
    this.svc.updateInvoice(this.invoiceModel.id, payload).subscribe({
      next: () => { this.toast.show('Invoice updated.', 'success'); this.load(); this.menuType = true; this.closeModal.nativeElement.click(); },
      error: (err) => this.toast.show(err?.error?.message || 'Update failed.', 'error')
    });
  }

  deleteInvoice(id: number) {
    this.svc.deleteInvoice(id).subscribe({
      next: () => { this.toast.show('Invoice moved to trash.', 'warning'); this.switchTab(this.activeTab); },
      error: () => this.toast.show('Delete failed.', 'error')
    });
  }

  restoreInvoice(id: number) {
    this.svc.restoreInvoice(id).subscribe({
      next: () => { this.toast.show('Invoice restored.', 'success'); this.loadTrash(); },
      error: () => this.toast.show('Restore failed.', 'error')
    });
  }

  downloadPDF(id: number, number: string) {
    this.svc.downloadInvoicePDF(id).subscribe({ next: blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${number}.pdf`; a.click();
      URL.revokeObjectURL(url);
    }, error: () => this.toast.show('PDF download failed.', 'error') });
  }

  sendEmail(row: Invoice) {
    if (!confirm(`Send invoice ${row.invoice_number} to customer's email?`)) return;
    this.sendingEmailId = row.id;
    this.svc.emailInvoice(row.id).subscribe({
      next: r => { this.toast.show(r.message, 'success'); this.sendingEmailId = null; },
      error: err => { this.toast.show(err?.error?.message || 'Failed to send email.', 'error'); this.sendingEmailId = null; }
    });
  }

  getCustomerName(id: any) { return this.customers.find(c => c.id == id)?.customer_name || '—'; }
  statusClass(s: string) { return { draft:'badge-secondary', sent:'badge-primary', paid:'badge-success', overdue:'badge-danger', cancelled:'badge-dark' }[s] || 'badge-secondary'; }
  backToList() { this.menuType = true; this.invoiceForm.reset({ discount: 0, tax_percent: 0, status: 'draft' }); this.lineItems = []; this.payments = []; }

  // ── Payments ────────────────────────────────────────────────
  get totalPaid() { return this.payments.reduce((s, p) => s + (+p.amount || 0), 0); }
  get amountDue() { return Math.max(this.grandTotal - this.totalPaid, 0); }

  recordPayment() {
    if (this.paymentForm.invalid || !this.invoiceModel.id) return;
    this.svc.addPayment(this.invoiceModel.id, this.paymentForm.value).subscribe({
      next: () => {
        this.toast.show('Payment recorded.', 'success');
        this.paymentForm.reset({ method: 'cash', paid_at: new Date().toISOString().split('T')[0] });
        this.refreshPayments();
        this.load();
      },
      error: (err) => this.toast.show(err?.error?.message || 'Failed to record payment.', 'error')
    });
  }

  voidPayment(payment: Payment) {
    if (!confirm(`Void payment of $${payment.amount}?`)) return;
    this.svc.voidPayment(payment.id).subscribe({
      next: () => { this.toast.show('Payment voided.', 'warning'); this.refreshPayments(); this.load(); },
      error: (err) => this.toast.show(err?.error?.message || 'Failed to void payment.', 'error')
    });
  }

  refreshPayments() {
    if (!this.invoiceModel.id) return;
    this.svc.findInvoiceById(this.invoiceModel.id).subscribe({ next: inv => {
      this.payments = inv.payments || [];
      this.invoiceForm.patchValue({ status: inv.status }, { emitEvent: false });
      this.invoiceModel.status = inv.status;
    }});
  }
}
