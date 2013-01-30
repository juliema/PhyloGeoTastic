'use strict';

module.exports = function(grunt) {

  var libs = [
    'lib/jquery.js',
    'lib/bootstrap.js',
    'lib/google-maps.js'];

  var core = [].concat(
    'src/Phylotastic.js',
    'src/Utils.js');

  var src = [].concat(libs, core,
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
      }
    },
    watch: {
      app: {
        files: src,
        tasks: ['concat:app']
      },
      styles: {
        files: 'styles/*.scss',
        tasks: ['compass:all']
      }
    },
    compass: {
      all: {
        src: 'styles/',
        dest: '..'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-compass');

  // Default task.
  grunt.registerTask('default', ['concat:app', 'compass:all']);

};
