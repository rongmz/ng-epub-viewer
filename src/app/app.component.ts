import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ThemeActionSheetComponent } from './theme-action-sheet/theme-action-sheet.component';
import { EPubService, Bookmark } from './e-pub/e-pub.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  lastSearchResults: [] = undefined;
  isSearching: boolean = false;

  constructor(private _bottomSheet: MatBottomSheet,
    public ePubService: EPubService,
    private _snackBar: MatSnackBar) {
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
    if(this.ePubService.isCurrentPageBookmarked) {
      this.ePubService.removeBookmark(null, true).then(() => {
        this._snackBar.open('Bookmark Removed', '', {
          duration: 1500,
        });
      });
    } else {
      this.ePubService.bookmarkCurrentPage().then(() => {
        this._snackBar.open('Bookmarked Successfully', '', {
          duration: 1500,
        });
      });
    }
  }

  /**
   * Search function call
   * @param searchText the text to search with
   */
  doSearch(searchText: string) {
    this.isSearching = true;
    this.ePubService.searchBook(searchText).then((results:[]) => {
      console.log('search==', searchText, results);
      this.lastSearchResults = results;
      this.isSearching = false;
    }).catch(err => {
      console.log('Some error while searching', err);
    });
  }

  /**
   * Jumpt to specific search text
   * @param searchItem the search item
   */
  jumpFromSearchResults(searchItem: any) {
    this.ePubService.jumpToCfi(searchItem.cfi).finally(() => {
      this.rightDrawer.close();
    });
  }


  /**
   * Jumpt to specific search text
   * @param searchItem the search item
   */
  jumpFromBookmark(bookmark: Bookmark) {
    console.log('jump to bookmarked page=', bookmark);
    this.ePubService.jumpToCfi(bookmark.endCfi, bookmark.themes).finally(() => {
      this.rightDrawer.close();
    });
  }

}
