Phylotastic.Utils = {
    bind: function(fn, scope, args, appendArgs) { // (Function, Object) -> Function
      if (arguments.length === 2) {
        return function() {
          return fn.apply(scope, arguments);
        };
      }

      if (appendArgs === undefined) {
        appendArgs = true;
      }

      var method = fn,
      slice = Array.prototype.slice;

      return function() {
        var callArgs = args || arguments;

        if (appendArgs === true && args !== undefined) {
          callArgs = slice.call(arguments, 0);
          callArgs = callArgs.concat(args);
        }
        //console.log("Args", callArgs);
        return method.apply(scope, callArgs);
      };
    },

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
