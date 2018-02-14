import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Action } from '../action.model';

@Component({
  selector: 'app-action-list',
  templateUrl: './action-list.component.html',
  styleUrls: ['./action-list.component.css']
})
export class ActionListComponent {

  @Input() actions: Action[] = [];
  @Output() actionsChange: EventEmitter<Action[]> = new EventEmitter();

  addAction(name: string, lengthInSeconds: number): void {
    this.actions.push(new Action(name, lengthInSeconds));
    this.actionsChange.emit(this.actions);
  }

  deleteAction(id: string): void {
    this.actions = this.actions.filter(x => x.id !== id);
    this.actionsChange.emit(this.actions);
  }

}
