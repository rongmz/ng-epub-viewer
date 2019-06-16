import { Injectable } from '@angular/core';
import epub, { Book, Rendition } from 'epubjs';
import { RenditionOptions } from 'epubjs/types/rendition';
import { NavItem } from 'epubjs/types/navigation';

@Injectable({
  providedIn: 'root'
})
export class EPubService {

  public themes: Array<Theme> = [
    { name: 'basic', background: '#ffffff', color: '#000000', border: '1px solid #a5a5a5' },
    { name: 'pale', background: '#FFDA8C', color: '#000000', border: '1px solid #FFF' },
    { name: 'dark', background: '#000', color: '#fff', border: '1px solid #000' },
    { name: 'lightdark', background: '#000', color: 'rgb(221, 187, 0)', border: '1px solid #000' },
  ];

  public lineHeightThemes: Array<LineTheme> = [
    { name: '1', lineHeight: '1em' },
    { name: '2', lineHeight: '1.2em' },
    { name: '3', lineHeight: '1.4em' },
    { name: '4', lineHeight: '1.6em' },
    { name: '5', lineHeight: '1.8em' },
    { name: '6', lineHeight: '2em' },
  ];

  public fontSizeThemes: Array<FontSizeTheme> = [
    { name: '~', fontSize: '1em' },
    { name: '17', fontSize: '17px' },
    { name: '22', fontSize: '22px' },
    { name: '25', fontSize: '25px' },
    { name: '29', fontSize: '29px' },
  ];

  public fontTheme: Array<FontTheme> = [
    { name: 'Arial', font: 'Arial' },
    { name: 'Serif', font: 'serif' },
    { name: 'Roboto', font: 'Roboto' },
    { name: 'Monospace', font: 'monospace' },
    { name: 'Verdana', font: 'Verdana' },
    { name: 'Georgia', font: 'Georgia' },
  ];

  public isBookLoaded: boolean = false;
  public epubBookUrl: string;
  public epubBook: Book;
  public ePubRendition: Rendition;
  public epubBookCover: string;
  public epubBookTitle: string;
  public epubBookAuthor: string;
  public isCurrentPageBookmarked: boolean = false;
  public currentBookmarks: Bookmark[] = [];
  private SEARCH_RESULT_LIMIT: number = 20;
  public currentThemes: ThemeMain = {
    page: this.themes[0],
    line: this.lineHeightThemes[0],
    font: this.fontTheme[0],
    fontSize: this.fontSizeThemes[0]
  };

  constructor() { }

  /**
   * This method loads the epub book into specified element.
   * @param bookUrl the url to access the book
   * @param eleId The element id to render into
   * @param options options for rendering
   */
  loadBook(bookUrl: string, eleId: string, options: RenditionOptions): Promise<void> {
    this.epubBookUrl = bookUrl;
    this.epubBook = epub(this.epubBookUrl);
    this.ePubRendition = this.epubBook.renderTo(eleId, options);
    return this.ePubRendition.display().then(() => {
      let coverUrl = (<any>this.epubBook).cover;
      this.epubBook.archive.getBase64(coverUrl).then((data) => this.epubBookCover = data);
      this.epubBook.loaded.metadata.then((metadata) => {
        this.epubBookTitle = metadata.title;
        this.epubBookAuthor = metadata.creator;
        this.getAllBookmarks().then(result => {
          this.currentBookmarks = result;
        });
        // console.log('info=', this.epubBookTitle, this.epubBookAuthor);
      });
      // register themes
      let p = [];
      p.push(new Promise((resolve) => {
        this.themes.forEach((theme, i, arr) => {
          this.ePubRendition.themes.registerRules(theme.name, {
            'body, body *': {
              'color': theme.color + ' !important',
              'background-color': theme.background + ' !important'
            }
          });
          if (i == arr.length - 1) resolve();
        });
      }));
      // register themes
      p.push(new Promise((resolve) => {
        this.lineHeightThemes.forEach((theme, i, arr) => {
          this.ePubRendition.themes.registerRules('line_' + theme.name, {
            '*': {
              'line-height': theme.lineHeight + ' !important',
            },
          });
          if (i == arr.length - 1) resolve();
        });
      }));
      // register themes
      p.push(new Promise((resolve) => {
        this.fontSizeThemes.forEach((theme, i, arr) => {
          this.ePubRendition.themes.registerRules('fontsize_' + theme.name, {
            '*': {
              'font-size': theme.fontSize + ' !important',
            },
          });
          if (i == arr.length - 1) resolve();
        });
      }));
      // register themes
      p.push(new Promise((resolve) => {
        this.fontTheme.forEach((theme, i, arr) => {
          this.ePubRendition.themes.registerRules('font_' + theme.name, {
            'body *': {
              'font-family': theme.font + ' !important',
            },
          });
          if (i == arr.length - 1) resolve();
        });
      }));
      // once all themes registered then set defaults
      Promise.all(p).then(() => {
        this.applyCurrentThemes();
      });
      this.checkIfCurrentPageBookmarked();
      this.getAllBookmarks().then(result => {
        this.currentBookmarks = result;
      });
      console.log('book=', this.epubBook, 'rendition=', this.ePubRendition, 'cover=', this.epubBookCover);
      this.isBookLoaded = true;
    });
  }

