var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var watch = require('gulp-watch');
var connect = require('gulp-connect');
var notify = require("gulp-notify");
var sourcemaps = require('gulp-sourcemaps');

var getBundleName = function () {
    var version = require('./package.json').version;
    var name = require('./package.json').name;
    return name + '.' + version + '.' + 'min';
};

var baseFile = './languages/index.js'; 
var dirs = ['./{bin,languages}/*.js','./languages/**/*.js'];

gulp.task('watch', function () {
    watch(dirs, function () {
        notify('reloading');
        gulp.start('build');
    }); 
}); 

gulp.task('watch:dist', function () {
    watch(['./dist/*.js','./test/*.html','./test/**/*.raml'], function () {
        notify('reloading'); 
        connect.reload();  
    }); 
}); 
  
gulp.task('lint', function() {
  return gulp.src(dirs)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('build', ['lint'], function () {

    var bundler = browserify([baseFile], {
        debug: true
    });

    bundler.require(baseFile, {expose: 'raml-schema-generators'})
    bundler.transform('folderify');

    var bundle = function () {
        return bundler
            .bundle()
            .pipe(source(getBundleName() + '.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./dist/'));
    };

    return bundle();
});
 
gulp.task('serve', ['watch:dist'], function () {
  connect.server({ 
    root: __dirname,
    port: 8154,
    host: '0.0.0.0',  
    livereload: true 
  });
}); 

gulp.task('default', ['serve','watch'], function () {

});