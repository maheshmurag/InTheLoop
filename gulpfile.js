var gulp = require('gulp');

var clean = require('gulp-clean');

var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-minify-css');
var csslint = require('gulp-csslint');
var sourcemaps = require('gulp-sourcemaps');

var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');

gulp.task('default', ['dev']);

gulp.task('dev', ['scripts', 'css', 'manifest', 'icons', 'lib', 'html'], function(){
    gulp.watch('extension/src/**/*.js', ['scripts']);
    gulp.watch('extension/styles/**/*.css', ['css']);
    gulp.watch('extension/manifest.json', ['manifest']);
    gulp.watch('extension/icons/**/*', ['icons']);
    gulp.watch('extension/lib/**/*', ['lib']);
    gulp.watch('extension/src/**/*.html', ['html']);
});

gulp.task('build', ['scripts', 'css', 'manifest', 'icons', 'lib', 'html']);

gulp.task('clean', function(){
    return gulp.src('build/*', {read:false})
        .pipe(clean());
})

gulp.task('clean-js', function(){
    return gulp.src('build/**/*.js', {read:false})
        .pipe(clean());
})

gulp.task('clean-css', function(){
    return gulp.src('build/**/*.css', {read:false})
        .pipe(clean());
})

gulp.task('scripts', ['clean-js'], function(){
    return gulp.src('extension/src/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
        .pipe(uglify())
        .pipe(gulp.dest('build/src'));
});

gulp.task('css', ['clean-css'], function(){
    return gulp.src('extension/styles/**/*.css')
        .pipe(csslint())
        .pipe(csslint.reporter())
        .pipe(autoprefixer({
            browsers: ['last 4 Chrome versions'],
            cascade: false
        }))
        .pipe(sourcemaps.init())
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/styles'));
});

//TODO: Do more with manifest/icons/libs/html
gulp.task('manifest', function(){
    return gulp.src('extension/manifest.json')
        .pipe(gulp.dest('build'));
});

gulp.task('icons', function(){
    return gulp.src('extension/icons/**/*')
        .pipe(gulp.dest('build/icons'));
});

gulp.task('lib', function(){
    return gulp.src('extension/lib/**/*')
        .pipe(gulp.dest('build/lib'));
});

gulp.task('html', function(){
    return gulp.src('extension/src/**/*.html')
        .pipe(gulp.dest('build/src'));
})
