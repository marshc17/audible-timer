import { Component } from '@angular/core';
import { Action } from './action.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  actions: Action[] = [];
  rounds = 1;
  delayBetweenActionsInSeconds = 5;
  initialDelayInSeconds = 5;

  roundChanged(keyEvent: any): void {
    this.rounds = keyEvent.target.value;
  }

  delayChanged(keyEvent: any): void {
    this.delayBetweenActionsInSeconds = keyEvent.target.value;
  }

  initialDelayChanged(keyEvent: any): void {
    this.initialDelayInSeconds = keyEvent.target.value;
  }
}
