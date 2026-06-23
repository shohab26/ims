import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Book, Warehouse, Category, Product, Status, Customer, Vendor, Stock, Order, Delivery, Invoice } from '../model/inventory.model';
import { HttpClient } from '@angular/common/http';

export interface PagedResult<T> { data: T[]; total: number; page: number; totalPages: number; }

@Injectable({ providedIn: 'root' })
export class ProductService {
  baseUrl = "http://localhost:3001";
  constructor(private http: HttpClient) {}

  // status
  findAllStatus(page=1, limit=10): Observable<PagedResult<Status>> {
    return this.http.get<PagedResult<Status>>(`${this.baseUrl}/status/?page=${page}&limit=${limit}`);
  }
  findStatusByKeyword(kw: string, page=1, limit=10): Observable<PagedResult<Status>> {
    return this.http.get<PagedResult<Status>>(`${this.baseUrl}/status/search?value=${kw}&page=${page}&limit=${limit}`);
  }
  findTrashStatus(page=1, limit=10): Observable<PagedResult<Status>> {
    return this.http.get<PagedResult<Status>>(`${this.baseUrl}/status/trash?page=${page}&limit=${limit}`);
  }
  findStatusById(id: number): Observable<Status> { return this.http.get<Status>(`${this.baseUrl}/status/${id}`); }
  createStatus(s: Status): Observable<Status> { return this.http.post<Status>(`${this.baseUrl}/status`, s); }
  updateStatus(id: number, s: Status): Observable<Status> { return this.http.patch<Status>(`${this.baseUrl}/status/update/${id}`, s); }
  deleteStatus(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/status/${id}`); }
  restoreStatus(id: number): Observable<Status> { return this.http.post<Status>(`${this.baseUrl}/status/restore/${id}`, {}); }

  // warehouse
  findAllWarehouse(page=1, limit=10): Observable<PagedResult<Warehouse>> {
    return this.http.get<PagedResult<Warehouse>>(`${this.baseUrl}/warehouse/?page=${page}&limit=${limit}`);
  }
  findWarehouseByKeyword(kw: string, page=1, limit=10): Observable<PagedResult<Warehouse>> {
    return this.http.get<PagedResult<Warehouse>>(`${this.baseUrl}/warehouse/search?value=${kw}&page=${page}&limit=${limit}`);
  }
  findTrashWarehouse(page=1, limit=10): Observable<PagedResult<Warehouse>> {
    return this.http.get<PagedResult<Warehouse>>(`${this.baseUrl}/warehouse/trash?page=${page}&limit=${limit}`);
  }
  findWarehouseById(id: number): Observable<Warehouse> { return this.http.get<Warehouse>(`${this.baseUrl}/warehouse/${id}`); }
  createWarehouse(w: Warehouse): Observable<Warehouse> { return this.http.post<Warehouse>(`${this.baseUrl}/warehouse`, w); }
  updateWarehoue(id: number, w: Warehouse): Observable<Warehouse> { return this.http.patch<Warehouse>(`${this.baseUrl}/warehouse/update/${id}`, w); }
  deleteWarehouse(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/warehouse/${id}`); }
  restoreWarehouse(id: number): Observable<Warehouse> { return this.http.post<Warehouse>(`${this.baseUrl}/warehouse/restore/${id}`, {}); }

  // categories
  findAllCategory(page=1, limit=10): Observable<PagedResult<Category>> {
    return this.http.get<PagedResult<Category>>(`${this.baseUrl}/categories/?page=${page}&limit=${limit}`);
  }
  findCategoryByKeyword(kw: string, page=1, limit=10): Observable<PagedResult<Category>> {
    return this.http.get<PagedResult<Category>>(`${this.baseUrl}/categories/search?value=${kw}&page=${page}&limit=${limit}`);
  }
  findTrashCategory(page=1, limit=10): Observable<PagedResult<Category>> {
    return this.http.get<PagedResult<Category>>(`${this.baseUrl}/categories/trash?page=${page}&limit=${limit}`);
  }
  findCategoryById(id: number): Observable<Category> { return this.http.get<Category>(`${this.baseUrl}/categories/${id}`); }
  createCategory(c: Category): Observable<Category> { return this.http.post<Category>(`${this.baseUrl}/categories`, c); }
  updateCategory(id: number, c: Category): Observable<Category> { return this.http.patch<Category>(`${this.baseUrl}/categories/update/${id}`, c); }
  deleteCategory(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/categories/${id}`); }
  restoreCategory(id: number): Observable<Category> { return this.http.post<Category>(`${this.baseUrl}/categories/restore/${id}`, {}); }

  // products
  findAllProduct(page=1, limit=10): Observable<PagedResult<Product>> {
    return this.http.get<PagedResult<Product>>(`${this.baseUrl}/products/?page=${page}&limit=${limit}`);
  }
  findProductByKeyword(kw: string, page=1, limit=10): Observable<PagedResult<Product>> {
    return this.http.get<PagedResult<Product>>(`${this.baseUrl}/products/search?value=${kw}&page=${page}&limit=${limit}`);
  }
  findTrashProduct(page=1, limit=10): Observable<PagedResult<Product>> {
    return this.http.get<PagedResult<Product>>(`${this.baseUrl}/products/trash?page=${page}&limit=${limit}`);
  }
  findProductById(id: number): Observable<Product> { return this.http.get<Product>(`${this.baseUrl}/products/${id}`); }
  createProduct(p: Product): Observable<Product> { return this.http.post<Product>(`${this.baseUrl}/products`, p); }
  updateProduct(id: number, p: Product): Observable<Product> { return this.http.patch<Product>(`${this.baseUrl}/products/update/${id}`, p); }
  deleteProduct(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/products/${id}`); }
  restoreProduct(id: number): Observable<Product> { return this.http.post<Product>(`${this.baseUrl}/products/restore/${id}`, {}); }

  // customers
  findAllCustomer(page=1, limit=10): Observable<PagedResult<Customer>> {
    return this.http.get<PagedResult<Customer>>(`${this.baseUrl}/customers/?page=${page}&limit=${limit}`);
  }
  findCustomerByKeyword(kw: string, page=1, limit=10): Observable<PagedResult<Customer>> {
    return this.http.get<PagedResult<Customer>>(`${this.baseUrl}/customers/search?value=${kw}&page=${page}&limit=${limit}`);
  }
  findTrashCustomer(page=1, limit=10): Observable<PagedResult<Customer>> {
    return this.http.get<PagedResult<Customer>>(`${this.baseUrl}/customers/trash?page=${page}&limit=${limit}`);
  }
  findCustomerById(id: number): Observable<Customer> { return this.http.get<Customer>(`${this.baseUrl}/customers/${id}`); }
  createCustomer(c: Customer): Observable<Customer> { return this.http.post<Customer>(`${this.baseUrl}/customers`, c); }
  updateCustomer(id: number, c: Customer): Observable<Customer> { return this.http.patch<Customer>(`${this.baseUrl}/customers/update/${id}`, c); }
  deleteCustomer(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/customers/${id}`); }
  restoreCustomer(id: number): Observable<Customer> { return this.http.post<Customer>(`${this.baseUrl}/customers/restore/${id}`, {}); }

  // vendors
  findAllVendor(page=1, limit=10): Observable<PagedResult<Vendor>> {
    return this.http.get<PagedResult<Vendor>>(`${this.baseUrl}/vendors/?page=${page}&limit=${limit}`);
  }
  findVendorByKeyword(kw: string, page=1, limit=10): Observable<PagedResult<Vendor>> {
    return this.http.get<PagedResult<Vendor>>(`${this.baseUrl}/vendors/search?value=${kw}&page=${page}&limit=${limit}`);
  }
  findTrashVendor(page=1, limit=10): Observable<PagedResult<Vendor>> {
    return this.http.get<PagedResult<Vendor>>(`${this.baseUrl}/vendors/trash?page=${page}&limit=${limit}`);
  }
  findVendorById(id: number): Observable<Vendor> { return this.http.get<Vendor>(`${this.baseUrl}/vendors/${id}`); }
  createVendor(v: Vendor): Observable<Vendor> { return this.http.post<Vendor>(`${this.baseUrl}/vendors`, v); }
  updateVendor(id: number, v: Vendor): Observable<Vendor> { return this.http.patch<Vendor>(`${this.baseUrl}/vendors/update/${id}`, v); }
  deleteVendor(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/vendors/${id}`); }
  restoreVendor(id: number): Observable<Vendor> { return this.http.post<Vendor>(`${this.baseUrl}/vendors/restore/${id}`, {}); }

  // stocks
  findAllStock(page=1, limit=10): Observable<PagedResult<Stock>> {
    return this.http.get<PagedResult<Stock>>(`${this.baseUrl}/stocks/?page=${page}&limit=${limit}`);
  }
  findStockByKeyword(kw: string, page=1, limit=10): Observable<PagedResult<Stock>> {
    return this.http.get<PagedResult<Stock>>(`${this.baseUrl}/stocks/search?value=${kw}&page=${page}&limit=${limit}`);
  }
  findTrashStock(page=1, limit=10): Observable<PagedResult<Stock>> {
    return this.http.get<PagedResult<Stock>>(`${this.baseUrl}/stocks/trash?page=${page}&limit=${limit}`);
  }
  findStockById(id: number): Observable<Stock> { return this.http.get<Stock>(`${this.baseUrl}/stocks/${id}`); }
  createStock(s: Stock): Observable<Stock> { return this.http.post<Stock>(`${this.baseUrl}/stocks`, s); }
  updateStock(id: number, s: Stock): Observable<Stock> { return this.http.patch<Stock>(`${this.baseUrl}/stocks/update/${id}`, s); }
  deleteStock(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/stocks/${id}`); }
  restoreStock(id: number): Observable<Stock> { return this.http.post<Stock>(`${this.baseUrl}/stocks/restore/${id}`, {}); }

  // orders
  findAllOrder(page=1, limit=10): Observable<PagedResult<Order>> {
    return this.http.get<PagedResult<Order>>(`${this.baseUrl}/orders/?page=${page}&limit=${limit}`);
  }
  findOrderByKeyword(kw: string, page=1, limit=10): Observable<PagedResult<Order>> {
    return this.http.get<PagedResult<Order>>(`${this.baseUrl}/orders/search?value=${kw}&page=${page}&limit=${limit}`);
  }
  findTrashOrder(page=1, limit=10): Observable<PagedResult<Order>> {
    return this.http.get<PagedResult<Order>>(`${this.baseUrl}/orders/trash?page=${page}&limit=${limit}`);
  }
  findOrderById(id: number): Observable<Order> { return this.http.get<Order>(`${this.baseUrl}/orders/${id}`); }
  findLatestOrder(): Observable<Order[]> { return this.http.get<Order[]>(`${this.baseUrl}/orders/latest`); }
  findTotalOrder(): Observable<Order[]> { return this.http.get<Order[]>(`${this.baseUrl}/orders/total`); }
  createOrder(o: Order): Observable<Order> { return this.http.post<Order>(`${this.baseUrl}/orders`, o); }
  updateOrder(id: number, o: Order): Observable<Order> { return this.http.patch<Order>(`${this.baseUrl}/orders/update/${id}`, o); }
  deleteOrder(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/orders/${id}`); }
  restoreOrder(id: number): Observable<Order> { return this.http.post<Order>(`${this.baseUrl}/orders/restore/${id}`, {}); }

  // delivery
  findAllDelivery(page=1, limit=10): Observable<PagedResult<Delivery>> {
    return this.http.get<PagedResult<Delivery>>(`${this.baseUrl}/delivery/?page=${page}&limit=${limit}`);
  }
  findDeliveryByKeyword(kw: string, page=1, limit=10): Observable<PagedResult<Delivery>> {
    return this.http.get<PagedResult<Delivery>>(`${this.baseUrl}/delivery/search?value=${kw}&page=${page}&limit=${limit}`);
  }
  findTrashDelivery(page=1, limit=10): Observable<PagedResult<Delivery>> {
    return this.http.get<PagedResult<Delivery>>(`${this.baseUrl}/delivery/trash?page=${page}&limit=${limit}`);
  }
  findDeliveryById(id: number): Observable<Delivery> { return this.http.get<Delivery>(`${this.baseUrl}/delivery/${id}`); }
  findLatestDelivery(): Observable<Delivery[]> { return this.http.get<Delivery[]>(`${this.baseUrl}/delivery/latest`); }
  findTotalDelivery(): Observable<Delivery[]> { return this.http.get<Delivery[]>(`${this.baseUrl}/delivery/total`); }
  createDelivery(d: Delivery): Observable<Delivery> { return this.http.post<Delivery>(`${this.baseUrl}/delivery`, d); }
  updateDelivery(id: number, d: Delivery): Observable<Delivery> { return this.http.patch<Delivery>(`${this.baseUrl}/delivery/update/${id}`, d); }
  deleteDelivery(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/delivery/${id}`); }
  restoreDelivery(id: number): Observable<Delivery> { return this.http.post<Delivery>(`${this.baseUrl}/delivery/restore/${id}`, {}); }

  // book (legacy)
  getAllBook(): Observable<Book[]> { return this.http.get<Book[]>(`${this.baseUrl}/book/`); }
  getBookById(id: number): Observable<Book> { return this.http.get<Book>(`${this.baseUrl}/book/${id}`); }
  createBook(b: Book): Observable<Book> { return this.http.post<Book>(`${this.baseUrl}/book`, b); }
  updateBook(id: number, b: Book): Observable<Book> { return this.http.patch<Book>(`${this.baseUrl}/book/update/${id}`, b); }
  deleteBook(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/book/${id}`); }

  // invoices
  findAllInvoice(page=1, limit=10): Observable<PagedResult<Invoice>> {
    return this.http.get<PagedResult<Invoice>>(`${this.baseUrl}/invoices/?page=${page}&limit=${limit}`);
  }
  findInvoiceByKeyword(kw: string, page=1, limit=10): Observable<PagedResult<Invoice>> {
    return this.http.get<PagedResult<Invoice>>(`${this.baseUrl}/invoices/search?value=${kw}&page=${page}&limit=${limit}`);
  }
  findTrashInvoice(page=1, limit=10): Observable<PagedResult<Invoice>> {
    return this.http.get<PagedResult<Invoice>>(`${this.baseUrl}/invoices/trash?page=${page}&limit=${limit}`);
  }
  findInvoiceById(id: number): Observable<Invoice> { return this.http.get<Invoice>(`${this.baseUrl}/invoices/${id}`); }
  createInvoice(inv: Invoice): Observable<any> { return this.http.post<any>(`${this.baseUrl}/invoices`, inv); }
  updateInvoice(id: number, inv: Invoice): Observable<any> { return this.http.patch<any>(`${this.baseUrl}/invoices/update/${id}`, inv); }
  deleteInvoice(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/invoices/${id}`); }
  restoreInvoice(id: number): Observable<Invoice> { return this.http.post<Invoice>(`${this.baseUrl}/invoices/restore/${id}`, {}); }
  downloadInvoicePDF(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/invoices/${id}/pdf`, { responseType: 'blob' });
  }
}
