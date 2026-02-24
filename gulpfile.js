const {src, dest, watch, parallel} = require('gulp'),
	scss				= require('gulp-sass')(require('sass')),
	postcss			= require('gulp-postcss'),
	autoprefixer	= require('autoprefixer'),
	fileInclude		= require('gulp-file-include'),
	sourcemaps		= require('gulp-sourcemaps'),
	plumber			= require('gulp-plumber'),
	del				= require('delete'),
	svgSprite		= require('gulp-svg-sprite'),
	svgo				= require('gulp-svgo'),
	replace			= require('gulp-replace'),
	cleanCSS			= require('gulp-clean-css'),
	browser_sync	= require('browser-sync');


// если аргумент src пустой, отключать соответствующие функции в exports.default (см. конец файла)
function jsPlugs() {
	return src([
		//'node_modules/jquery/dist/jquery.min.js',
		//'node_modules/bootstrap/dist/js/bootstrap.min.js',
		//'node_modules/bootstrap/dist/js/bootstrap.min.js.map',
		//'node_modules/popper.js/dist/umd/popper.min.js',
		//'node_modules/popper.js/dist/umd/popper.min.js.map',
		//'node_modules/slick-carousel/slick/slick.min.js',
		//'node_modules/slick-carousel/slick/slick.js',
		//'node_modules/owl.carousel/dist/owl.carousel.min.js',
		//'node_modules/swiper/swiper.min.js',
		//'node_modules/swiper/swiper.min.js.map',
		//'node_modules/swiper/swiper-bundle.min.js',
		//'node_modules/swiper/swiper-bundle.min.js.map',
		//'node_modules/nouislider/dist/nouislider.min.js',
		//'node_modules/wnumb/wNumb.js',
		//'node_modules/jquery-form-styler/dist/jquery.formstyler.min.js',
		//'node_modules/lightbox2/dist/js/lightbox.min.js',
		//'node_modules/lightcase/src/js/lightcase.js',
		//'node_modules/raty-js/build/raty.min.js',
		//'node_modules/jquery-mask-plugin/dist/jquery.mask.min.js',
		//'node_modules/flatpickr/dist/flatpickr.min.js',
		//'node_modules/flatpickr/dist/l10n/ru.js',
		//'node_modules/highcharts/highcharts.js'
	])
	.pipe(dest('dist/js'))
}

function cssPlugs() {
	return src([
		//'node_modules/bootstrap/dist/css/bootstrap.min.css',
		//'node_modules/bootstrap/dist/css/bootstrap.min.css.map',
		//'node_modules/slick-carousel/slick/slick.css',
		//'node_modules/jquery-form-styler/dist/jquery.formstyler.css',
		//'node_modules/jquery-form-styler/dist/jquery.formstyler.theme.css',
		//'node_modules/owl.carousel/dist/assets/owl.carousel.min.css',
		//'node_modules/owl.carousel/dist/assets/owl.theme.default.min.css',
		//'node_modules/nouislider/dist/nouislider.min.css',
		//'node_modules/lightbox2/dist/css/lightbox.min.css',
		//'node_modules/lightcase/src/css/lightcase.css',
		//'node_modules/swiper/swiper-bundle.min.css',
		//'node_modules/swiper/swiper.min.css',
		//'node_modules/flatpickr/dist/flatpickr.min.css'
	])
	.pipe(dest('dist/css'));
}

function imgsForPlugs() {
	return src(
		//'node_modules/lightbox2/dist/images/*.*', { encoding: false }
	)
	.pipe(dest('dist/img/images'));
}

function fontsForPlugs() {
	return src(
		//'node_modules/lightcase/src/fonts/*.*', { encoding: false }
		)
	.pipe(dest('dist/fonts'));
}

function getCssLibs() {
	return src('src/css/libs/*.*')
	.pipe(dest('dist/css'))
	.pipe(browser_sync.stream())
}

