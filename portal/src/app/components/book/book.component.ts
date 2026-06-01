import { Component, OnInit } from '@angular/core';
import { Book } from '../../model/inventory.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ProductService } from '../../services/product.service';


@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrl: './book.component.css'
})
export class BookComponent implements OnInit{


  title: string = "Book list";
  title2: string = "Book Entry Form";
  menuType: boolean = true;
  //font awesome
  fatrash = faTrash
  editicon = faPenToSquare

  books: Book[] = []
  bookForm!: FormGroup
  bookModel: Book = new Book();

  constructor(private service:ProductService,
    private formBuilder:FormBuilder
  ){}


  ngOnInit(): void {
    this.initBookForm();
    this.loadBook();
  }

  initBookForm(){
    this.bookForm = this.formBuilder.group({
      name:['',Validators.required],
      price:['',Validators.required],
      dept_id:['',Validators.required],
    })
  }

  //all book
  loadBook(){
    this.service.getAllBook().subscribe({
      next:res=>{
        this.books = res;
        console.log(res);
      },
      error:err=>{
        console.log(err);
      }
    })
  }
  //delete book
  deleteBook(bookId:number){
    this.service.deleteBook(bookId).subscribe({
      next:res=>{
        alert("book deleted sucessfully.");
        this.loadBook()
      },
      error:err=>{
        alert("Data not deleted");
        console.log(err);
      }
    })
  }
  //create new book
  onSubmit(){
    if(this.bookForm.valid){
      const bookData:Book = this.bookForm.value;
      this.service.createBook(bookData).subscribe({
        next:res=>{
          alert("Book created sucessfully.")
          this.loadBook()
          this.bookForm.reset();
        },
        error:err=>{
          alert("Data not deleted")
          console.log(err);
        }
      })
    }
  }
  onEditById(bookrow:any){
    this.menuType = false;
    this.bookModel.id = bookrow.id;
    this.bookForm.controls['name'].setValue(bookrow.name)
    this.bookForm.controls['price'].setValue(bookrow.price)
    this.bookForm.controls['dept_id'].setValue(bookrow.dept_id)
  }

  editbook(){
    if(this.bookForm.valid){
      this.bookModel.name = this.bookForm.value.name;
      this.bookModel.price = this.bookForm.value.price;
      this.bookModel.dept_id = this.bookForm.value.dept_id;
      this.service.updateBook(this.bookModel.id,this.bookModel).subscribe({
        next:res=>{
          alert("Book updated sucessfully.")
          this.loadBook()
          this.bookForm.reset()
        },
        error:err=>{
          alert("Data not updated.")
          console.log(err);
        }
      })
    }
  }



}
