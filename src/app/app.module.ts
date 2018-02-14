import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { TimerComponent } from './timer/timer.component';
import { ActionListComponent } from './action-list/action-list.component';
import { ActionListItemComponent } from './action-list-item/action-list-item.component';
import { TextToSpeechService } from './text-to-speech.service';

@NgModule({
  declarations: [
    AppComponent,
    TimerComponent,
    ActionListComponent,
    ActionListItemComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [TextToSpeechService],
  bootstrap: [AppComponent]
})
export class AppModule { }
