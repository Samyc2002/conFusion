"use strict";

var express = require('express');

var bodyParser = require('body-parser');

var User = require('../models/users');

var passport = require('passport');

var cors = require('./cors');

var authenticate = require('../authenticate');

var router = express.Router();
router.use(bodyParser.json());
/* GET users listing. */

router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  User.find({}, function (err, user) {
    if (err) {
      return next(err);
    } else {
      res.statusCode = 200;
      res.setHeader('Content_type', 'application/json');
      res.json(user);
    }
  });
});
router.post('/signup', cors.corsWithOptions, function (req, res, next) {
  User.register(new User({
    username: req.body.username
  }), req.body.password, function (err, user) {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-type', 'application/json');
      res.json({
        err: err
      });
    } else {
      if (req.body.firstname) {
        user.firstname = req.body.firstname;
      }

      if (req.body.lastname) {
        user.lastname = req.body.lastname;
      }

      user.save(function (err, user) {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-type', 'application/json');
          res.json({
            err: err
          });
          return;
        }

        passport.authenticate('local')(req, res, function () {
          res.statusCode = 200;
          res.setHeader('Content-type', 'application/json');
          res.json({
            success: true,
            status: 'Registration successful!'
          });
        });
      });
    }
  });
});
router.post('/login', cors.corsWithOptions, passport.authenticate('local'), function (req, res) {
  var token = authenticate.getToken({
    _id: req.user._id
  });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    token: token,
    status: 'You are successfully logged in!'
  });
});
router.get('/logout', cors.corsWithOptions, function (req, res, next) {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});
router.get('/facebook/token', passport.authenticate('facebook-token'), function (req, res) {
  if (req.user) {
    var token = authenticate.getToken({
      _id: req.user._id
    });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      token: token,
      status: 'You are successfully logged in!'
    });
  }
});
module.exports = router;