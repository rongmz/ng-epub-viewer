import { Injectable } from '@angular/core';
import epub, { Book, Rendition } from 'epubjs';
import { RenditionOptions } from 'epubjs/types/rendition';
import { NavItem } from 'epubjs/types/navigation';

@Injectable({
  providedIn: 'root'
})
export class EPubService {

  public isBookLoaded: boolean = false;
  public epubBookUrl: string;
  public epubBook: Book;
  public ePubRendition: Rendition;
  public epubBookCover: string;
  public epubBookTitle: string;
  public epubBookAuthor: string;
  public isCurrentPageBookmarked: boolean = false;

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
        console.log('info=', this.epubBookTitle, this.epubBookAuthor);
      });
      console.log('book=', this.epubBook, 'rendition=', this.ePubRendition, 'cover=', this.epubBookCover);
      this.isBookLoaded = true;
    });
  }

  /**
   * Get table of contents for the loaded book
   */
  getBookTOC() {
    if(this.epubBook) {
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
    if(containerId)
      readingAreaRect = document.getElementById('bcontainer').getBoundingClientRect();
    if(this.ePubRendition) return this.ePubRendition.next().then(()=> {
      if(readingAreaRect)
        this.ePubRendition.resize(readingAreaRect.width, readingAreaRect.height);
    }).then(()=> this.ePubRendition);
    else return Promise.reject('No rendition');
  }

  /**
   * Navigate previous page and resize to fit the page
   * @param containerId the container id to resize the page
   */
  navPrev(containerId?: string): Promise<Rendition> {
    let readingAreaRect = undefined;
    if(containerId)
      readingAreaRect = document.getElementById('bcontainer').getBoundingClientRect();
    if(this.ePubRendition) return this.ePubRendition.prev().then(()=> {
      if(readingAreaRect)
        this.ePubRendition.resize(readingAreaRect.width, readingAreaRect.height);
    }).then(()=> this.ePubRendition);
    else return Promise.reject('No rendition');
  }

  /**
   * Jumps the the specific content from TOC.
   * @param tocItem the seletec item from TOC to jump to
   */
  jumpFromTOC(tocItem: NavItem): Promise<Rendition> {
    let sec = this.epubBook.spine.get(tocItem.href);
    console.log('section=',sec);
    return this.ePubRendition.display(sec.index).then(() => this.ePubRendition);
  }

}
