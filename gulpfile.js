const { gulp, src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const prefix = require('autoprefixer');
const minify = require('cssnano');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');
const concat = require('gulp-concat');
const del = require('del');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');

// BrowserSync
const browserSync = require('browser-sync');

sass.compiler = require('node-sass');

//remove dist directory 
const cleanDist = function(done) {
  del.sync([
    'dist/'
  ])
  done();
}

//build js
const buildJS = function(done) {
  done();
  return src('src/js/**/*.js')
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(terser())
    .pipe(dest('dist/js'))
    
}

// Lint scripts
const lintScripts = function (done) {

	done();

	return src('src/js/*')
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));

};

//build styles
const buildStyles = function(done) {
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

const copyFiles = function (done) {

  done();

	// Copy static files
	return src('src/**/*')
    .pipe(dest('dist/'));
   
    
};

// image minification
const buildImages = function (done) {

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
const startServer = function(done) {
  //browsersync
  browserSync.init({
    server: {
      baseDir: './dist/'
    }
  });
  done();
}

//reload the browser when there is a change in the file
const reloadBrowser = function(done){
  browserSync.reload();
  done();
};

//watch for changes
const watchSrc = function(done) {
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