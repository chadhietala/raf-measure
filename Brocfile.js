var Babel = require('broccoli-babel-transpiler');
var mergeTrees = require('broccoli-merge-trees');
var funnel = require('broccoli-funnel');
var amdNameResolver = require('amd-name-resolver').moduleResolve;
var lib = funnel('lib', {
  getDestinationPath: function(relativePath) {
    if (relativePath === 'index.js') {
      return 'raf-measure.js';
    }

    return relativePath;
  }
});

lib = [lib];

if (process.env.TEST) {
  lib = lib.concat('tests');
}

var dist = new Babel(mergeTrees(lib), {
  modules: 'amdStrict',
  moduleIds: true,
  resolveModuleSource: amdNameResolver
});

if (process.env.TEST) {
  var loader = funnel('bower_components/loader.js/lib/loader/', {
    include: ['loader.js'],
    destDir: '/'
  });

  var mocha = funnel('node_modules/mocha', {
    include: ['mocha.css', 'mocha.js']
  });

  var expect = funnel('bower_components/expect.js', {
    include: ['index.js'],
    getDestinationPath: function(relativePath) {
      if (relativePath === 'index.js') {
        return 'expect.js';
      }

      return relativePath;
    }
  });

  dist = mergeTrees([dist, loader, mocha, expect]);
}

module.exports = dist;