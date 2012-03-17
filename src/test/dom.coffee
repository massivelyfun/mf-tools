jsdom  = require "jsdom"
Canvas = require "./canvas"

extend = (obj1, obj2) ->
  for k, v of obj2
    obj1[k] = v

dom = (html, cb) ->
  jsdom.env html, [], (errors, window) ->
    doc = window.document
    _document = global.document
    _ce = doc.createElement
    doc.createElement = (tagName) ->
      el = _ce.call(doc, tagName)
      extend(el, new Canvas()) if tagName == 'canvas'
      el

    _window = global.window
    global.window   = window
    global.document = doc
    cb()
    global.document = _document
    global.window   = _window

module.exports.dom = dom

