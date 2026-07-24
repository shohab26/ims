
//Category class
export class Categories {
    id: number = 0
    cate_name?: string;
}
//book class
export class Book {
    id: number = 0
    name?: string
    price?: number
    dept_id?: number;
}
//book class

// ----------------------------------------- REPORTS ----------------------------------------
export interface ReportColumn { key: string; label: string; }
export interface ReportResult {
    title: string;
    columns: ReportColumn[];
    rows: any[];
    summary: string[];
    meta?: any;
}

// ----------------------------------------- DASHBOARD ----------------------------------------
export interface RevenueChartData { labels: string[]; data: number[]; }
export interface InventoryValueSummary { totalValue: number; totalProducts: number; totalQty: number; }
export interface PendingOrdersSummary { count: number; }
export interface OverdueInvoiceRow {
    id: number; invoice_number: string; customer_name: string; due_date: string; total: number;
    paid_amount: number; due_amount: number;
}
export interface OverdueInvoicesSummary { count: number; totalDue: number; invoices: OverdueInvoiceRow[]; }
export interface TopCustomerRow { customerid: number; customer_name: string; revenue: number; order_count: number; }
export interface TopProductRow { id: number; pcode: string; pname: string; qty_sold: number; revenue: number; }

// ----------------------------------------- INVENTORY ----------------------------------------

//warehouses
export class Warehouse {
    id: number = 0
    wname?: string
    deleted_at?: string | null
    deleted_by?: number | null
    created_at?: string | null
    created_by?: number | null
    created_by_name?: string | null
    updated_at?: string | null
    updated_by?: number | null
    updated_by_name?: string | null
}
//status
export class Status {
    id: number = 0
    status?: string
    deleted_at?: string | null
    deleted_by?: number | null
    created_at?: string | null
    created_by?: number | null
    created_by_name?: string | null
    updated_at?: string | null
    updated_by?: number | null
    updated_by_name?: string | null
}

//customers
export class Customer {
    id: number = 0
    address?: string
    phone?: string
    customer_name?: string
    email?: string
    deleted_at?: string | null
    deleted_by?: number | null
    created_at?: string | null
    created_by?: number | null
    created_by_name?: string | null
    updated_at?: string | null
    updated_by?: number | null
    updated_by_name?: string | null
}
//vendors
export class Vendor {
    id: number = 0
    address?: string
    cell?: string
    contact_person?: string
    company?: string
    email?: string
    deleted_at?: string | null
    deleted_by?: number | null
    created_at?: string | null
    created_by?: number | null
    created_by_name?: string | null
    updated_at?: string | null
    updated_by?: number | null
    updated_by_name?: string | null
}



//categories
export class Category {
    id: number = 0
    cname?: string
    deleted_at?: string | null
    deleted_by?: number | null
    created_at?: string | null
    created_by?: number | null
    created_by_name?: string | null
    updated_at?: string | null
    updated_by?: number | null
    updated_by_name?: string | null
}
//products
export class Product {
    id: number = 0
    pname?: string
    pcode?: string
    pcate?: number
    price?: number
    stock_quantity?: number
    reorder_level?: number
    createdate?: Date
    deleted_at?: string | null
    deleted_by?: number | null
    created_at?: string | null
    created_by?: number | null
    created_by_name?: string | null
    updated_at?: string | null
    updated_by?: number | null
    updated_by_name?: string | null
}
export class LowStockItem {
    id: number = 0
    pcode?: string
    pname?: string
    reorder_level?: number
    stock_quantity?: number
}
//stocks
export class Stock {
    id: number = 0
    quantity?: number
    productid?: number
    warehouseid?: number
    updatedate?: Date
    deleted_at?: string | null
    deleted_by?: number | null
    created_at?: string | null
    created_by?: number | null
    created_by_name?: string | null
    updated_at?: string | null
    updated_by?: number | null
    updated_by_name?: string | null
}
//orders
export type PoStatus = 'draft' | 'sent' | 'partial' | 'received' | 'cancelled';

export const PO_TRANSITIONS: Record<PoStatus, PoStatus[]> = {
    draft:     ['sent', 'cancelled'],
    sent:      ['partial', 'received', 'cancelled'],
    partial:   ['received', 'cancelled'],
    received:  [],
    cancelled: [],
};

export class Order {

