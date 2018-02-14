import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { timer } from 'rxjs/observable/timer';
import * as _ from 'lodash';

import { Activity } from '../activity.model';
import { TextToSpeechService } from '../text-to-speech.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent {

  private _isRunning = false;
  private _notStartedYet = true;

  private _timerObservable: Observable<number>;
  private _timerSubscription: Subscription;

  private _capturedActivities: Activity[] = [];
  private _secondsToNextActivity: number;
  private _activityIndex: number;
  private _roundsCompleted: number;
  private _isTransitioningBetweenActivities: boolean;
  private _lastAnnouncedRound: number;

  startStopText: string;
  activity: Activity;

  @Input() Activities: Activity[];
  @Input() rounds: number;
  @Input() delayBetweenActivitiesInSeconds: number;
  @Input() initialDelayInSeconds: number;

  get isRunning(): boolean {
    return this._isRunning;
  }

  set isRunning(value: boolean) {
    this._isRunning = value;
    this.startStopText = this._isRunning ? 'Pause' : 'Start';
  }

  get displayTime(): string {
    return this._secondsToNextActivity ? this._secondsToNextActivity.toString() : '---';
  }

  get roundDisplay(): string {
    return this._roundsCompleted !== null && this._roundsCompleted >= 0
      ? `Round ${this._roundsCompleted + 1}`
      : '---';
  }

  get activityDisplay(): string {
    return this._isTransitioningBetweenActivities
      ? 'Transitioning...'
      : this.activity
        ? this.activity.name
        : '';
  }

  constructor(private _textToSpeechService: TextToSpeechService) {
    this.isRunning = false;
  }

  startStopTimer(): void {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  resetTimer(): void {
    this.isRunning = false;
    this._notStartedYet = true;
    this._capturedActivities = [];
    this._roundsCompleted = null;
    this._secondsToNextActivity = null;
    this.activity = null;
    this._isTransitioningBetweenActivities = false;

    if (this._timerSubscription) {
      this._timerSubscription.unsubscribe();
    }
  }

  private startTimer(): void {
    if (this._notStartedYet) {
      if (!this.Activities || this.Activities.length === 0) {
        alert('You need to add some Activities before running the timer!');
        return;
      }

      this.initialStart();
    }

    this._timerSubscription = this._timerObservable.subscribe(x => this.onTick(x));
    this.isRunning = true;
  }

  private initialStart(): void {
    this._notStartedYet = false;
    this._capturedActivities = _.cloneDeep(this.Activities);
    this._activityIndex = -1;
    this._roundsCompleted = 0;
    this._isTransitioningBetweenActivities = true;
    this._lastAnnouncedRound = null;

    if (this.initialDelayInSeconds > 0) {
      this._secondsToNextActivity = this.initialDelayInSeconds;
      this.announceTransition();
    } else {
      this.startNextActivity();
    }

    this._timerObservable = timer(1000, 1000);
  }

  private pauseTimer(): void {
    this.isRunning = false;

    if (this._timerSubscription) {
      this._timerSubscription.unsubscribe();
    }
  }

  private startNextActivity(): void {
    if (!this._capturedActivities) {
      return;
    }

    if (this.startTransitionIfNeeded()) {
      return;
    }

    ++this._activityIndex;

    if (this._activityIndex >= this._capturedActivities.length) {
      this._activityIndex = 0;
      ++this._roundsCompleted;

      if (this._roundsCompleted >= this.rounds) {
        this._textToSpeechService.speak('All done');
        this.resetTimer();
        return;
      }
    }

    this.activity = this._capturedActivities[this._activityIndex];
    this._secondsToNextActivity = this.activity.lengthInSeconds;

    const currentRound = this._roundsCompleted + 1;

    if (this._lastAnnouncedRound !== currentRound) {
      this._lastAnnouncedRound = currentRound;
      this._textToSpeechService.speak(`Round ${currentRound}`);
    }

    this._textToSpeechService.speak(`Start ${this.activity.name}`);
  }

  private onTick(second: number): void {
    --this._secondsToNextActivity;

    if (this._secondsToNextActivity <= 0) {
      this.startNextActivity();
    } else if (!this._isTransitioningBetweenActivities) {
      if (this._secondsToNextActivity % 10 === 0) {
        this._textToSpeechService.speak(`${this._secondsToNextActivity} seconds`);
      } else if (this._secondsToNextActivity <= 5) {
        this._textToSpeechService.speak(this._secondsToNextActivity.toString());
      }
    }
  }

  private startTransitionIfNeeded(): boolean {
    // If the last 'activity' was a transition period, end the transition and return false
    // to indicate no transition period is needed since we just finished it.
    if (this._isTransitioningBetweenActivities) {
      this._isTransitioningBetweenActivities = false;
      return false;
    }

    const transitionNeeded = this.delayBetweenActivitiesInSeconds && this.delayBetweenActivitiesInSeconds > 0;

    // Don't begin a transition if there isn't a transition period set, or if the last
    // activity completed was the last activity of the last round (meaning there's no need
    // to transition to another activity since we're done).
    if (!transitionNeeded || this.isOnLastActivityOfLastRound()) {
      return false;
    }

    this._isTransitioningBetweenActivities = true;
    this._secondsToNextActivity = this.delayBetweenActivitiesInSeconds;

    this.announceTransition();

    return true;
  }

  private isOnLastActivityOfLastRound(): boolean {
    const onLastActivity = this._activityIndex === this._capturedActivities.length - 1;
    const onLastRound = this._roundsCompleted === this.rounds - 1;

    return onLastActivity && onLastRound;
  }

  private previewNextActivity(): string {
    const nextActivityIndex = this._activityIndex < this._capturedActivities.length - 1
      ? this._activityIndex + 1
      : 0;

    return this._capturedActivities[nextActivityIndex].name;
  }

  private announceTransition(): void {
    this._textToSpeechService.speak(`Get ready for ${this.previewNextActivity()}`);
  }

}
