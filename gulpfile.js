var { gulp, src, dest, watch, series, parallel } = require('gulp');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var prefix = require('autoprefixer');
var minify = require('cssnano');
var rename = require('gulp-rename');
var del = require('del');
var babel = require('gulp-babel');

// BrowserSync
var browserSync = require('browser-sync');

sass.compiler = require('node-sass');


//   gulp.task('sass', function () {
//     return gulp.src('./src/scss/main.scss')
//       .pipe(sass().on('error', sass.logError))
//       .pipe(gulp.dest('./css'));
//   });


// gulp.task('sass:watch', function () {
//   gulp.watch('./sass/**/*.scss', ['sass']);
// });
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
    .pipe(dest('dist/js'))
    
}

//build styles
var buildStyles = function(done) {
  done();
    return src('src/scss/**/*.scss')
      .pipe(sass()
      // .on('error', sass.logError)
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

	// Make sure this feature is activated before running
  done();

	// Copy static files
	return src('src/copy/**/*')
    .pipe(dest('dist/'));
   
    
};

//local server
var startServer = function(done) {
  //browsersync
  browserSync.init({
    server: {
      baseDir: './dist'
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
    buildStyles,
    copyFiles
  )
  
  );

//watch 'gulp watch'

exports.watch = series(
  exports.default,
  startServer,
  watchSrc
)