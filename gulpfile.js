/**
 * *****组件安装*****
 * 
 * npm install --save-dev gulp gulp-sass gulp-uglify gulp-tinypng-compress gulp-notify browser-sync gulp-babel @babel/core @babel/preset-env gulp-autoprefixer gulp-minify-css del flyio
 * 
 * *****项目结构*****
 * wx_project(项目名称)
 *    |–node_modules 组件目录
 *    |–dist 发布环境
 *        |–css 样式文件(style.css)
 *        |–images 图片文件(压缩图片)
 *        |–js js文件(common.js)
 *        |–index.html 静态文件(压缩html)
 *    |–dev 生产环境
 *        |–sass sass文件
 *        |–images 图片文件
 *        |–js js文件
 *        |–index.html 静态文件
 *    |–config.rb Compass配置文件
 *    |-package.json 项目信息
 *    |–gulpfile.js gulp任务文件
 **/


//引用插件模块
const gulp = require('gulp')
const sass = require('gulp-sass') //sass
const replace = require('gulp-replace') //替换
const rename = require('gulp-rename') //重命名
const imagemin = require('gulp-imagemin') //压缩图片
const clean = require('gulp-clean') //删除
const tap = require('gulp-tap') //遍历文件
const htmlmin = require('gulp-htmlmin') //压缩html
const jsonminify = require('gulp-jsonminify2') //压缩json
const minifyCss = require('gulp-minify-css') //压缩css
const babel = require('gulp-babel') //es6转es5
const uglify = require('gulp-uglify') //压缩js
const autoprefixer = require('gulp-autoprefixer') //添加浏览器前缀
const tinypng = require('gulp-tinypng') //熊猫图片压缩（api：mlpo9GLfJmqCRXyZpl75lEcE2UtyXxa1）
const path = require('path') //自带的处理文件路径
const del = require('del') //自带的删除模块
const flyio = require('flyio') //自带的删除模块

// task()：定义任务
// src():源文件
// pipe():管道流，接通源头文件与目标文件的输出
// dest():输出文件的目的地
// watch():监视文件

// const path = './dist';

// 开发处理

// sass编译
const config = require('./build/config')
const hasRmCssFiles = new Set()

gulp.task('sass', () => {
  return gulp
    .src('./src/**/*.{scss,wxss}')
    .pipe(
      tap(file => {
        // 当前处理文件的路径
        const filePath = path.dirname(file.path)
        // 当前处理内容
        const content = file.contents.toString()
        // 找到filter的scss，并匹配是否在配置文件中
        content.replace(/@import\s+['|"](.+)['|"];/g, ($1, $2) => {
          const hasFilter = config.cssFilterFiles.filter(
            item => $2.indexOf(item) > -1
          )
          // hasFilter > 0表示filter的文件在配置文件中，打包完成后需要删除
          if (hasFilter.length > 0) {
            const rmPath = path.join(filePath, $2)
            // 将src改为dist，.scss改为.wxss，例如：'/xxx/src/scss/const.scss' => '/xxx/dist/scss/const.wxss'
            const filea = rmPath
              .replace(/src/, 'dist')
              .replace(/\.scss/, '.wxss')
            // 加入待删除列表
            hasRmCssFiles.add(filea)
          }
        })
        // console.log('rm', hasRmCssFiles);
      })
    )
    .pipe(
      replace(/(@import.+;)/g, ($1, $2) => {
        const hasFilter = config.cssFilterFiles.filter(
          item => $1.indexOf(item) > -1
        )
        if (hasFilter.length > 0) {
          return $2
        }
        return `/** ${$2} **/`
      })
    )
    .pipe(
      sass({
        outputStyle: 'expanded'
      }).on('error', sass.logError)
    )
    .pipe(
      replace(/(\/\*\*\s{0,})(@.+)(\s{0,}\*\*\/)/g, ($1, $2, $3) =>
        $3.replace(/\.scss/g, '.wxss')
      )
    )
    .pipe(
      rename({
        extname: '.wxss'
      })
    )
    .pipe(gulp.dest('./dist'))
})

// js
gulp.task('js', () => {
  return gulp
    .src('./src/**/*.js')
    .pipe(
      babel({
        presets: ['es2015']
      })
    )
    .pipe(gulp.dest('./dist'))
})

