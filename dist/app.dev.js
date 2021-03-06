"use strict";

var createError = require('http-errors');

var express = require('express');

var path = require('path');

var cookieParser = require('cookie-parser');

var logger = require('morgan');

var mongoose = require('mongoose');

var session = require('express-session');

var Filestore = require('session-file-store')(session);

var passport = require('passport');

var authenticate = require('./authenticate');

var config = require('./config');

var Dishes = require('./models/dishes');

var dishRouter = require('./routes/dishRouter');

var promoRouter = require('./routes/promoRouter');

var leaderRouter = require('./routes/leaderRouter');

var uploadRouter = require('./routes/uploadRouter');

var favouriteRouter = require('./routes/favouriteRouter');

var commentRouter = require('./routes/commentRouter');

var indexRouter = require('./routes/index');

var usersRouter = require('./routes/users');

var url = config.mongoUrl;
var connect = mongoose.connect(url);
connect.then(function (db) {
  console.log('Connected correctly to the Server');
}, function (err) {
  console.log(err);
});
var app = express(); // secure server only

app.all('*', function (req, res, next) {
  if (req.secure) {
    return next();
  } else {
    res.redirect(307, "https://".concat(req.hostname, ":").concat(app.get('secPort')));
  }
}); // view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(passport.initialize());
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(express["static"](path.join(__dirname, 'public')));
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favouriteRouter);
app.use('/comments', commentRouter); // catch 404 and forward to error handler

app.use(function (req, res, next) {
  next(createError(404));
}); // error handler

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}; // render the error page

  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;