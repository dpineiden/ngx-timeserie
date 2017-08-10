import { NgxTimeseriePage } from './app.po';

describe('ngx-timeserie App', () => {
  let page: NgxTimeseriePage;

  beforeEach(() => {
    page = new NgxTimeseriePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
