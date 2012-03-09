phantom = require 'phantom'

page = {}


# Wraps a common use case for phantom: load a page, run some JS, run a test against the result.
#
# url: The page to load
# pageFn: The js to run in the page, once loaded
# testFn: the test to run against the result of pageFn.
page.eval = (url, pageFn, testFn) ->
  phantom.create (ph) ->
    ph.createPage (p) ->
      p.open url, (status) ->
        if status != 'success'
          ph.exit()
          throw "Page load error: #{status}" 
          
        p.evaluate pageFn, (result) ->
          ph.exit()
          testFn(result)
            
          
exports.page = page