  /**
   * Get table of contents for the loaded book
   */
  getBookTOC() {
    if (this.epubBook) {
      return this.epubBook.navigation.toc;
    }
    else return [];
  }

  /**
   * Navigate next page and resize to fit the page
   * @param containerId the container id to resize the page
   */
  navNext(containerId?: string): Promise<Rendition> {
    let readingAreaRect = undefined;
    if (containerId)
      readingAreaRect = document.getElementById('bcontainer').getBoundingClientRect();
    if (this.ePubRendition) return this.ePubRendition.next().then(() => {
      this.checkIfCurrentPageBookmarked();
      if (readingAreaRect)
        this.ePubRendition.resize(readingAreaRect.width, readingAreaRect.height);
      this.applyCurrentThemes();
    }).then(() => this.ePubRendition);
    else return Promise.reject('No rendition');
  }

  /**
   * Navigate previous page and resize to fit the page
   * @param containerId the container id to resize the page
   */
  navPrev(containerId?: string): Promise<Rendition> {
    let readingAreaRect = undefined;
    if (containerId)
      readingAreaRect = document.getElementById('bcontainer').getBoundingClientRect();
    if (this.ePubRendition) return this.ePubRendition.prev().then(() => {
      this.checkIfCurrentPageBookmarked();
      if (readingAreaRect)
        this.ePubRendition.resize(readingAreaRect.width, readingAreaRect.height);
      this.applyCurrentThemes();
    }).then(() => this.ePubRendition);
    else return Promise.reject('No rendition');
  }

  /**
   * Jumps the the specific content from TOC.
   * @param tocItem the seletec item from TOC to jump to
   */
  jumpFromTOC(tocItem: NavItem): Promise<Rendition> {
    let sec = this.epubBook.spine.get(tocItem.href);
    console.log('section=', sec);
    return this.ePubRendition.display(sec.index)
      .then(() => {
        this.applyCurrentThemes();
        this.checkIfCurrentPageBookmarked();
      })
      .then(() => this.ePubRendition);
  }

  /**
   * Apply a new theme on reader
   * @param theme theme to apply
   */
  applyTheme(theme: Theme) {
    this.ePubRendition.themes.select(theme.name);
    this.currentThemes.page = theme;
  }

  /**
   * Apply a line height
   * @param theme theme to apply
   */
  applyLineHeightTheme(theme: LineTheme) {
    this.ePubRendition.themes.select('line_' + theme.name);
    this.currentThemes.line = theme;
  }

  /**
   * Apply a font size
   * @param theme theme to apply
   */
  applyFontSizeTheme(theme: FontSizeTheme) {
    this.ePubRendition.themes.select('fontsize_' + theme.name);
    this.currentThemes.fontSize = theme;
  }

  /**
   * Apply a font
   * @param theme theme to apply
   */
  applyFontTheme(theme: FontTheme) {
    this.ePubRendition.themes.select('font_' + theme.name);
    this.currentThemes.font = theme;
  }

  /**
   * Thie method quickly applies theme to
   */
  applyCurrentThemes() {
    this.applyTheme(this.currentThemes.page);
    this.applyLineHeightTheme(this.currentThemes.line);
    this.applyFontSizeTheme(this.currentThemes.fontSize);
    this.applyFontTheme(this.currentThemes.font);
    this.checkIfCurrentPageBookmarked();
  }

  /**
   * Perform search on book
   * @param searchStr search string
   */
  searchBook(searchStr: string): Promise<[]> {
    return Promise.all(
      (<any>this.epubBook.spine).spineItems.map(item =>
        item.load(this.epubBook.load.bind(this.epubBook))
          .then(item.find.bind(item, searchStr))
          .finally(item.unload.bind(item)))
      ).then(results => Promise.resolve([].concat.apply([], results)))
      .then(results => results.slice(0, this.SEARCH_RESULT_LIMIT));
  }

