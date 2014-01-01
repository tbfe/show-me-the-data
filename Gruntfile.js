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
        },
        'string-replace': {
            dist: {
                files: {
                    'output/manifest.json': 'output/manifest.json'
                },
                options: {
                    replacements: [{
                        pattern: '0.0.0.0',
                        replacement: '<%= grunt.template.today("yy.m.d") %>'
                    }]
                }
            }
        },
        compress: {
            main: {
                options: {
                    archive: 'show-me-the-data.zip'
                },
                files: [{
                    expand: true,
                    cwd: 'output',
                    src: '**'
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('default', ['jshint', 'clean', 'copy', 'uglify', 'cssmin', 'string-replace']);
    grunt.registerTask('release', function() {
        grunt.task.run('default', 'compress');
    });
};