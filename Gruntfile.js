module.exports = function(grunt) {
  grunt.initConfig({
    paths: {
      dist: 'app/dist',
      scripts: 'app/scripts'
    },

    browserify: {
      dist: {
        files: {
          '<%= paths.dist %>/tracker-grapher.js': '<%= paths.scripts %>/**/*.js'
        },

        options: {
          transform: ['reactify']
        }
      }
    },

    clean: {
      dist: ['<%= paths.dist %>']
    },

    watch: {
      scripts: {
        files: '<%= paths.scripts %>/**/*.js',
        tasks: 'browserify'
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['browserify']);
};
