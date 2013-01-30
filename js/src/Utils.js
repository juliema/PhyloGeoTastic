Phylotastic.Utils = {
    extend: function(dest) { // merge src properties into dest
      var sources = Array.prototype.slice.call(arguments, 1);
      for (var j = 0, len = sources.length, src; j < len; j++) {
        src = sources[j] || {};
        for (var i in src) {
          if (src.hasOwnProperty(i)) {
            dest[i] = src[i];
          }
        }
      }
      return dest;
    }

};
