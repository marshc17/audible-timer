import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Activity } from '../activity.model';

@Component({
  selector: 'app-activity-list-item',
  templateUrl: './activity-list-item.component.html',
  styleUrls: ['./activity-list-item.component.css']
})
export class ActivityListItemComponent {

  @Input() activity: Activity;
  @Output() delete: EventEmitter<string> = new EventEmitter();

  deleteActivity(): void {
    this.delete.emit(this.activity.id);
  }

}
