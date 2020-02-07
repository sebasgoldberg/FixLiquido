"use strict";

module.exports = function(grunt) {

    grunt.initConfig({

        dir: {
            webapp: "webapp",
            dist: "dist",
            transp: "transp",
        },

        copy:{
            webapp: {
                files:[ {
                    expand: true,
                    cwd: "<%= dir.webapp %>",
                    src: ["**/*", "!**/*.js", ],
                    dest: "transp/",
                },
                ]

            },
        },

        babel: {
            options: {
                sourceMap: true
            },
            webapp: {
                files:[ {
                    expand: true,
                    cwd:  "webapp/",
                    src: ["**/*.js"],
                    dest: "transp/",
                }]
            }
        },

        watch: {
            all:{
                files: ["webapp/**/*"],
                tasks: ["transp",]
            }
        },

        clean: {
            dist: "dist/",
            transp: "transp/",
        },

        eslint: {
            webapp: ["<%= dir.webapp %>"]
        },

        exec: {
            i18n_conv: "find transp/i18n/ -type f -exec native2ascii {} {} \\;",
            zip_dist: "cd dist && zip -r ../dist.zip ./",
        }

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks("grunt-babel");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-exec");

    // Linting task
    grunt.registerTask("lint", ["eslint"]);

    // Build task
    if (process.platform === "win32")
        grunt.registerTask("transp", ["clean:transp", "babel", "copy:webapp"])
    else
        grunt.registerTask("transp", ["clean:transp", "babel", "copy:webapp", "exec:i18n_conv"]);

    // Default task
    grunt.registerTask("default", [
        "transp",
    ]);
};
