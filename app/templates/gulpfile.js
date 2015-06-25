// -------------------------------------------------------
//  Author:    CreativeKoen
//  Github:    github.com/CreativeKoen
// -------------------------------------------------------
var gulp = require('gulp');
var args = require('yargs').argv;
var $ = require('gulp-load-plugins')();

var browserSync	= require('browser-sync');
var reload			= browserSync.reload;

var pkg				= require('./package.json');

var build			= !!(args.build);
var dist			= !!(args.dist);





var displayError = function(error) {
    var errorString = '[' + error.plugin + ']';
    errorString += ' ' + error.message.replace("\n",'');
    if(error.fileName)
        errorString += ' in ' + error.fileName;
    if(error.lineNumber)
        errorString += ' on line ' + error.lineNumber;
    console.error(errorString);
}





var SOURCEPATH = 'source/';
var BUILDPATH = 'build/';
var DISTPATH = 'dist/';
<% if (includeStylus) {%>




// -------------------------------------------------------
// Stylus
// -------------------------------------------------------
gulp.task('stylus', function () {
	var nib = require('nib');
	var rupture = require('rupture');
	var lost = require('lost');
	gulp.src(SOURCEPATH+'stylus/*.styl')
		.pipe($.memoryCache('stylusCached'))
		.pipe($.stylus({
			compress: false,
			errLogToConsole: true
		<% if (includeStylusStack) { %>
			,use: [ nib(), rupture()]
		<% } %>
		}))
		<% if (includeStylusStack) { %>
		.pipe($.postcss([lost()]))
		<% } %>
		.pipe($.autoprefixer({
            browser: [
              'last 2 version',
              'Firefox ESR',
              'Opera 12.1',
              'ie10',
              'ie11'
		],
            cascade: true}))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.if(args.dist, $.minifyCss()))
        .pipe($.if(args.build, gulp.dest(BUILDPATH+'css')))
        .pipe($.if(args.dist, gulp.dest(DISTPATH+'css')));
});
<% } %>
<% if (includeSass) {%>
// -------------------------------------------------------
// Sass
// -------------------------------------------------------
gulp.task('scss', function () {
// var breakpoint-sass = require('breakpoint-sass');
// there is a failing build of breakpoint-sass so import it using bower

// task failing
	var lost = require('lost');
	gulp.src(SOURCEPATH+'scss/*.scss')
		.pipe($.memoryCache('scssCached'))
		.pipe($.sass({
			compress: false,
			errLogToConsole: false
		}))
		<% if (includeSassStack) { %>
		.pipe($.postcss([lost()]))
		<% } %>
		.on('error', function(err){ displayError(err);})
		.pipe($.autoprefixer({
            browser: [
              'last 2 version',
              'Firefox ESR',
              'Opera 12.1',
              'ie10',
              'ie11'
		],
            cascade: true}))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.if(args.dist, $.minifyCss()))
        .pipe($.if(args.build, gulp.dest(BUILDPATH+'css')))
        .pipe($.if(args.dist, gulp.dest(DISTPATH+'css')));
});
<% } %>





// -------------------------------------------------------
// Scripts
// -------------------------------------------------------
gulp.task('scripts', function () {
	gulp.src(SOURCEPATH+'js/*.js')
			.pipe($.memoryCache('jsCached'))
			.pipe($.jshint())
			.pipe($.jshint.reporter($.jshintStylish))
			.pipe($.plumber())
			.pipe($.uglify())
			//.pipe($.if(args.dist, $.concat('main.js')))
			.pipe($.if(args.dist, $.rename({ suffix: '.min' })))
			.pipe($.if(args.build, gulp.dest(BUILDPATH+'js')))
			.pipe($.if(args.dist, gulp.dest(DISTPATH+'js') ));
});





