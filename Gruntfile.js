module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['output'],
        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: '**',
                    dest: 'output'
                }]
            }
        },
        uglify: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.js', '!**/*.min.js'],
                    dest: 'output'
                }]
            }
        },
        cssmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.css', '!**/*.min.css'],
                    dest: 'output'
                }]
            }
        },
        jshint: {
            all: ['src/js/**/*.js', 'src/plugin/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint', 'clean', 'copy', 'uglify', 'cssmin']);
};