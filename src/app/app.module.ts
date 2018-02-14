import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { TimerComponent } from './timer/timer.component';
import { ActivityListComponent } from './activity-list/activity-list.component';
import { ActivityListItemComponent } from './activity-list-item/activity-list-item.component';
import { TextToSpeechService } from './text-to-speech.service';

@NgModule({
  declarations: [
    AppComponent,
    TimerComponent,
    ActivityListComponent,
    ActivityListItemComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [TextToSpeechService],
  bootstrap: [AppComponent]
})
export class AppModule { }
