import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Activity } from '../activity.model';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.css']
})
export class ActivityListComponent {

  @Input() Activities: Activity[] = [];
  @Output() ActivitiesChange: EventEmitter<Activity[]> = new EventEmitter();

  addActivity(name: string, lengthInSeconds: number): void {
    this.Activities.push(new Activity(name, lengthInSeconds));
    this.ActivitiesChange.emit(this.Activities);
  }

  deleteActivity(id: string): void {
    this.Activities = this.Activities.filter(x => x.id !== id);
    this.ActivitiesChange.emit(this.Activities);
  }

}