<% if(includeHtmlJade){%>
// -------------------------------------------------------
// Jade
// -------------------------------------------------------
gulp.task('jade', function () {
	gulp.src(SOURCEPATH+'*.jade')
		.pipe($.memoryCache('jadeCached'))
		.pipe($.if(args.build, $.jade({pretty: false}) ))
		.pipe($.if(args.dist, $.jade({pretty: true}) ))
		.pipe($.if(args.build, gulp.dest(BUILDPATH)))
		.pipe($.if(args.dist, gulp.dest(DISTPATH)));
});
<% } %>
<% if(includePhpJade){%>
// -------------------------------------------------------
// Jade to PHP
// -------------------------------------------------------
gulp.task('jadePhp', function () {
	gulp.src(SOURCEPATH+'*.jade')
		.pipe($.memoryCache('jadePhpCached'))
		.pipe($.if(args.build, $.jadePhp({pretty: false}) ))
		.pipe($.if(args.dist, $.jadePhp({pretty: true}) ))
		.pipe($.if(args.build, gulp.dest(BUILDPATH)))
		.pipe($.if(args.dist, gulp.dest(DISTPATH)));
});
gulp.task(jadePhp);
<% } %>
<% if(includeHtml){%>
// -------------------------------------------------------
// HTML
// -------------------------------------------------------
gulp.task('html', function () {
	gulp.src(SOURCEPATH+'*.html')
		.pipe($.memoryCache('htmlCached'))
		.pipe($.if(args.build, gulp.dest(BUILDPATH)))
		.pipe($.if(args.dist, gulp.dest(DISTPATH)));
});
<% } %>
<% if(includePhp){%>
// -------------------------------------------------------
// PHP
// -------------------------------------------------------
gulp.task('php', function () {
	gulp.src(SOURCEPATH+'*.php')
		.pipe($.memoryCache('phpCached'))
		.pipe($.if(args.build, gulp.dest(BUILDPATH)))
		.pipe($.if(args.dist, gulp.dest(DISTPATH)));
});
<% } %>





// -------------------------------------------------------
// Editor
// -------------------------------------------------------
gulp.task('editor', function () {
	var options = {err: true,stderr: true,stdout: true};
	gulp.src('/', {read:false})
		.pipe($.exec('gvim'))
		.pipe($.exec.reporter(options));
});





// -------------------------------------------------------
// Clean tasks
// -------------------------------------------------------
gulp.task('clean:build', function (done) {
	var del = require('del');
	del(['build'], done);
});

gulp.task('clean:dist', function (done) {
	var del = require('del');
	del(['dist'], done);
});

gulp.task('cleanCache', function () {
    $.memoryCache.caches = {};
    console.log("Deleted cache files!"+'\n');
});





// -------------------------------------------------------
// Vendor
// -------------------------------------------------------
gulp.task('vendor:js', function(){
	gulp.src([
		'bower_components/jquery/dist/jquery.min.js',
		'bower_components/modernizr/modernizr.js',
		'source/js/vendor/*.js'
		])
		.pipe($.if(args.build, gulp.dest(BUILDPATH+'js/vendor')))
		.pipe($.if(args.dist, gulp.dest(DISTPATH+'js/vendor')))
});

gulp.task('vendor:css', function(){
	gulp.src(['bower_components/normalize.css/normalize.css'])
		.pipe($.if(args.build, gulp.dest(BUILDPATH+'css/vendor')))
		.pipe($.if(args.dist, gulp.dest(DISTPATH+'css/vendor')))
});

gulp.task('vendor', gulp.series('vendor:js','vendor:css'));