// json
gulp.task('json', () => {
  return gulp.src('./src/**/*.json').pipe(gulp.dest('./dist'))
})

// wxml
gulp.task('wxml', () => {
  return gulp.src('./src/**/*.wxml').pipe(gulp.dest('./dist'))
})

// 直接复制资源assets
gulp.task('assets', () => {
  return gulp.src('./src/assets/**').pipe(gulp.dest('./dist/assets'))
})

// tinypng压缩图片
gulp.task('tinypng', () => {
  return gulp.src('./src/assets/images/**').pipe(gulp.dest('./dist/assets/images'))
})


// 清除输出
gulp.task('clean', () => {
  return del(['./dist/**'])
})

// 清理无效wxss文件
// gulp.task('cleanWxss', () => {
//   const arr = [];
//   hasRmCssFiles.forEach((item) => {
//     arr.push(item);
//   });
//   return gulp.src(arr, {
//       read: false
//     })
//     .pipe(clean({
//       force: true
//     }));
// });

// 打包处理：

// 压缩js
gulp.task('js_min', () => {
  return gulp
    .src('./src/**/*.js')
    .pipe(
      babel({
        presets: ['es2015']
      })
    )
    .pipe(
      uglify({
        compress: true
      })
    )
    .pipe(gulp.dest('./dist'))
})

// 压缩json
gulp.task('json_min', () => {
  return gulp
    .src('./src/**/*.json')
    .pipe(jsonminify())
    .pipe(gulp.dest('./dist'))
})

// 压缩wxss
gulp.task('wxss_min', () => {
  return gulp
    .src('./dist/**/*.wxss')
    .pipe(autoprefixer(['iOS >= 8', 'Android >= 4.1']))
    .pipe(minifyCss())
    .pipe(gulp.dest('./dist'))
})

// 压缩wxml 会导致组件值被压缩掉
// gulp.task('wxml_min', () => {
//   return gulp
//     .src('./src/**/*.wxml')
//     .pipe(
//       htmlmin({
//         collapseWhitespace: true,
//         removeComments: true,
//         keepClosingSlash: true
//       })
//     )
//     .pipe(gulp.dest('./dist'))
// })

// 压缩图片
gulp.task('image', function () {
  return gulp
    .src('./src/**/*.{png,jpg,gif,ico}')
    .pipe(
      imagemin({
        interlaced: true, //隔行扫描压缩jpg图片
        optimizationLevel: 5, //0-7
        progressive: true, //无损压缩jpg
        multipass: true //多次优化svg直到最优
      })
    )
    .pipe(gulp.dest('./dist'))
})

// 初始化
gulp.task('init', function () {
  return gulp.src('./src/**/*')
    .pipe(gulp.dest('./dist'));
})

// 监听文件变化
gulp.task('watch', function () {
  gulp.watch('./src/**/*.js', gulp.parallel('js'))
  gulp.watch('./src/**/*.json', gulp.parallel('json'))
  gulp.watch('./src/**/*.{scss,wxss}', gulp.parallel('sass'))
  gulp.watch('./src/**/*.wxml', gulp.parallel('wxml'))
  gulp.watch('./src/assets/**', gulp.parallel('assets'))
})

// 监听文件html变化
gulp.task('watch_html', function () {
  gulp.watch('./src/**/*.{scss,wxss}', gulp.parallel('sass'))
  gulp.watch('./src/**/*.wxml', gulp.parallel('wxml'))
})

// 监听文件js变化
gulp.task('watch_js', function () {
  gulp.watch('./src/**/*.js', gulp.parallel('js'))
})

// 开发模式
gulp.task(
  'dev',
  gulp.series('clean', gulp.parallel('js', 'json', 'wxml', 'sass'), 'assets', 'watch'),
)

// 切图模式,只监听wxml,sass的修改
gulp.task(
  'html',
  gulp.series('clean', gulp.parallel('js', 'json', 'wxml', 'sass'), 'assets', 'watch_html'),
)

// js，只监听js的修改
gulp.task(
  'dev_js',
  gulp.series('clean', gulp.parallel('js', 'json', 'wxml', 'sass'), 'assets', 'watch_js'),
)


// 打包模式
gulp.task(
  'build',
  gulp.series(
    'clean',
    gulp.parallel('sass', 'js_min', 'json_min', 'wxss_min', 'wxml'),
    'assets', 'tinypng'
  )
)