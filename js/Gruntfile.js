'use strict';

module.exports = function(grunt) {

  var libs = [
    'lib/jquery.js',
    'lib/jquery-ui.js', ];

  var src = [].concat(libs,
    'js/Utils.js',
    'js/Phylotastic.js',
    'js/Maps.js');

  grunt.initConfig({
    // Metadata.
    jshint: {
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      js: {
        src: ['js/**/*.js', 'js/*.js']
      }
    },
    concat: {
      app: {
        src: src,
      dest: './phylotastic.js'
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      app: {
        files: '<%= jshint.js.src %>',
        tasks: ['concat']
      },
      styles: {
        files: 'styles/*.scss',
        tasks: ['compass']
      }
    },
    compass: {
      all: {
        src: 'styles/',
        dest: '.'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-compass');

  // Default task.
  grunt.registerTask('default', ['concat', 'compass']);

};