    id: number = 0
    quantity?: number
    productid?: number
    statusid?: number
    vendorid?: number
    warehouseid?: number
    warehouse_name?: string | null
    unit_price?: number
    total_price?: number
    po_status: PoStatus = 'draft'
    status_changed_by?: number | null
    status_changed_by_name?: string | null
    status_changed_at?: string | null
    createdate?: Date
    deleted_at?: string | null
    deleted_by?: number | null
    created_at?: string | null
    created_by?: number | null
    created_by_name?: string | null
    updated_at?: string | null
    updated_by?: number | null
    updated_by_name?: string | null

}
//delivery
export type ShipmentStatus = 'pending' | 'packed' | 'shipped' | 'delivered' | 'returned';

export const SHIPMENT_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
    pending:   ['packed', 'returned'],
    packed:    ['shipped', 'returned'],
    shipped:   ['delivered', 'returned'],
    delivered: [],
    returned:  [],
};

export class Delivery {

    id: number = 0
    quantity?: number
    productid?: number
    statusid?: number
    customerid?: number
    warehouseid?: number
    warehouse_name?: string | null
    unit_price?: number
    total_price?: number
    deliverydate?: Date
    createdate?: Date
    shipment_status: ShipmentStatus = 'pending'
    tracking_number?: string | null
    shipping_address?: string | null
    carrier?: string | null
    status_changed_by?: number | null
    status_changed_by_name?: string | null
    status_changed_at?: string | null
    deleted_at?: string | null
    deleted_by?: number | null
    created_at?: string | null
    created_by?: number | null
    created_by_name?: string | null
    updated_at?: string | null
    updated_by?: number | null
    updated_by_name?: string | null
}

// returns
export type ReturnStatus = 'requested' | 'approved' | 'rejected';

export const RETURN_TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
    requested: ['approved', 'rejected'],
    approved:  [],
    rejected:  [],
};

export class Return {
    id: number = 0
    delivery_id?: number
    productid?: number
    pname?: string
    pcode?: string
    customerid?: number
    customer_name?: string
    qty?: number
    reason?: string | null
    status: ReturnStatus = 'requested'
    createdate?: Date
    status_changed_by?: number | null
    status_changed_by_name?: string | null
    status_changed_at?: string | null
    deleted_at?: string | null
    deleted_by?: number | null
    created_at?: string | null
    created_by?: number | null
    created_by_name?: string | null
    updated_at?: string | null
    updated_by?: number | null
}

// stock transfers
export type TransferStatus = 'pending' | 'approved' | 'rejected';

export const TRANSFER_TRANSITIONS: Record<TransferStatus, TransferStatus[]> = {
    pending:  ['approved', 'rejected'],
    approved: [],
    rejected: [],
};

export class StockTransfer {
    id: number = 0
    from_warehouse?: number
    to_warehouse?: number
    from_warehouse_name?: string
    to_warehouse_name?: string
    productid?: number
    pname?: string
    pcode?: string
    qty?: number
    status: TransferStatus = 'pending'
    createdate?: Date
    status_changed_by?: number | null
    status_changed_by_name?: string | null
    status_changed_at?: string | null
    deleted_at?: string | null
    deleted_by?: number | null
    created_at?: string | null
    created_by?: number | null
    created_by_name?: string | null
    updated_at?: string | null
    updated_by?: number | null
}

// Invoice / Billing
export class InvoiceItem {
  id: number = 0;
  invoiceid?: number;
  productid?: number;
  pname?: string;
  pcode?: string;
  description?: string;
  quantity: number = 1;
  unit_price: number = 0;
  total: number = 0;
}

export class Payment {
  id: number = 0;
  invoice_id?: number;
  amount: number = 0;
  method?: string;
  transaction_id?: string | null;
  paid_at?: string;
  note?: string | null;
  created_at?: string | null;
  created_by?: number | null;
  created_by_name?: string | null;
}

export class Invoice {
  id: number = 0;
  invoice_number?: string;
  customerid?: number;
  customer_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  issue_date?: string;
  due_date?: string;
  subtotal: number = 0;
  discount: number = 0;
  tax_percent: number = 0;
  tax_amount: number = 0;
  total: number = 0;
  status: string = 'draft';
  notes?: string;
  createdate?: Date;
  items: InvoiceItem[] = [];
  payments: Payment[] = [];
  paid_amount: number = 0;
  due_amount: number = 0;
  deleted_at?: string | null;
  deleted_by?: number | null;
  created_at?: string | null;
  created_by?: number | null;
  created_by_name?: string | null;
  updated_at?: string | null;
  updated_by?: number | null;
  updated_by_name?: string | null;
}
