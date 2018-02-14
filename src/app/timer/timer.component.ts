import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { timer } from 'rxjs/observable/timer';
import * as _ from 'lodash';

import { Action } from '../action.model';
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

  private _capturedActions: Action[] = [];
  private _secondsToNextAction: number;
  private _actionIndex: number;
  private _roundsCompleted: number;
  private _isTransitioningBetweenActions: boolean;
  private _lastAnnouncedRound: number;

  startStopText: string;
  action: Action;

  @Input() actions: Action[];
  @Input() rounds: number;
  @Input() delayBetweenActionsInSeconds: number;
  @Input() initialDelayInSeconds: number;

  get isRunning(): boolean {
    return this._isRunning;
  }

  set isRunning(value: boolean) {
    this._isRunning = value;
    this.startStopText = this._isRunning ? 'Pause' : 'Start';
  }

  get displayTime(): string {
    return this._secondsToNextAction ? this._secondsToNextAction.toString() : '---';
  }

  get roundDisplay(): string {
    return this._roundsCompleted !== null && this._roundsCompleted >= 0
      ? `Round ${this._roundsCompleted + 1}`
      : '---';
  }

  get actionDisplay(): string {
    return this._isTransitioningBetweenActions
      ? 'Transitioning...'
      : this.action
        ? this.action.name
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
    this._capturedActions = [];
    this._roundsCompleted = null;
    this._secondsToNextAction = null;
    this.action = null;
    this._isTransitioningBetweenActions = false;

    if (this._timerSubscription) {
      this._timerSubscription.unsubscribe();
    }
  }

  private startTimer(): void {
    if (this._notStartedYet) {
      if (!this.actions || this.actions.length === 0) {
        alert('You need to add some actions before running the timer!');
        return;
      }

      this.initialStart();
    }

    this._timerSubscription = this._timerObservable.subscribe(x => this.onTick(x));
    this.isRunning = true;
  }

  private initialStart(): void {
    this._notStartedYet = false;
    this._capturedActions = _.cloneDeep(this.actions);
    this._actionIndex = -1;
    this._roundsCompleted = 0;
    this._isTransitioningBetweenActions = true;
    this._lastAnnouncedRound = null;

    if (this.initialDelayInSeconds > 0) {
      this._secondsToNextAction = this.initialDelayInSeconds;
      this.announceTransition();
    } else {
      this.startNextAction();
    }

    this._timerObservable = timer(1000, 1000);
  }

  private pauseTimer(): void {
    this.isRunning = false;

    if (this._timerSubscription) {
      this._timerSubscription.unsubscribe();
    }
  }

  private startNextAction(): void {
    if (!this._capturedActions) {
      return;
    }

    if (this.startTransitionIfNeeded()) {
      return;
    }

    ++this._actionIndex;

    if (this._actionIndex >= this._capturedActions.length) {
      this._actionIndex = 0;
      ++this._roundsCompleted;

      if (this._roundsCompleted >= this.rounds) {
        this._textToSpeechService.speak('All done');
        this.resetTimer();
        return;
      }
    }

    this.action = this._capturedActions[this._actionIndex];
    this._secondsToNextAction = this.action.lengthInSeconds;

    const currentRound = this._roundsCompleted + 1;

    if (this._lastAnnouncedRound !== currentRound) {
      this._lastAnnouncedRound = currentRound;
      this._textToSpeechService.speak(`Round ${currentRound}`);
    }

    this._textToSpeechService.speak(`Start ${this.action.name}`);
  }

  private onTick(second: number): void {
    --this._secondsToNextAction;

    if (this._secondsToNextAction <= 0) {
      this.startNextAction();
    } else if (!this._isTransitioningBetweenActions) {
      if (this._secondsToNextAction % 10 === 0) {
        this._textToSpeechService.speak(`${this._secondsToNextAction} seconds`);
      } else if (this._secondsToNextAction <= 5) {
        this._textToSpeechService.speak(this._secondsToNextAction.toString());
      }
    }
  }

  private startTransitionIfNeeded(): boolean {
    // If the last 'action' was a transition period, end the transition and return false
    // to indicate no transition period is needed since we just finished it.
    if (this._isTransitioningBetweenActions) {
      this._isTransitioningBetweenActions = false;
      return false;
    }

    const transitionNeeded = this.delayBetweenActionsInSeconds && this.delayBetweenActionsInSeconds > 0;

    // Don't begin a transition if there isn't a transition period set, or if the last
    // action completed was the last action of the last round (meaning there's no need
    // to transition to another action since we're done).
    if (!transitionNeeded || this.isOnLastActionOfLastRound()) {
      return false;
    }

    this._isTransitioningBetweenActions = true;
    this._secondsToNextAction = this.delayBetweenActionsInSeconds;

    this.announceTransition();

    return true;
  }

  private isOnLastActionOfLastRound(): boolean {
    const onLastAction = this._actionIndex === this._capturedActions.length - 1;
    const onLastRound = this._roundsCompleted === this.rounds - 1;

    return onLastAction && onLastRound;
  }

  private previewNextAction(): string {
    const nextActionIndex = this._actionIndex < this._capturedActions.length - 1
      ? this._actionIndex + 1
      : 0;

    return this._capturedActions[nextActionIndex].name;
  }

  private announceTransition(): void {
    this._textToSpeechService.speak(`Get ready for ${this.previewNextAction()}`);
  }

}
