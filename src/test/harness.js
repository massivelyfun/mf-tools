require('coffee-script');
var path = require('path'),
    spawn = require('child_process').spawn;


harness = {};
helpers = ["group", "import", "image", "server", "dom"]

for(var i = 0; i < helpers.length; i++){
  helper = helpers[i];
  harness[helper] = require("./" + helper)[helper];
}

harness.assert = require('chai').assert;

exports.harness = harness;
// Hint at libraries that we're in test mode
global.MF_TEST = true;
global.MF_TEST_CONFIG = {};
