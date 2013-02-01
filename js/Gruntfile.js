'use strict';

module.exports = function(grunt) {

  var libs = [
    'lib/jquery.js',
    'lib/bootstrap.js'];

  var libsNoJQ = [
    'lib/bootstrap.js'
  ];

  var core = [].concat(
    'src/Phylotastic.js',
    'src/Utils.js');

  var src = [].concat(libs, core,
    'src/App.js',
    'src/Maps.js',
    'src/DataSources.js'
  );

  var srcNoJQ = [].concat(libsNoJQ, core,
    'src/App.js',
    'src/Maps.js',
    'src/DataSources.js'
  );

  grunt.initConfig({
    // Metadata.
    concat: {
      app: {
        src: src,
        dest: '../phylotastic.js'
      },
      app_to_web: {
        src: srcNoJQ,
        dest: '../web_interface/phylotastic_nojquery.js'
      }
    },
    watch: {
      app: {
        files: src,
        tasks: ['concat:app', 'concat:app_to_web']
      },
      styles: {
        files: 'styles/*.scss',
        tasks: ['compass:all', 'compass:all_to_web']
      }
    },
    compass: {
      all: {
        src: 'styles/',
        dest: '..'
      },
      all_to_web: {
        src: 'styles/',
        dest: '../web_interface'
      }

    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-compass');

  // Default task.
  grunt.registerTask('default', ['concat:app', 'concat:app_to_web', 'compass:all', 'compass:all_to_web']);

};
