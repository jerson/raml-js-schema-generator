var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

var getBundleName = function () {
    var version = require('./package.json').version;
    var name = require('./package.json').name;
    return name + '.' + version + '.' + 'min';
};

gulp.task('build', function () {

    var bundler = browserify(['./languages/index.js'], {
        debug: true
    });

    bundler.require('./languages/index.js', {expose: 'schema-generators'})
    bundler.transform('folderify');

    var bundle = function () {
        return bundler
            .bundle()
            .pipe(source(getBundleName() + '.js'))
            .pipe(buffer())
            //.pipe(sourcemaps.init({loadMaps: true}))
            //  .pipe(uglify())
            //.pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./dist/'));
    };

    return bundle();
});

gulp.task('default', ['build'], function () {

});