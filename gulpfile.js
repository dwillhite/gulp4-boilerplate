var { gulp, src, dest, watch, series, parallel } = require('gulp');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var prefix = require('autoprefixer');
var minify = require('cssnano');
var terser = require('gulp-terser');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var concat = require('gulp-concat');
var del = require('del');
var babel = require('gulp-babel');
var imagemin = require('gulp-imagemin');

// BrowserSync
var browserSync = require('browser-sync');

sass.compiler = require('node-sass');

//remove dist directory 
var cleanDist = function(done) {
  del.sync([
    'dist/'
  ])
  done();
}

//build js
var buildJS = function(done) {
  done();
  return src('src/js/**/*.js')
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(terser())
    .pipe(dest('dist/js'))
    
}

// Lint scripts
var lintScripts = function (done) {

	done();

	return src('src/js/*')
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));

};

//build styles
var buildStyles = function(done) {
  done();
    return src('src/scss/**/*.scss')
      .pipe(sass()
      .on('error', sass.logError)
      )
      .pipe(postcss([
        prefix({
          cascade: true,
          remove: true
        })
      ]))
      .pipe(dest('dist/css/'))
      .pipe(rename({suffix: '.min'}))
      .pipe(postcss([
        minify({
          removeComments: {
            removeAll: true
          }
        })
      ]))
      .pipe(dest('dist/css/'));
  
}

var copyFiles = function (done) {

  done();

	// Copy static files
	return src('src/copy/**/*')
    .pipe(dest('dist/'));
   
    
};

// image minification
var buildImages = function (done) {

 done();

	// Optimize image files
	return src('src/images/**/*')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
          plugins: [
              {removeViewBox: true},
              {cleanupIDs: false}
          ]
      })
  ]))
    .pipe(dest('dist/images'))


};

//local server
var startServer = function(done) {
  //browsersync
  browserSync.init({
    server: {
      baseDir: './dist/'
    }
  });
  done();
}

//reload the browser when there is a change in the file
var reloadBrowser = function(done){
  browserSync.reload();
  done();
};

//watch for changes
var watchSrc = function(done) {
  watch('/src', series(exports.default, reloadBrowser));
  done();
}

//default task 'gulp'
exports.default = series(
  cleanDist,
  parallel(
    buildJS,
    lintScripts,
    buildStyles,
    buildImages,
    copyFiles
  )
  
  );

//watch 'gulp watch'

exports.watch = series(
  exports.default,
  startServer,
  watchSrc
)