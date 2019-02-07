var deepMerge = function () {

  // Variables
  var extended = {};
  var i = 0;

  // Merge the object into the extended object
  var merge = function (obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          // If we're doing a deep merge and the property is an object
          extended[prop] = deepMerge(extended[prop], obj[prop]);
        } else {
          // Otherwise, do a regular merge
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for (; i < arguments.length; i++) {
    merge(arguments[i]);
  }

  return extended;
};

var originalFetch = window.fetch;

var defaultOptions = {
  debug: false,
}

function FetchIntercept(options) {
  var userOptions = typeof options === 'object' ? options : {};
  this.opts = deepMerge(defaultOptions, userOptions);
  var self = this;
  self.mocks = {};

  self.mock = function (url, options) {
    self.mocks[url] = options;
  };

  self.log = function(message) {
    if(self.opts.debug) {
      console.log('>FETCH:  ' + message)
    }
  }

  self._urlIsMocked = function (urlToMatch) {
    var urls = Object.keys(self.mocks);
    var matched = urls.filter(function (url) {
      return urlToMatch === url
    })

    if (matched.length > 0) {
      return self.mocks[matched[0]]
    }

    return false;
  };

  self.interceptedFetch = function (url, options) {
    var mock = self._urlIsMocked(url)
    if (!mock) {
      self.log('Original Fetch for ' + url)
      return originalFetch(url, options)
    }

    var responseOptions = {
      "status": mock.status ? mock.status : 200,
      "statusText": mock.statusText ? mock.statusText : 'OK',
    }

    if (mock.body) {
      if (typeof mock.body === 'object') {


         if(mock.modify){

           return originalFetch(url, options)
             .then(function(res) {
                 return res.json()
           })
             .then(function(originalData){
               var modifiedData = deepMerge(originalData, mock.body);

               return new Response(JSON.stringify(modifiedData), responseOptions)
             })
          }
        self.log('Modified Response for ' + url)
        return Promise.resolve(new Response(JSON.stringify(mock.body), responseOptions));
      }
      self.log('Mocked response for' + url)
      return Promise.resolve(new Response(mock.body, responseOptions));

    }
    self.log('ERROR mocking Fetch for ' + url)
    return Promise.resolve(new Response('Mock Intercept FAILED', {"status": 503, "statusText": "FAILED MOCK"}))

  };

  window.fetch = this.interceptedFetch;
};

module.exports =  FetchIntercept;