function htmlBuild() {
	return src('src/*.html')
		.pipe(fileInclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(dest('dist'));
}

function cssBuild() {
	return src(['src/css/*.scss', '!src/css/bs_custom.scss'])
	.pipe(plumber())
	.pipe(sourcemaps.init())
	.pipe(scss().on('error', scss.logError)) //можно .pipe(scss({outputStyle: 'compressed'}))
	.pipe(postcss([autoprefixer()]))
	.pipe(sourcemaps.write('.'))
	.pipe(dest('dist/css'))
	.pipe(browser_sync.stream())
}

function bsCssBuild() {
	return src('src/css/bs_custom.scss')
	.pipe(sourcemaps.init())
	.pipe(scss().on('error', scss.logError))
	.pipe(cleanCSS())
	.pipe(sourcemaps.write('.'))
	.pipe(dest('src/css/libs'))
}

function jsBuild() {
	return src(['src/js/*.js', 'src/js/*.json', 'src/js/libs/*.js'])
	.pipe(dest('dist/js'))
	.pipe(browser_sync.stream())
}

function imgBuild() {
	return src(['src/img/**/*.*', '!src/img/favicon/*.*', '!src/img/svg/*.*'], { encoding: false })
	.pipe(dest('dist/img'))
	.pipe(browser_sync.stream())
}

function favBuild() {
	return src('src/img/favicon/*.ico', { encoding: false })
	.pipe(dest('dist'))
	.pipe(browser_sync.stream())
}

function vidBuild() {
	return src(
		//'src/video/**/*.*', { encoding: false }
		)
	.pipe(dest('dist/video'))
	.pipe(browser_sync.stream())
}

function fontBuild() {
	return src('src/fonts/**/*.*', { encoding: false })
	.pipe(dest('dist/fonts'))
	.pipe(browser_sync.stream())
}

function watching() {
	watch(['src/css/libs/*.css'], getCssLibs)
	watch(['src/css/**/*.scss'], cssBuild)
	watch(['src/js/**/*.js'], jsBuild)
	watch(['src/img/**/*.*'], imgBuild)
	//watch(['src/video/**/*.*'], vidBuild)
	watch(['src/**/*.ico'], favBuild)
	watch(['src/fonts/**/*.*'], fontBuild)
	watch(['src/**/*.html'], htmlBuild).on('change', browser_sync.reload)
}

function browserSync() {
	browser_sync.init({
		server: {
			baseDir: 'dist'
		},
		port: 3300,
		ui: {
			port: 4400
		}
	})
}

function clean() {
	return del.sync('dist')
}

function svgSpriteBuild() {
	return src('src/img/svg/*.svg')
		.pipe(svgo({
			plugins: [
				{ removeAttrs: { attrs: ['fill', 'style'] } },
				{ removeStyleElement: true },
				{ removeUselessStrokeAndFill: true },
				{ removeXMLNS: true } // удаляет xmlns если нужно
			]
		}))
		.pipe(svgSprite({
			mode: {
				symbol: {
					sprite: 'symbol_sprite.svg',
					example: false,
					dest: ''
				}
			},
			shape: {
				id: {
					generator: 'icon-%s',
					separator: '_'
				}
			},
			svg: {
				namespaceClassnames: false
			}
		}))
		.pipe(dest('src/img'))
		.on('end', () => {
			// Форматируем уже созданный файл
			src('src/img/symbol_sprite.svg')
				// Сначала добавляем переносы для всех элементов
				.pipe(replace(/<(\/?(?:symbol|path|rect|circle))([^>]*)>/g, '\n<$1$2>'))
				// Затем добавляем отступы
				.pipe(replace(/\n<symbol/g, '\n  <symbol'))
				.pipe(replace(/\n<\/symbol>/g, '\n  </symbol>'))
				.pipe(replace(/\n<path/g, '\n    <path'))
				.pipe(replace(/\n<\/path>/g, '\n    </path>'))
				.pipe(replace(/<svg[^>]*>/g, '$&\n  '))
				.pipe(replace(/<\/svg>/g, '\n</svg>'))
				// Убираем лишние переносы
				.pipe(replace(/\n\s*\n/g, '\n'))
				.pipe(dest('src/img'));
		})
}

// exports.htmlBuild = htmlBuild;
// exports.cssBuild = cssBuild;
// exports.jsBuild = jsBuild;
// exports.getCssLibs = getCssLibs;
// exports.watching = watching;
// exports.browserSync = browserSync;
exports.ssb = svgSpriteBuild;
exports.bscss = bsCssBuild;

exports.default = parallel(
	clean,
	//jsPlugs,
	//cssPlugs,
	//imgsForPlugs,
	//fontsForPlugs,
	getCssLibs,
	cssBuild,
	jsBuild,
	imgBuild,
	//vidBuild,
	favBuild,
	fontBuild,
	htmlBuild,
	browserSync,
	watching
)