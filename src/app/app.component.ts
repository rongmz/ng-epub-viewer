import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import epub, { Book, Rendition } from 'epubjs';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ThemeActionSheetComponent } from './theme-action-sheet/theme-action-sheet.component';
import { EPubService } from './e-pub/e-pub.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('leftDrawer', { static: true }) leftDrawer: MatDrawer;
  @ViewChild('rightDrawer', { static: true }) rightDrawer: MatDrawer;
  epubFile: string;
  contentLoading: boolean = true;

  readingAreaRect: ClientRect;
  currentChapterReadingProgress: number = 0;

  constructor(private _bottomSheet: MatBottomSheet, public ePubService: EPubService) {
    let params = window.location.search
      .substring(1)
      .split("&")
      .map(v => v.split("="))
      .reduce((map, [key, value]) => map.set(key, decodeURIComponent(value)), new Map());

    this.epubFile = params.get('file');
    console.log('file=', this.epubFile);
  }


  /**
   * This is called and epub file is loaded and displayed
   */
  ngAfterViewInit() {
    if (this.epubFile) {
      this.contentLoading = true;
      this.readingAreaRect = document.getElementById('bcontainer').getBoundingClientRect();
      this.ePubService.loadBook(this.epubFile, 'book_content', {
        width: this.readingAreaRect.width,
        height: this.readingAreaRect.height
      }).then(() => {
        this.contentLoading = false;
      }).catch(err => {
        console.log('some error while reading epub=', err);
      });
    }
  }

  /**
   * Called while left swipe
   */
  bookSwipeLeft() {
    this.contentLoading = true;
    this.ePubService.navPrev('bcontainer').then((rendition) => {
      this.contentLoading = false;
      this.updateProgressbar();
    });
  }

  /**
   * Called while right swipe
   */
  bookSwipeRight() {
    this.contentLoading = true;
    this.ePubService.navNext('bcontainer').then((rendition) => {
      this.contentLoading = false;
      this.updateProgressbar();
    });
  }

  /**
   * This function emulates swipe from click event
   * @param e click event
   */
  emulateSwipe(e) {
    let rect = document.body.getBoundingClientRect();
    if(e.clientX <= rect.width/3) this.bookSwipeLeft();
    else if(e.clientX >= rect.width*2/3) this.bookSwipeRight();
  }

  /**
   * This method is used to jump to specific chapter from TOC
   * @param tocitem item from table of contents
   */
  gotoFromToc(tocitem) {
    this.contentLoading = true;
    this.ePubService.jumpFromTOC(tocitem).then(() => {
      this.contentLoading = false;
      this.updateProgressbar();
      // close left panel
      this.leftDrawer.close();
    }).catch(err => {
      console.log('some error while reading epub=', err);
    });
  }

  /**
   * This function updates the progress bar at bottom
   */
  updateProgressbar() {
    let loc = this.ePubService.ePubRendition.currentLocation();
    loc = (<any>loc).end;
    this.currentChapterReadingProgress = Math.min((100.0 * loc.displayed.page) / loc.displayed.total, 100);
  }

  /**
   * Close the right panel
   */
  closeRightPanel() {
    this.rightDrawer.close();
  }

  /**
   * Open the bookmark pane
   */
  // openBookMarkPane() {
  //   this.rightPaneAction = 'bookmark';
  //   this.rightDrawer.open();
  // }

  /**
   * Open the Search pane
   */
  openRightPane() {
    this.rightDrawer.open();
  }

  /**
   * Open Action sheet for formatting
   */
  openFormattingActionSheet() {
    this._bottomSheet.open(ThemeActionSheetComponent);
  }

  /**
   * Add / Remove current page to/from bookmark
   */
  toggleBookmarkCurrentPage() {
    console.log('toggle bookmark for current page');
  }

  /**
   * Search function call
   * @param searchText the text to search with
   */
  doSearch(searchText: string) {
    console.log('search==', searchText);
  }

}
