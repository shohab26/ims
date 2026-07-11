
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
export class Order {

    id: number = 0
    quantity?: number
    productid?: number
    statusid?: number
    vendorid?: number
    unit_price?: number
    total_price?: number
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
export class Delivery {

    id: number = 0
    quantity?: number
    productid?: number
    statusid?: number
    customerid?: number
    unit_price?: number
    total_price?: number
    deliverydate?: Date
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
  deleted_at?: string | null;
  deleted_by?: number | null;
  created_at?: string | null;
  created_by?: number | null;
  created_by_name?: string | null;
  updated_at?: string | null;
  updated_by?: number | null;
  updated_by_name?: string | null;
}
