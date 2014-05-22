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
            {#-  create a grunt watch entry (file/task map), for each project.
             #-  grunt will watch/build each repo separately, only build what
             #-  needs to be built with each change to the source.             #}
            {%- for project in doc_projects %}
            {#- javascript is super unhappy about -, so swap with _ -#}
            {{ project|replace('-', '_') }}: {
                files: ['../{{ project }}/docs/**/*'],
                tasks: ['make_{{ project }}_html'],
            },
            {% endfor -%}

            these_docs: {
                files: ['sources/**/*'],
                tasks: ['make_oms_docs'],
            },
            themes: {
                files: ['theme/**/*'],
                tasks: ['make_clean', 'make_all_docs'],
            },
        },
        // run a basic HTTP server on port {{ http_port }},
        // hosting the static files found in _build/html,
        // and (finally), run the live-reload ping on port {{ live_reload_port }}
        connect: {
            dev: {
                options: {
                    port: {{ http_port }},
                    base: '{{ build_path }}/html',
                    livereload: {{ live_reload_port }},
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

    {#- iterate over the list of projects, generate make_project_html task for each #}
    {%- for project in doc_projects %}
    {#- use this to keep the next snippet of js readable #}
    {%- set make_cmd = 'make ' + project + '-html' %}
    // register a task to build the sphinx docs for {{ project }}.
    grunt.registerTask('make_{{ project }}_html',
                       'run sphinx make for {{ project }}',
                       function () {
        var done = this.async();
        require('child_process').exec('{{ make_cmd }}', function (err, stdout) {
            grunt.log.write(stdout);
            done(err);
        });
    });
    {%- endfor %}

    // run sphinx build on oms-docs, not any of the others
    grunt.registerTask('make_oms_docs', 'run sphinx build on oms-docs only', function () {
        var done = this.async();
        require('child_process').exec('make oms-docs', function (err, stdout) {
            grunt.log.write(stdout);
            done(err);
        });
    });

    // register a task to build all docs for all repos
    grunt.registerTask('make_all_docs',
                       'run sphinx build for all docs (make all)',
                       function () {
        var done = this.async();
        require('child_process').exec('make all', function (err, stdout) {
            grunt.log.write(stdout);
            done(err);
        });
    });

    // serve up the docs that have already been built, watch all doc projects
    grunt.registerTask('serve_all_docs', ['connect', 'watch']);

    // by default, calling grunt will build all docs, setup HTTP, and watch for changes
    // only clean the build artifacts when the template is updated (and when told to)
    grunt.registerTask('default', ['make_oms_docs', 'serve_oms_docs']);
    grunt.registerTask('build_all', ['make_all_docs', 'serve_all_docs']);

    // add commentary
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

};
