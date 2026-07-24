import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';
import { ReportResult } from '../../model/inventory.model';

type ReportType = 'sales' | 'purchases' | 'stock-valuation' | 'profit-loss' | 'top-selling' | 'dead-stock';
type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface ReportTypeConfig {
  value: ReportType;
  label: string;
  needsPeriod: boolean;
  needsRange: boolean;
  needsLimit?: boolean;
  needsDays?: boolean;
}

@Component({ selector: 'app-reports', templateUrl: './reports.component.html', styleUrl: './reports.component.css' })
export class ReportsComponent implements OnInit {
  reportType: ReportType = 'sales';
  period: Period = 'monthly';
  from = '';
  to = '';
  limit = 10;
  days = 90;
  loading = false;
  exporting: 'pdf' | 'xlsx' | 'csv' | null = null;
  result: ReportResult | null = null;

  readonly reportTypes: ReportTypeConfig[] = [
    { value: 'sales',            label: 'Sales Report',          needsPeriod: true,  needsRange: true },
    { value: 'purchases',        label: 'Purchase Report',       needsPeriod: true,  needsRange: true },
    { value: 'stock-valuation',  label: 'Stock Valuation',       needsPeriod: false, needsRange: false },
    { value: 'profit-loss',      label: 'Profit & Loss',         needsPeriod: true,  needsRange: true },
    { value: 'top-selling',      label: 'Top Selling Products',  needsPeriod: false, needsRange: true, needsLimit: true },
    { value: 'dead-stock',       label: 'Dead Stock Report',     needsPeriod: false, needsRange: false, needsDays: true },
  ];

  constructor(private service: ProductService, private toast: ToastService) {}

  ngOnInit() { this.runReport(); }

  get currentConfig(): ReportTypeConfig {
    return this.reportTypes.find(r => r.value === this.reportType)!;
  }

  onTypeChange() {
    this.from = ''; this.to = '';
    this.runReport();
  }

  private buildParams(): Record<string, any> {
    const cfg = this.currentConfig;
    const params: Record<string, any> = {};
    if (cfg.needsPeriod) params['period'] = this.period;
    if (cfg.needsRange && this.from && this.to) { params['from'] = this.from; params['to'] = this.to; }
    if (cfg.needsLimit) params['limit'] = this.limit;
    if (cfg.needsDays) params['days'] = this.days;
    return params;
  }

  runReport() {
    this.loading = true;
    this.service.runReport(this.reportType, this.buildParams()).subscribe({
      next: r => { this.result = r; this.loading = false; },
      error: err => { this.toast.show(err?.error?.message || 'Failed to load report.', 'error'); this.loading = false; this.result = null; }
    });
  }

  exportReport(format: 'pdf' | 'xlsx' | 'csv') {
    this.exporting = format;
    this.service.exportReport(this.reportType, format, this.buildParams()).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.reportType}-report.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        this.exporting = null;
      },
      error: () => { this.toast.show('Export failed.', 'error'); this.exporting = null; }
    });
  }
}
