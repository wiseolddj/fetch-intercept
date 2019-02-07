const { FetchIntercept } = require('./index');
const crossFetch = require('cross-fetch')
global.fetch = crossFetch.fetch
global.Response = crossFetch.Response
global.Headers = crossFetch.Headers
global.Request = crossFetch.Request

describe('intercept',() => {
  let intercept
  beforeEach(() => {
    intercept = new FetchIntercept();
  });

  it('replaces window.fetch', () => {
    expect(window.fetch).toBe(intercept.interceptedFetch)
  });

  describe('mocking a response', () => {
    it('mocks the response data for a URL', () => {
      intercept.mock('http://myURL.com/test1', { body: {foo: 'bar'}});
      return expect(window.fetch('http://myURL.com/test1').then(res => res.json())).resolves.toEqual({foo: 'bar'});
    });

    it('mocks status codes for a URL', () => {
      intercept.mock('http://myURL.com/test2', { body: {foo: 'bar'}, status: 404});
      return expect(window.fetch('http://myURL.com/test2')).resolves.toMatchObject({status: 404});
    });

    it('mocks text body', () => {
      intercept.mock('http://myURL.com/test1', { body: "HELP ME NOW"});
      return expect(window.fetch('http://myURL.com/test1').then(res => res.text())).resolves.toEqual("HELP ME NOW");
    });

    it('modifies Response Data', () => {
      intercept.mock('https://httpbin.org/json', { body: {additional: 'data'}, modify: true});
      return expect(window.fetch('https://httpbin.org/json').then(res => res.json())).resolves.toEqual({additional: 'data', slideshow: expect.anything()});
    })
  });

});

