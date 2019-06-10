import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import epub, { Book, Rendition } from 'epubjs';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ThemeActionSheetComponent } from './theme-action-sheet/theme-action-sheet.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('leftDrawer', { static: true }) leftDrawer: MatDrawer;
  @ViewChild('rightDrawer', { static: true }) rightDrawer: MatDrawer;
  epubFile: string;
  //rightPaneAction: string = '';
  contentLoading: boolean = true;

  epubBook: Book;
  ePubRendition: Rendition;
  epubBookCover: string;
  epubBookTitle: string;
  epubBookAuthor: string;
  readingAreaRect: ClientRect;
  currentChapterReadingProgress: number = 0;
  isCurrentPageBookmarked: boolean = false;

  constructor(private _bottomSheet: MatBottomSheet) {
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
      this.epubBook = epub(this.epubFile);
      this.readingAreaRect = document.getElementById('bcontainer').getBoundingClientRect();
      this.ePubRendition = this.epubBook.renderTo('book_content',
                               {width:this.readingAreaRect.width, height:this.readingAreaRect.height})
      this.ePubRendition.display().then(() => {
        this.contentLoading = false;
        let coverUrl = (<any>this.epubBook).cover;
        this.epubBook.archive.getBase64(coverUrl).then((data) => this.epubBookCover = data);
        this.epubBook.loaded.metadata.then((metadata) => {
          this.epubBookTitle = metadata.title;
          this.epubBookAuthor = metadata.creator;
          console.log('info=', this.epubBookTitle, this.epubBookAuthor);
        });
        console.log('book=', this.epubBook, 'rendition=', this.ePubRendition, 'cover=', this.epubBookCover);
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
    this.readingAreaRect = document.getElementById('bcontainer').getBoundingClientRect();
    if(this.ePubRendition) this.ePubRendition.prev().finally(()=> {
      this.ePubRendition.resize(this.readingAreaRect.width, this.readingAreaRect.height);
      this.contentLoading = false;
      this.updateProgressbar();
    });
  }

  /**
   * Called while right swipe
   */
  bookSwipeRight() {
    this.contentLoading = true;
    this.readingAreaRect = document.getElementById('bcontainer').getBoundingClientRect();
    if(this.ePubRendition) this.ePubRendition.next().finally(()=> {
      this.ePubRendition.resize(this.readingAreaRect.width, this.readingAreaRect.height);
      this.contentLoading = false;
      this.updateProgressbar();
    });
  }

  /**
   * This function emulates swipe from click event
   * @param e click event
   */
  emulateSwipe(e) {
    this.readingAreaRect = document.getElementById('bcontainer').getBoundingClientRect();
    this.ePubRendition.resize(this.readingAreaRect.width, this.readingAreaRect.height);
    let rect = document.body.getBoundingClientRect();
    if(e.clientX <= rect.width/3) this.bookSwipeLeft();
    else if(e.clientX >= rect.width*2/3) this.bookSwipeRight();
  }

  /**
   * This method is used to jump to specific chapter from TOC
   * @param tocitem item from table of contents
   */
  gotoFromToc(tocitem) {
    // this.readingAreaRect = document.getElementById('bcontainer').getBoundingClientRect();
    let sec = this.epubBook.spine.get(tocitem.href);
    console.log('section=',sec);
    this.contentLoading = true;
    this.ePubRendition.display(sec.index).then(() => {
      // this.ePubRendition.resize(this.readingAreaRect.width, this.readingAreaRect.height);
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
    let loc = this.ePubRendition.currentLocation();
    // console.log('location', loc);
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
