import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Action } from '../action.model';

@Component({
  selector: 'app-action-list-item',
  templateUrl: './action-list-item.component.html',
  styleUrls: ['./action-list-item.component.css']
})
export class ActionListItemComponent {

  @Input() action: Action;
  @Output() delete: EventEmitter<string> = new EventEmitter();

  deleteAction(): void {
    this.delete.emit(this.action.id);
  }

}
