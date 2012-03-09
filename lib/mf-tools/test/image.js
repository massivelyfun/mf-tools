(function() {
  var Image;

  Image = (function() {

    function Image() {}

    Image.prototype.constuctor = function(w, h) {
      this.src = "";
      return this.complete = true;
    };

    return Image;

  })();

  module.exports.image = Image;

}).call(this);
