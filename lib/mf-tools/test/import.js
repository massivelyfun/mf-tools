(function() {
  var __slice = Array.prototype.slice;

  exports["import"] = function() {
    var key, mod, mods, module, namespace, obj, _i, _len, _results;
    namespace = arguments[0], mods = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    _results = [];
    for (_i = 0, _len = mods.length; _i < _len; _i++) {
      mod = mods[_i];
      module = require(mod);
      _results.push((function() {
        var _results2;
        _results2 = [];
        for (key in module) {
          obj = module[key];
          _results2.push(namespace[key] = obj);
        }
        return _results2;
      })());
    }
    return _results;
  };

}).call(this);
