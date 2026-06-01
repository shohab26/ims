
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
}
//status 
export class Status {
    id: number = 0
    status?: string
}

//customers 
export class Customer {
    id: number = 0
    address?: string
    phone?: string
    customer_name?: string
    email?: string
}
//vendors 
export class Vendor {
    id: number = 0
    address?: string
    cell?: string
    contact_person?: string
    company?: string
    email?: string
}



//categories 
export class Category {
    id: number = 0
    cname?: string
}
//products 
export class Product {
    id: number = 0
    pname?: string
    pcode?: string
    pcate?: number
    price?: number
    createdate?: Date
}
//stocks 
export class Stock {
    id: number = 0
    quantity?: number
    productid?: number
    warehouseid?: number
    updatedate?: Date
}
//stocks 
export class Order {

    id: number = 0
    quantity?: number
    productid?: number
    statusid?: number
    vendorid?: number
    unit_price?: number
    total_price?: number
    createdate?: Date


}
//stocks 
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
}