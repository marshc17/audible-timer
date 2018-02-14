import { Component } from '@angular/core';
import { Activity } from './activity.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  Activities: Activity[] = [];
  rounds = 1;
  delayBetweenActivitiesInSeconds = 5;
  initialDelayInSeconds = 5;

  roundChanged(keyEvent: any): void {
    this.rounds = keyEvent.target.value;
  }

  delayChanged(keyEvent: any): void {
    this.delayBetweenActivitiesInSeconds = keyEvent.target.value;
  }

  initialDelayChanged(keyEvent: any): void {
    this.initialDelayInSeconds = keyEvent.target.value;
  }
}
