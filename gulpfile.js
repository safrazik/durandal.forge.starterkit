var gulp = require('gulp');
var traceur = require('gulp-traceur');
var connect = require('gulp-connect');
var rename_ = require('gulp-rename');
var durandal = require('gulp-durandal');
var livereload = require('gulp-livereload');
var fs = require('fs');
var del = require('del');

var depsConfig = require('./config.deps');


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
  DIST: './dist/',
  DIST_TEMP: './dist_temp/',
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
  if(!(obj && obj.dirnamePrefix)){
    return rename_(obj);
  }
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

gulp.task('build/css', ['build/css/less', 'build/css/sass']);

gulp.task('build', ['build/src', 'build/test', 'build/copy', 'build/css']);

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

gulp.task('dist/merge', function(){

    var REQUIREJS_CONFIG = require('./config.requirejs');
  
    var mainFile = PATH.DIST_TEMP + 'app/main.js';
    var mainFileContent = fs.readFileSync(mainFile, {encoding: 'utf-8'});
    
    var mainFileContentNew = 'require.config(' + JSON.stringify(REQUIREJS_CONFIG) + ');\n\n' + mainFileContent;
    
    fs.writeFileSync(mainFile, mainFileContentNew);

    durandal({
      verbose: true,
      baseDir: PATH.DIST_TEMP + 'app',
      main: 'main.js',
      output: 'main-built.js',
      almond: true,
      minify: true,
      rjsConfigAdapter: function(rjsConfig){
        rjsConfig.generateSourceMaps = false;
        rjsConfig.map = REQUIREJS_CONFIG.map;
        rjsConfig.paths = REQUIREJS_CONFIG.paths;
        rjsConfig.shim = REQUIREJS_CONFIG.shim;
        return rjsConfig;
      },
    })
    .pipe(gulp.dest(PATH.DIST));
});

gulp.task('default', ['serve', 'watch']);

gulp.task('dist/temp_copy', function(){
  gulp.src(PATH.BUILD + '**/*')
    .pipe(gulp.dest(PATH.DIST_TEMP));
});

gulp.task('dist/temp_copy_deps', function(){
  ['node_modules', 'bower_components'].forEach(function(depsPath){
  gulp.src(depsConfig[depsPath], {base: './' + depsPath, cwd: depsPath})
    .pipe(gulp.dest(PATH.DIST_TEMP + depsPath + '/'));
  });
});

gulp.task('dist/copy', function(){
  gulp.src('./index-dist.html')
    .pipe(rename_({
      basename: 'index'
    }))
    .pipe(gulp.dest(PATH.DIST));

  gulp.src('./node_modules/traceur/bin/traceur-runtime.js')
    .pipe(gulp.dest(PATH.DIST));

  gulp.src([PATH.DIST_TEMP + '**',
            '!' + PATH.DIST_TEMP + '**/*.js',
            '!' + PATH.DIST_TEMP + '**/*.map',
            '!' + PATH.DIST_TEMP + '**/*.html',
           ])
            .pipe(gulp.dest(PATH.DIST));
});

gulp.task('dist_temp', ['dist/temp_copy', 'dist/temp_copy_deps']);
gulp.task('dist_output', ['dist/merge', 'dist/copy']);


gulp.task('dist', function(cb){
  var exec = require('child_process').exec;

  var tasks = ['clean', 'build', 'dist_temp', 'dist_output'];

  var deleteDistTemp = function(){
    del([PATH.DIST_TEMP + '**']);
  }

  var runChild = function(i){
    if(!tasks[i]){
      return deleteDistTemp();
    }
    exec('gulp ' + tasks[i], function(error, stdout, stderr){
      if (error !== null) {
        console.log(task + ' error: ' + error);
        console.log(stderr);
      }
      else {
        console.log(stdout);
      }
      runChild(i+1);
    });
  }

  runChild(0);

});

gulp.task('clean', function(cb){
    del([
      PATH.BUILD + '**',
      PATH.DIST_TEMP + '**',
  ], cb);
});
