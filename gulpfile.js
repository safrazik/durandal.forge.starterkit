var gulp = require('gulp');
var traceur = require('gulp-traceur');
var connect = require('gulp-connect');
var rename_ = require('gulp-rename');
var durandal = require('gulp-durandal');
var livereload = require('gulp-livereload');


var less = require('gulp-less');
// @TODO add sass support
//var sass = require('gulp-sass');

var TRACEUR_OPTIONS = {
  "modules": "amd",
  "script": false,
  "types": true,
  "typeAssertions": true,
  "typeAssertionModule": "assert",
  "annotations": true,
  "sourceMaps": "file"
};

var PATH = {
  BUILD: './build/',
  SRC: './app/**/*.ats',
  COPY: ['./app/**/*.html', './app/**/*.js'],
  TEST: './test/**/*.ats',
  LESS: './assets/**/*.less',
  SASS: './assets/**/*.scss',
  LESS_INDEX: './assets/style.less',
  SASS_INDEX: './assets/style.scss',
};

// A wrapper around gulp-rename to support `dirnamePrefix`.
function rename(obj) {
  return rename_(function(parsedPath) {
    return {
      extname: obj.extname || parsedPath.extname,
      dirname: (obj.dirnamePrefix || '') + parsedPath.dirname,
      basename: parsedPath.basename
    };
  });
}


// TRANSPILE AT SCRIPT
gulp.task('build/src', function() {
  gulp.src(PATH.SRC, {base: '.'})
      // Rename before Traceur, so that Traceur has the knowledge of both input and output paths.
      .pipe(rename({extname: '.js', dirnamePrefix: PATH.BUILD}))
      .pipe(traceur(TRACEUR_OPTIONS))
      .pipe(gulp.dest('.'));
});

gulp.task('build/test', function() {
  gulp.src(PATH.TEST, {base: '.'})
      // Rename before Traceur, so that Traceur has the knowledge of both input and output paths.
      .pipe(rename({extname: '.js', dirnamePrefix: PATH.BUILD}))
      .pipe(traceur(TRACEUR_OPTIONS))
      .pipe(gulp.dest('.'));
});

gulp.task('build/copy', function(){
  gulp.src(PATH.COPY, {base: '.'})
    .pipe(rename({dirnamePrefix: PATH.BUILD}))
    .pipe(gulp.dest('.'));
});

gulp.task('build/css/less', function(){
//  console.log('__DIRNAME ' + __dirname);
  if(PATH.LESS_INDEX){
    gulp.src(PATH.LESS_INDEX)
    .pipe(less({
//      paths: [ path.join(__dirname, 'less', 'includes') ],
      paths: ['.'],
      sourceMap: true,
      sourceMapBasepath: __dirname,
      sourceMapRootpath: '../', // above build directory
    }))
    .pipe(gulp.dest(PATH.BUILD));
  }
});

gulp.task('build/css/sass', function(){
  if(PATH.SASS){
  }
});


gulp.task('build/copy_deps', function(){
  var depsConfig = require('./config.deps');
  var bowerPath = 'bower_components',
      npmPath = 'node_modules';
  gulp.src(depsConfig.bower, {base: './' + bowerPath, cwd: bowerPath})
    .pipe(gulp.dest(PATH.BUILD + 'deps/'));
  gulp.src(depsConfig.npm, {base: './' + npmPath, cwd: npmPath})
    .pipe(gulp.dest(PATH.BUILD + 'deps/'));

});

gulp.task('build/css', ['build/css/less', 'build/css/sass']);

gulp.task('build', ['build/src', 'build/test', 'build/copy', 'build/css', 'build/copy_deps']);

// WATCH FILES FOR CHANGES
gulp.task('watch', function() {
  
  var server = livereload.listen(35729);
  
  gulp.watch(PATH.BUILD + '**/*.css').on('change', function(file) {
      livereload.changed(file);
  });
  
  if(PATH.LESS){
    gulp.watch(PATH.LESS, ['build/css/less']);
  }
  if(PATH.SASS){
    gulp.watch(PATH.SASS, ['build/css/sass']);
  }
  
  gulp.watch(PATH.SRC, ['build/src']).on('change', function(file){
    livereload.changed(file);
  });
  
  gulp.watch(PATH.COPY, ['build/copy']).on('change', function(file){
    livereload.changed(file);
  });
  
});


// WEB SERVER
gulp.task('serve', function() {
  connect.server({
    root: [__dirname],
    port: 8000,
    livereload: true
  });
});

gulp.task('durandal', function(){

    var REQUIREJS_CONFIG = require('./config.requirejs');
  
    var fs = require('fs');
  
    var mainFile = 'build/app/main.js';
    var mainFileContent = fs.readFileSync(mainFile, {encoding: 'utf-8'});
    
    var mainFileContentNew = 'require.config(' + JSON.stringify(REQUIREJS_CONFIG) + ');\n\n' + mainFileContent;
    
    var writeHead = true;
    
    if(writeHead){
      fs.writeFileSync(mainFile, mainFileContentNew);
    }
    return durandal({
      verbose: true,
      baseDir: 'build/app',
      main: 'main.js',
      output: 'main-built.js',
      almond: true,
      minify: true,
      rjsConfigAdapter: function(rjsConfig){
        rjsConfig.generateSourceMaps = false;
        rjsConfig.map = REQUIREJS_CONFIG.map;
        rjsConfig.paths = REQUIREJS_CONFIG.paths;
        rjsConfig.shim = REQUIREJS_CONFIG.shim;
        // TODO implement in the right way
        rjsConfig.onFinish = function(){
          if(writeHead){
            fs.writeFileSync(mainFile, mainFileContent);
          }
        }
        return rjsConfig;
      },
    })
    .pipe(gulp.dest('deploy'));
 
});

gulp.task('default', ['serve', 'watch']);
