var gulp = require('gulp');
var ts = require('gulp-typescript');
var shell = require('gulp-shell');
var sourcemaps = require('gulp-sourcemaps');
var tslint = require("gulp-tslint");
var argv = require('yargs').argv;

var tsProject = ts.createProject('tsconfig.json');

gulp.task('postinstall', shell.task([
  // 'pwd',
  // 'patch -b -p0 < patches/wampy.patch'
  //  'for a in RCTLog RCTBridge RCTConvert RCTView; do find node_modules/react-native-* -type f -name "*.[h|m*]" -exec sed -i.bak "s/\\#import \\"$a.h\\"/#import <React\\/$a.h>/g" "{}" \\;; done'
]));

/*gulp.task('bump', shell.task([
  'cd /node_modules/wampy/dist',
  'patch -b -p0 < ../patches/wampy.patch'
]));
*/

gulp.task('clean', shell.task([
  'rm -rf node_modules',
  'rm -rf lib',
]));

gulp.task('build', function () {
  return tsProject.src()
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(tsProject())
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('lib'));
});

gulp.task('watch', ['build'], function () {
  gulp.watch('src/**/*.ts', ['build']);
  gulp.watch('src/**/*.tsx', ['build']);
});

gulp.task('tslint', function() {
  tsProject.src()
  .pipe(tslint({
    formatter: "verbose",
    fix: argv.fix,
  }))
  .pipe(tslint.report())
});

gulp.task('default', ['build']);
