module.exports = function(grunt) {
    // Project config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        simplemocha : {
            all: {
                src: "test/test.js"
            }
        },
        uglify: {
            options: {
                banner: '/*! fuzzy.js \n' +
                        '    Version: <%= pkg.version %>\n' +
                        '    License: https://raw.github.com/bostrt/fuzzyjs/master/LICENSE\n' +
                        '    Date: <%= grunt.template.today("yyyy-mm-dd") %> \n' +
                        '    <%= pkg.author %> */\n'
            },
            build: {
                src: 'src/fuzzy.js',
                dest: 'build/fuzzy.min.js'
            }
        }
    });
    
    // Load uglify plugin
    grunt.loadNpmTasks('grunt-contrib-uglify');    
    
    // Load mocha plugin
    grunt.loadNpmTasks('grunt-simple-mocha');
    
    // Prepare uglify task
    grunt.registerTask('default', ['simplemocha','uglify']);
};