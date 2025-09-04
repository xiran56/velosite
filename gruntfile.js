
module.exports = function(grunt) {
    const JST_PATH = 'build/templates.js'
    const TEMPLATES_DATA_PATH = 'src/site_hbs_data.json'

    var processhtml_files = {}
    var htmlmin_files = {}
    var fs = require('fs')
    var files = fs.readdirSync('src')

    files.forEach(function (file, i) {
        console.log(file)
        if (!file.endsWith('.hbs'))
            return

        const page = file.substring(0, file.length - 4)
        const toBeMinifiedName =  'dist/' + page + '.full.html'

        processhtml_files[toBeMinifiedName] = ['build/' + page + '.html']
        htmlmin_files['dist/' + page + '.html'] = toBeMinifiedName
    })

    // Project configuration.
    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),  
      handlebars: {
          compile: {
              options: {
                  namespace: 'JST',
                  commonjs: true
              },
              files: {
                  'build/templates.js': ['src/*.hbs']
              },
          }
        },

        cssmin: {
             minify: {
                 options: {
                     banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                 },
                 cwd: './src',
                 src: ['*.css'],
                 dest: 'build',
                 expand: true
             }
         },
         uglify: {
             options: {
                 banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
             },
             build: {
                 src: ['src/*.js'],
                 dest: 'build/',
                 ext: '.js'
             }
         },
         processhtml: {
             dist: {
                 options: {
                     process: true,
                     data: {
                         title: 'My app',
                         message: 'This is production distribution'
                     }
                 },
                 files: processhtml_files 
             }
         },
         htmlmin: {
             dist: {
                 options: {
                     removeComments: true,
                     collapseWhitespace: true
                 },
                 files: htmlmin_files
             }
         },

         clean: ['dist*//*.full.*', 'dist**//*.component.*', 'build/*']

    });

    var jstInstantiate = require('./build_scripts/jst_instantiation')

    grunt.loadNpmTasks('grunt-contrib-handlebars');

    grunt.registerTask('jst_instantiation', function() {
        grunt.task.requires('handlebars')
        jstInstantiate(JST_PATH, TEMPLATES_DATA_PATH, 'build')
    })

    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['handlebars', 'jst_instantiation', 'cssmin','uglify', 'processhtml', 'htmlmin', 'clean']);
    
};
