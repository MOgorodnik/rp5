// function defaultTask(cb) {
//   // place code for your default task here
//   cb();
// }

// exports.default = defaultTask;

const project_folder = 'prod';
const source_folder = '#src';

const path = {
  build: {
    html: project_folder + '/',
    fonts: project_folder + '/fonts/',
    img: project_folder + '/img/',
    js: project_folder + '/js/',
    css: project_folder + '/css/',
  },
  src: {
    html: [source_folder + '/*.html', '!' + source_folder + '/_*.html'],
    fonts: source_folder + '/fonts/*.ttf',
    img: source_folder + '/img/**/*.{jpg, jpeg, png, svg, gif, ico, webp}', // or /*.+(png|jpg|gif|ico|svg|webp)
    js: source_folder + '/scripts/main.js',
    css: source_folder + '/styles/style.scss',
  },
  watch: {
    html: source_folder + '/**/*.html',
    img: source_folder + '/img/**/*.{jpg, jpeg, png, svg, gif, ico, webp}', // or /*.+(png|jpg|gif|ico|svg|webp)
    js: source_folder + '/scripts/**/*.js/',
    css: source_folder + '/styles/**/*.scss',
  },
  clean: './' + project_folder + '/',
};

// Get modules
const { src, dest } = require('gulp');
const gulp = require('gulp');
const createServe = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const del = require('del');
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const group_media = require('gulp-group-css-media-queries');
const clean_css = require('gulp-clean-css');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const webp_html = require('gulp-webp-html');
const webp_css = require('gulp-webp-css');

// Create server
function browserSync(params) {
  createServe.init({
    server: {
      baseDir: './' + project_folder + '/',
    },
    port: 3003,
    notify: false,
  });
}

// Tools for HTML files
function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webp_html())
    .pipe(dest(path.build.html))
    .pipe(createServe.stream());
}

// Tools for CSS files
function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: 'expanded',
      })
    )
    .pipe(group_media())
    .pipe(
      autoprefixer({
        overrideBrowserList: ['last 5 version'],
        cascade: true,
      })
    )
    .pipe(
      webp_css({
        webpClass: '.webp',
        noWebpClass: '.no-webp'
      })
    )
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
      rename({
        extname: '.min.css',
      })
    )
    .pipe(dest(path.build.css))
    .pipe(createServe.stream());
}

// Tools for JavaScript files
function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(rename('index.js'))
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        extname: '.min.js',
      })
    )
    .pipe(dest(path.build.js))
    .pipe(createServe.stream());
}

// Tools for IMAGES files
function images() {
  return src(path.src.img)
    .pipe(
      webp({
        quality: 70
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3, // 0 to 7
      })
    )
    .pipe(dest(path.build.img))
    .pipe(createServe.stream());
}

// Watch changes in files
function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}

// Clean prod directory
function clean() {
  return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
