var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var routerProduct = require('./routes/product');
var routerAdmin = require('./routes/admin');

var app = express();

//解决跨域
app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (req.method == 'OPTIONS') {
    res.send(200);
  }
  else {
    next();
  }
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
// extended: true 代表可以接收任何数据类型的数据
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// 配置静态目录
app.use(express.static(path.join(__dirname, 'public')));


//引入模块
const formidable = require('express-formidable');
//挂载
app.use(formidable({ multiples: true,uploadDir: "./public/images/upload"}));


// 普通用户
app.use('/user', routerProduct);
// 管理员用户
app.use('/admin', routerAdmin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
