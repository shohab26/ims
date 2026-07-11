import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';

@Component({ selector: 'app-activity-logs', templateUrl: './activity-logs.component.html', styleUrl: './activity-logs.component.css' })
export class ActivityLogsComponent implements OnInit {

  logs: any[] = [];
  page = 1; totalPages = 1;

  filters = { entity_type: '', action: '', from: '', to: '' };

  selectedLog: any = null;
  diffRows: { key: string; oldVal: string; newVal: string; changed: boolean }[] = [];

  entityTypes = ['products','vendors','customers','categories','warehouses','status','stocks','order_details','delivery_details','invoices','invoice_items'];
  actions = ['CREATE','UPDATE','DELETE'];

  constructor(private service: ProductService) {}

  ngOnInit() { this.load(); }

  load() {
    const f: any = {};
    if (this.filters.entity_type) f['entity_type'] = this.filters.entity_type;
    if (this.filters.action)      f['action']      = this.filters.action;
    if (this.filters.from)        f['from']        = this.filters.from;
    if (this.filters.to)          f['to']          = this.filters.to;

    this.service.findAllActivityLogs(f, this.page).subscribe({
      next: r => { this.logs = r.data; this.totalPages = r.totalPages; },
      error: e => console.error(e)
    });
  }

  applyFilters() { this.page = 1; this.load(); }
  resetFilters() { this.filters = { entity_type: '', action: '', from: '', to: '' }; this.page = 1; this.load(); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.load(); } }

  viewChanges(log: any) {
    this.selectedLog = log;
    const oldObj = log.old_data || {};
    const newObj = log.new_data || {};
    const keys   = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));
    this.diffRows = keys.map(k => {
      const ov = oldObj[k] !== undefined ? JSON.stringify(oldObj[k]) : '—';
      const nv = newObj[k] !== undefined ? JSON.stringify(newObj[k]) : '—';
      return { key: k, oldVal: ov, newVal: nv, changed: ov !== nv };
    });
  }

  actionClass(action: string): string {
    if (action === 'CREATE') return 'badge-success';
    if (action === 'UPDATE') return 'badge-primary';
    if (action === 'DELETE') return 'badge-danger';
    return 'badge-secondary';
  }
}
