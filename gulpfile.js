var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var livereload = require('gulp-livereload');
var connect = require('gulp-connect');
var bowerFiles = require('main-bower-files'),
    inject = require('gulp-inject'),
    stylus = require('gulp-stylus'),
    es = require('event-stream');
const del = require('del');

var app = {
  src:  'app/*.html',
  css:  'app/**/*.css',
  js :  'app/**/*.js',
  bower:'bower_components/'
}
var rootPath = 'dist';
var dist = {
  all:   [rootPath + '/**/*'  ],
  css:    rootPath + '/static/',
  js:     rootPath + '/static/',
  vendor: rootPath + '/static/'
};


// 清除文件
gulp.task('clean', function() {
    del([rootPath + '/**'], { dryRun: true }).then(paths => {
        console.log('Files and folders that would be deleted:\n', paths.join('\n'));
    });
});


// gulp.task('minify', function() {
// });

gulp.task('wrapbower', function() {
  var cssFiles = gulp.src(app.css)
      .pipe(stylus())
      .pipe(gulp.dest( dist.css ));

  var jsFiles = gulp.src( app.js )
      .pipe(gulp.dest( dist.js ));

  // var mailFiles = gulp.src('./app/**/*.js', { read: false });

  var jsVendorFiles = gulp.src( app.bower + '/**/*.js')
      .pipe(plugins.concat('vendors.js'))
      // .pipe(plugins.uglify())
      // .pipe(plugins.rename({suffix: '.min'}))
      .pipe(gulp.dest( dist.vendor));
  var cssVendorFiles = gulp.src(app.bower + '/**/*.css')
      .pipe(plugins.concat('vendors.css'))
      // .pipe(plugins.minifyCss({keepBreaks: true}))
      // .pipe(plugins.rename({suffix: '.min'}))
      .pipe(gulp.dest( dist.vendor ));

  return gulp.src( app.src )
        .pipe(inject( es.merge(cssVendorFiles, jsVendorFiles ), { name: 'bower' , relative: true} ))
        .pipe(inject( es.merge(cssFiles,       jsFiles       ), { relative: true} ))
        .pipe(gulp.dest( rootPath ));
});


gulp.task('watch', function(){
    // start web
    connect.server({
        root: '',//[__dirname +'/dist']
        port: 9000,
        livereload: true
    })
    // watch doc
    gulp.watch('./app/**/*.js', ['wrapbower']);
    gulp.watch('./app/**/*.css', ['wrapbower']);
    gulp.watch('./bower_components/**/*', ['wrapbower']);
    // run livereload
    livereload.listen();
    //  bind on doc change
    gulp.watch(['./app/**']).on('change', livereload.changed);
});


gulp.task('default',[ 'wrapbower' ]);

gulp.task('server',[ 'wrapbower' , 'watch' ]);
