"use strict";

var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;

var User = require('./models/users');

var jwtStrategy = require('passport-jwt').Strategy;

var ExtractJwt = require('passport-jwt').ExtractJwt;

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens


var FacebookTokenStrategy = require('passport-facebook-token');

var config = require('./config');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
  return jwt.sign(user, config.secretKey, {
    expiresIn: 3600
  });
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;
exports.jwtPassport = passport.use(new jwtStrategy(opts, function (jwt_payload, done) {
  console.log("JWT Payload: ", jwt_payload);
  User.findOne({
    _id: jwt_payload._id
  }, function (err, user) {
    if (err) {
      return done(err, false);
    } else if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
}));
exports.verifyUser = passport.authenticate('jwt', {
  session: false
});

exports.verifyAdmin = function (req, res, next) {
  if (req.user.admin) {
    next();
  } else {
    var err = new Error('You are not authorized to perform this operation!');
    err.status = 403;
    return next(err);
  }
};

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
  clientID: config.facebook.clientId,
  clientSecret: config.facebook.clientSecret
}, function (accessToken, refreshToken, profile, done) {
  User.findOne({
    facebookId: profile.id
  }, function (err, user) {
    if (err) {
      return done(err, false);
    }

    if (!err && user !== null) {
      return done(null, user);
    } else {
      user = new User({
        username: profile.displayName
      });
      user.facebookId = profile.id;
      user.firstname = profile.name.givenName;
      user.lastname = profile.name.familyName;
      user.save(function (err, user) {
        if (err) return done(err, false);else return done(null, user);
      });
    }
  });
}));