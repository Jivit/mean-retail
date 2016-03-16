var gulp = require('gulp');
var mocha = require('gulp-mocha');
var nodemon = require('gulp-nodemon')

// Nodemon task
gulp.task('nodemon', function(){
  nodemon({ script: 'server.js' });
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

// Run the server
gulp.task('default', ['nodemon']);
