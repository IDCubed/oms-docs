module.exports = function(grunt) {

    grunt.initConfig({

        watch: {
            // watches files to see if they change and runs the tasks specified below
            // when they do, automating the build process each time a file is saved.
            // NOTE: These only run on CHANGED files, not creations/deletions
            // Also, the param names mean nothing (e.g., index:, test:, etc...)
            options: {
                livereload: 9001, // automatically reload the browser on file change
            },
            these_docs: {
                files: ['sources/**/*'],
                tasks: ['make_oms_docs'],
            },
            themes: {
                files: ['theme/**/*'],
                tasks: ['make_clean', 'make_oms_docs'],
            },
        },
        // run a basic HTTP server on port 9000,
        // hosting the static files found in _build/html,
        // and (finally), run the live-reload ping on port 9001
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

    // register a task to clean build artifacts (make clean)
    grunt.registerTask('make_clean',
                       'run make clean on build directory/artifacts',
                       function () {
        var done = this.async();
        require('child_process').exec('make clean', function (err, stdout) {
            grunt.log.write(stdout);
            done(err);
        });
    });

    // run sphinx build on oms-docs, not any of the others
    grunt.registerTask('make_oms_docs', 'run sphinx build on oms-docs only', function () {
        var done = this.async();
        require('child_process').exec('make oms-docs', function (err, stdout) {
            grunt.log.write(stdout);
            done(err);
        });
    });

    // serve up the docs that have already been built, limit to oms-docs
    grunt.registerTask('serve_oms_docs', ['connect', 'watch']);

    // by default, calling grunt will build all docs, setup HTTP, and watch for changes
    // only clean the build artifacts when the template is updated (and when told to)
    grunt.registerTask('default', ['make_oms_docs', 'serve_oms_docs']);

    // add commentary
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

};