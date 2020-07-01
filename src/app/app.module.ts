import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphicComponent } from './graphic/graphic.component';
import { PopupComponent } from './popup/popup.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { RhythmChannelComponent } from './rhythm-channel/rhythm-channel.component';
import { DialogComponent } from './dialog/dialog.component';
import {MatButtonModule, MatDialogModule} from '@angular/material';
import {DialogService} from './services/dialog.service';


@NgModule({
  declarations: [
    AppComponent,
    GraphicComponent,
    PopupComponent,
    RhythmChannelComponent,
    DialogComponent
  ],
  entryComponents: [
    DialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDialogModule
  ],
  providers: [
    DialogService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
