var gulp = require('gulp');
var mocha = require('gulp-mocha');
var nodemon = require('gulp-nodemon')
var browserify = require('gulp-browserify')

// Nodemon task
gulp.task('nodemon', function(){
  nodemon({ script: 'server.js' });
});

// Browserify task
gulp.task('browserify', function(){
  gulp.
    src('./public/js/app.js').
    pipe(browserify()).
    pipe(gulp.dest('./public/bin'));
});

// Run the server tests
gulp.task('test:server', function(){
  gulp.
    src('./test.js').
    pipe(mocha()).
    on('error', function(error){
      this.emit('end');
    });
});

// Watch all server files for changes & run server tests (test:server) task on changes
gulp.task('watch:server', function(){
  gulp.watch(['./*.js', './config/**/*.js', './app/**/*.js'], ['test:server']);
});

// Watch js client files for changes & run browserify task on changes
gulp.task('watch:client', function(){
  gulp.watch('./public/js/*.js', ['browserify']);
});

// Run the server
gulp.task('default', ['browserify', 'nodemon']);
