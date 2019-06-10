import { Component, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-theme-action-sheet',
  templateUrl: './theme-action-sheet.component.html',
  styleUrls: ['./theme-action-sheet.component.scss']
})
export class ThemeActionSheetComponent implements OnInit {

  constructor(private _bottomSheetRef: MatBottomSheetRef<ThemeActionSheetComponent>) { }

  ngOnInit() {
  }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

}
