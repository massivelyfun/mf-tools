(function() {
  var _this = this;

  module.exports = {
    SourceBuilder: require("./sourceBuilder"),
    TestBuilder: require("./test/testBuilder"),
    component: function(n) {
      return require("./" + n);
    }
  };

}).call(this);
