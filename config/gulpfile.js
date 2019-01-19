var path = require('path');
var gulp = require('gulp');
var babel = require("gulp-babel");

var CONFIG_PATH = path.resolve(__dirname);
var SRC_PATH = path.resolve(CONFIG_PATH, '../src');

gulp.task('default', function () {
  return gulp.src([SRC_PATH + '/main/main.js', SRC_PATH + '/main/**.js'], { base: SRC_PATH })
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});