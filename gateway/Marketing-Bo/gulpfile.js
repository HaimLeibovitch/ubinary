var gulp = require('gulp');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var path = require('path');
var karma = require('karma');
var karmaParseConfig = require('karma/lib/config').parseConfig;
var cachebust = require('gulp-cache-bust');
var config = require('./gulp.config')();
var minify = require('gulp-minify');
var uglify = require('gulp-uglify');

// Test was rremoved
gulp.task('build', function () {
    gulp.src(config.alljs)
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('default', function () {
    gulp.watch(['src/**/*.js'], ['build']);
});


/** single run */
gulp.task('test', function(callback) {
    runKarma('karma.conf.js', {
        autoWatch: false,
        singleRun: true
    }, callback);
});


gulp.task('QA-STAGE-BUILD', ['build', 'test'], function(callback) {
    gulp.src('dist/app.js')
        .pipe(minify({
            ext:{
                src:'.js',
                min:'-min.js'
            },
        }))
        .pipe(gulp.dest('dist'))

        gulp.src('dist/app-min.js')
        .pipe(uglify())
});

function runKarma(configFilePath, options, callback) {
    configFilePath = path.resolve(configFilePath);

    var server = karma.server;
    var log= gutil.log, colors = gutil.colors;
    var config = karmaParseConfig(configFilePath, {});

    Object.keys(options).forEach(function(key) {
        config[key] = options[key];
    });

    // TODO: undestand when you should exit (fail the test)
    server.start(config, function(exitCode) {
        log('Karma has exited with ' + colors.red(exitCode));
        callback();
       ///process.exit(exitCode);
    });
}

