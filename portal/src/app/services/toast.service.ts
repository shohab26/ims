import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toast$ = new Subject<Toast>();

  show(message: string, type: Toast['type'] = 'success') {
    this.toast$.next({ message, type });
  }
}
