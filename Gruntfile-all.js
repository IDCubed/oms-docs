module.exports = function(grunt) {

    grunt.initConfig({

        watch: {
            // watches files to see if they change and runs the tasks specified below
            // when they do, automating the build process each time a file is saved.
            // NOTE: These only run on CHANGED files, not creations/deletions
            // Also, the param names mean nothing (e.g., index:, test:, etc...)
            options: {
                livereload: 9001, // automatically reload the browser on file change
            },oms_kickstart: {
                files: ['../oms-kickstart/docs/**/*'],
                tasks: ['make_oms-kickstart_html'],
            },
            oms_admin: {
                files: ['../oms-admin/docs/**/*'],
                tasks: ['make_oms-admin_html'],
            },
            oms_deploy: {
                files: ['../oms-deploy/docs/**/*'],
                tasks: ['make_oms-deploy_html'],
            },
            oms_core: {
                files: ['../oms-core/docs/**/*'],
                tasks: ['make_oms-core_html'],
            },
            oms_experimental: {
                files: ['../oms-experimental/docs/**/*'],
                tasks: ['make_oms-experimental_html'],
            },
            oms_ui: {
                files: ['../oms-ui/docs/**/*'],
                tasks: ['make_oms-ui_html'],
            },
            oms_salt_core: {
                files: ['../oms-salt-core/docs/**/*'],
                tasks: ['make_oms-salt-core_html'],
            },
            oms_salt_tcf: {
                files: ['../oms-salt-tcf/docs/**/*'],
                tasks: ['make_oms-salt-tcf_html'],
            },
            these_docs: {
                files: ['sources/**/*'],
                tasks: ['make_oms_docs'],
            },
            themes: {
                files: ['theme/**/*'],
                tasks: ['make_clean', 'make_all_docs'],
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
    // register a task to build the sphinx docs for oms-kickstart.
    grunt.registerTask('make_oms-kickstart_html',
                       'run sphinx make for oms-kickstart',
                       function () {
        var done = this.async();
        require('child_process').exec('make oms-kickstart-html', function (err, stdout) {
            grunt.log.write(stdout);
            done(err);
        });
    });
    // register a task to build the sphinx docs for oms-admin.
    grunt.registerTask('make_oms-admin_html',
                       'run sphinx make for oms-admin',
                       function () {
        var done = this.async();
        require('child_process').exec('make oms-admin-html', function (err, stdout) {
            grunt.log.write(stdout);
            done(err);
        });
    });
    // register a task to build the sphinx docs for oms-deploy.
    grunt.registerTask('make_oms-deploy_html',
                       'run sphinx make for oms-deploy',
                       function () {
        var done = this.async();
        require('child_process').exec('make oms-deploy-html', function (err, stdout) {
            grunt.log.write(stdout);
            done(err);
        });
    });
    // register a task to build the sphinx docs for oms-core.
    grunt.registerTask('make_oms-core_html',
                       'run sphinx make for oms-core',
                       function () {
        var done = this.async();
        require('child_process').exec('make oms-core-html', function (err, stdout) {
            grunt.log.write(stdout);
            done(err);
        });
    });
    // register a task to build the sphinx docs for oms-experimental.
    grunt.registerTask('make_oms-experimental_html',
                       'run sphinx make for oms-experimental',
                       function () {
        var done = this.async();
        require('child_process').exec('make oms-experimental-html', function (err, stdout) {
            grunt.log.write(stdout);
            done(err);
        });
    });
    // register a task to build the sphinx docs for oms-ui.
    grunt.registerTask('make_oms-ui_html',
                       'run sphinx make for oms-ui',
                       function () {
        var done = this.async();
        require('child_process').exec('make oms-ui-html', function (err, stdout) {
            grunt.log.write(stdout);
            done(err);
        });
    });
    // register a task to build the sphinx docs for oms-salt-core.
    grunt.registerTask('make_oms-salt-core_html',
                       'run sphinx make for oms-salt-core',
                       function () {
        var done = this.async();
        require('child_process').exec('make oms-salt-core-html', function (err, stdout) {
            grunt.log.write(stdout);
            done(err);
        });
    });
    // register a task to build the sphinx docs for oms-salt-tcf.
    grunt.registerTask('make_oms-salt-tcf_html',
                       'run sphinx make for oms-salt-tcf',
                       function () {
        var done = this.async();
        require('child_process').exec('make oms-salt-tcf-html', function (err, stdout) {
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

    // register a task to build all docs for all repos
    grunt.registerTask('make_all_docs',
                       'run sphinx build for all docs',
                       function () {
        var done = this.async();
        require('child_process').exec('make all_docs-html', function (err, stdout) {
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