  /**
   * Jump to section using cfi
   * @param cfi the epub cfi
   * @param withTheme apply cfi with themes
   */
  jumpToCfi(cfi: string, withTheme?: ThemeMain) {
    if (withTheme) {
      this.currentThemes = withTheme;
      this.applyCurrentThemes();
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          this.ePubRendition.display(cfi).then(() => {
            this.applyCurrentThemes();
            this.checkIfCurrentPageBookmarked();
          }).then(() => resolve()).catch((err) => reject(err));
        }, 100);
      });
    } else {
      return this.ePubRendition.display(cfi).then(() => {
        this.applyCurrentThemes();
        this.checkIfCurrentPageBookmarked();
      });
    }
  }

  /**
   * Save current page info into bookmark
   */
  bookmarkCurrentPage(): Promise<void> {
    return new Promise((resolve, reject) => {
      let currPage: any = this.ePubRendition.currentLocation();
      console.log('log', currPage);
      let toc = this.epubBook.navigation.get(currPage.start.href);
      let bookmark: Bookmark = {
        startCfi: currPage.start.cfi,
        endCfi: currPage.end.cfi,
        tocLabel: ((toc&&toc.label)? toc.label.trim(): ''),
        bookmarkDate: new Date().toISOString(),
        themes: this.currentThemes,
      };
      // save to localstorage array
      let savedBookmarks = JSON.parse(localStorage.getItem('NEV_BOOKMARKS'+ this.epubBookTitle) || '{}');
      savedBookmarks[bookmark.startCfi] = bookmark;
      localStorage.setItem('NEV_BOOKMARKS'+ this.epubBookTitle, JSON.stringify(savedBookmarks));
      this.checkIfCurrentPageBookmarked();
      this.getAllBookmarks().then(result => {
        this.currentBookmarks = result;
      });
      resolve();
    });
  }

  /**
   * Check if this page is available in bookmark
   */
  checkIfCurrentPageBookmarked(): Promise<boolean> {
    return new Promise((resolve) => {
      let currPage: any = this.ePubRendition.currentLocation();
      // console.log('checkpoin bookmark curr=', this, this.isCurrentPageBookmarked, currPage.start.cfi);
      // save to localstorage array
      let savedBookmarks = JSON.parse(localStorage.getItem('NEV_BOOKMARKS'+ this.epubBookTitle) || '{}');
      for(let k in savedBookmarks) {
        if(k == currPage.start.cfi) {
          this.isCurrentPageBookmarked = true;
          // console.log('bookmark curr=', this);
          return resolve(this.isCurrentPageBookmarked);
        }
      }
      this.isCurrentPageBookmarked = false;
      return resolve(this.isCurrentPageBookmarked);
    });
  }

  /**
   * Remove Item from bookmark
   * @param bookmarkCfi the bookmark cfi
   */
  removeBookmark(bookmarkCfi: string, isCurrentPage?: boolean): Promise<void> {
    return new Promise((resolve) => {
      let savedBookmarks = JSON.parse(localStorage.getItem('NEV_BOOKMARKS'+ this.epubBookTitle) || '{}');
      if(isCurrentPage) {
        let currPage: any = this.ePubRendition.currentLocation();
        bookmarkCfi = currPage.start.cfi;
      }
      delete savedBookmarks[bookmarkCfi];
      localStorage.setItem('NEV_BOOKMARKS'+ this.epubBookTitle, JSON.stringify(savedBookmarks));
      this.checkIfCurrentPageBookmarked();
      this.getAllBookmarks().then(result => {
        this.currentBookmarks = result;
      });
      resolve();
    });
  }

  /**
   * Get list of all bookmarks
   */
  getAllBookmarks(): Promise<Bookmark[]> {
    return new Promise((resolve) => {
      let savedBookmarks = JSON.parse(localStorage.getItem('NEV_BOOKMARKS'+ this.epubBookTitle) || '{}');
      let toReturn = [];
      for(let k in savedBookmarks) {
        toReturn.push(savedBookmarks[k]);
      }
      resolve(toReturn);
    });
  }

}


export interface Theme {
  name: string;
  background: string;
  color: string;
  border: string;
}
export interface LineTheme {
  name: string;
  lineHeight: string;
}
export interface FontSizeTheme {
  name: string;
  fontSize: string;
}
export interface FontTheme {
  name: string;
  font: string;
}
export interface ThemeMain {
  page: Theme;
  line: LineTheme;
  font: FontTheme;
  fontSize: FontSizeTheme;
}
export interface Bookmark {
  startCfi: string;
  endCfi: string;
  tocLabel: string;
  bookmarkDate: string;
  themes: ThemeMain;
}
