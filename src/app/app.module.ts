import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { NgMaterialModule } from './ng-material';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ThemeActionSheetComponent } from './theme-action-sheet/theme-action-sheet.component';
import { EPubService } from './e-pub/e-pub.service';

@NgModule({
  declarations: [
    AppComponent,
    ThemeActionSheetComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgMaterialModule,
    AppRoutingModule
  ],
  providers: [
    EPubService,
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    AppComponent,
    ThemeActionSheetComponent
  ]
})
export class AppModule { }
