import { TestBed } from '@angular/core/testing';

import { EPubService } from './e-pub.service';

describe('EPubService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EPubService = TestBed.get(EPubService);
    expect(service).toBeTruthy();
  });
});
