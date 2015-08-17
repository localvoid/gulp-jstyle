# gulp-jstyle

[Gulp](http://gulpjs.com) plugin for
[jstyle](https://github.com/localvoid/jstyle).

## Install

```sh
$ npm install --save-dev gulp-jstyle
```

You also need to have [jstyle](http://github.com/localvoid/jstyle)
installed.


## Usage

```js
var gulp = require('gulp');
var jstyle = require('gulp-jstyle');

gulp.task('default', function () {
	return gulp.src('css.js')
		.pipe(jstyle({minifyClassNames: true}))
		.pipe(gulp.dest('build'));
});
```

## API

### jstyle(options)

#### options

##### executable

Type: `String`  
Default: `jstyle`

Path to `jstyle` executable.

##### minifyClassNames

Type: `Boolean`  
Default: `false`

Minify class names and generate json map with minified names.

##### closureMap

Type: `Boolean`  
Default: `false`

Generate javascript file with minified class names for google-closure
library.

##### closureMapPrefix

Type: `String`  
Default: `css.map`

Package name prefix for closure map file.
