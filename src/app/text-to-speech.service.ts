import { Injectable } from '@angular/core';

export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

const { webkitSpeechRecognition }: IWindow = <IWindow>window;
const { speechSynthesis }: IWindow = <IWindow>window;
const speechRecognition = new webkitSpeechRecognition();

@Injectable()
export class TextToSpeechService {

  private _phraseQueue: string[] = [];
  private _isSpeaking = false;
  private _lastUtterance: SpeechSynthesisUtterance;

  speak(phrase: string): void {
    if (!this._isSpeaking) {
      this.speakInternal(phrase);
    } else {
      this._phraseQueue.push(phrase);
    }
  }

  private speakInternal(phrase: string): void {
    this._isSpeaking = true;

    const utterance = new SpeechSynthesisUtterance(phrase);

    utterance.onend = event => {
      this._isSpeaking = false;
      this.speakNextPhrase();
    };

    // There's a garbage collection issue with the speech recognition library.
    // A reference needs to be maintained to the utterance until it completes.
    // So save the last utterance to keep it alive once this method's scope ends.
    this._lastUtterance = utterance;

    speechSynthesis.speak(utterance);
  }

  private speakNextPhrase(): void {
    if (this._phraseQueue.length <= 0) {
      return;
    }

    const nextPhrase = this._phraseQueue.shift();

    this.speakInternal(nextPhrase);
  }
}
