import { Component } from '@angular/core';
import { faHeart} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-main-footer',
  templateUrl: './main-footer.component.html',
  styleUrl: './main-footer.component.css'
})
export class MainFooterComponent {

  hearticon = faHeart;

}
