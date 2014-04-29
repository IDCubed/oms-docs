module.exports = function(grunt) {

    grunt.initConfig({

        // add commentary
        watch: {
            // watches files to see if they change and runs the tasks specified below
            // when they do, automating the build process each time a file is saved.
            // NOTE: These only run on CHANGED files, not creations/deletions
            // Also, the param names mean nothing (e.g., index:, test:, etc...)
            options: {
                livereload: 9001, // automatically reload the browser on file change
            },
            dev: {
                //files: ['<%= src.dirs.src %>'],
                files: ['sources/**/*.rst'],
                tasks: ['make_docs'],
            },
        },
        // add commentary
        connect: {
            dev: {
                options: {
                    port: 9000,
                    base: '_build/html',
                    livereload: 9001,
                }
            }
        }

    });

    // add commentary
    grunt.registerTask('make_docs', 'run sphinx make docs', function () {
        var done = this.async();
        require('child_process').exec('make docs', function (err, stdout) {
            grunt.log.write(stdout);
            done(err);
        });
    });

    // add commentary
    grunt.registerTask('default', ['make_docs', 'connect', 'watch']);

    // add commentary
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

};
