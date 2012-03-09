(function() {
  var page, phantom;

  phantom = require('phantom');

  page = {};

  page.eval = function(url, pageFn, testFn) {
    return phantom.create(function(ph) {
      return ph.createPage(function(p) {
        return p.open(url, function(status) {
          if (status !== 'success') {
            ph.exit();
            throw "Page load error: " + status;
          }
          return p.evaluate(pageFn, function(result) {
            ph.exit();
            return testFn(result);
          });
        });
      });
    });
  };

  exports.page = page;

}).call(this);
