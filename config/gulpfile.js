var path = require('path');
var gulp = require('gulp');
var babel = require("gulp-babel");

var CONFIG_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(CONFIG_PATH, '../src');

// main process 的编译
gulp.task('babel:electron-main', function () {
  return gulp.src([APP_PATH + '/main/main.js', APP_PATH + '/main/**.js'], { base: APP_PATH })
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});
gulp.task('default', function () {
  return gulp.src([APP_PATH + '/main/main.js', APP_PATH + '/main/**.js'], { base: APP_PATH })
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});