// -------------------------------------------------------
// Watch
// -------------------------------------------------------
gulp.task('watch', function () {

	// build server
	if (args.build == true) {
		console.log('-----------------------\n');
		console.log('build server is running\n');
		console.log('-----------------------\n');
		browserSync({
		//proxy: 'local.example.nl',
			server: {
				baseDir: BUILDPATH
			},
			index: 'index.html',
			port: 3000,
			notify: false,
			open: true,
			ui: false,
			browser: ['firefox']

			/*
			this is to see the http requests
			uncomment if you want that
			*/

			// middleware: function(req, res, next){
			//	console.log(req.url);
			//	next();
			//}
		});
	}
	if (args.dist == true) {
		console.log('-----------------------\n');
		console.log('dist server is running \n');
		console.log('-----------------------\n');
		browserSync({
			//proxy: 'local.gelskemout.nl',
			server: {
				baseDir: DISTPATH
			},
			index: 'index.html',
			port: 6000,
			notify: false,
			open: true,
			ui: false,
			browser: ['firefox']

			/*
			this is to see the http requests
			uncomment if you want that
			*/

			// middleware: function(req, res, next){
			//     console.log(req.url);
			//     next();
			// }
		});
	}


    var watchFiles = [
        'source/scss/**/*.scss'
        ,'source/stylus/**/*.styl'
        ,'source/js/**.js'
        ,'source/*.jade',
        ,'source/*.php',
        'source/*.html'
    ];


<% if(includeHtml){%>
    gulp.watch( watchFiles[5],
        gulp.parallel('html', reload))
            .on('change', function(event){
                console.log('cache check');
                if (event.type === 'deleted'){
                    $.memoryCache.forget('htmlCached', event.path);
                    console.log('a file was deleted');
                }
                else{
                    $.memoryCache.update('htmlCached');
                    console.log('cache updated');
                }
            });
<% } %>

<% if(includePhp){%>
    gulp.watch( watchFiles[4],
        gulp.parallel('php', reload ))
            .on('change', function(event){
                console.log('cache check');
                if (event.type === 'deleted'){
                    $.memoryCache.forget('phpCached', event.path);
                    console.log('a file was deleted');
                }
                else{
                    $.memoryCache.update('phpCached');
                    console.log('cache updated');
                }
            });
<% } %>

<% if(includeHtmlJade){%>
    gulp.watch( watchFiles[3],
        gulp.parallel('jade', reload ))
            .on('change', function(event){
                console.log('cache check');
                if (event.type === 'deleted'){
                    $.memoryCache.forget('jadeCached', event.path);
                    console.log('a file was deleted');
                }
                else{
                    $.memoryCache.update('jadeCached');
                    console.log('cache updated');
                }
            });
<% } %>

<% if(includePhpJade){%>
    gulp.watch( watchFiles[3],
        gulp.parallel('jadePhp', reload ))
            .on('change', function(event){
                console.log('cache check');
                if (event.type === 'deleted'){
                    $.memoryCache.forget('jadePhpCached', event.path);
                    console.log('a file was deleted');
                }
                else{
                    $.memoryCache.update('jadePhpCached');
                    console.log('cache updated');
                }
            });
<% } %>
// CACHE scripts/sass/stylus/
<% if (includeStylus) {%>
    gulp.watch( watchFiles[1],
        gulp.parallel('stylus', reload ))
            .on('change', function(event){
                console.log('cache check');
                if (event.type === 'deleted'){
                    $.memoryCache.forget('stylusCached', event.path);
                    console.log('a file was deleted');
                }
                else{
                    $.memoryCache.update('stylusCached');
                    console.log('cache updated');
                }
            });
<% } %>

<% if (includeSass) {%>
    gulp.watch( watchFiles[0],
        gulp.parallel('scss', reload ))
            .on('change', function(event){
                console.log('cache check');
                if (event.type === 'deleted'){
                    $.memoryCache.forget('scssCached', event.path);
                    console.log('a file was deleted');
                }
                else{
                    $.memoryCache.update('scssCached');
                    console.log('cache updated');
                }
            });
<% } %>

    gulp.watch( watchFiles[2],
        gulp.parallel('scripts', reload ))
            .on('change', function(event){
                console.log('cache check');
                if (event.type === 'deleted'){
                    $.memoryCache.forget('scriptsCached', event.path);
                    console.log('a file was deleted');
                }
                else{
                    $.memoryCache.update('scriptsCached');
                    console.log('cache updated');
                }
            });
});





// -------------------------------------------------------
// Build
// -------------------------------------------------------
gulp.task('build',
	gulp.parallel(
		'cleanCache',
		'scripts',
		<% if (includeStylus) {%>'stylus'<% } %>
		<% if (includeSass) {%>'scss'<% } %>,
		<% if (includeHtml) {%>'html'<% } %>
		<% if (includeHtmlJade) {%>'jade'<% } %>
		<% if (includePhp) {%>'php'<% } %>
		<% if (includePhpJade) {%>'jadePhp'<% } %>
));





// -------------------------------------------------------
// Serve
// -------------------------------------------------------
gulp.task('serve', gulp.series('build', 'watch','editor'),
	gulp.parallel(
		'scripts',
		<% if (includeStylus) {%>'stylus'<% } %>
		<% if (includeSass) {%>'scss'<% } %>,
		<% if (includeHtml) {%>'html'<% } %>
		<% if (includeHtmlJade) {%>'jade'<% } %>
		<% if (includePhp) {%>'php'<% } %>
		<% if (includePhpJade) {%>'jadePhp'<% } %>
));
