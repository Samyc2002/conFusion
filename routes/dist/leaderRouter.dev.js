"use strict";

var express = require('express');

var bodyparser = require('body-parser');

var mongoose = require('mongoose');

var cors = require('./cors');

var Leaders = require('../models/leaders');

var authenticate = require('../authenticate');

var leaderRouter = express.Router();
leaderRouter.use(bodyparser.json()); // collection router goes here

leaderRouter.route('/').options(cors.corsWithOptions, function (req, res) {
  res.sendStatus(200);
}).get(cors.cors, function (req, res, next) {
  Leaders.find({}).then(function (leaders) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(leaders);
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
}).post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  Leaders.create(req.body).then(function (leader) {
    console.log('Leader Created ', leader);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(leader);
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
}).put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  res.statusCode = 403;
  res.end('PUT operation not supported');
})["delete"](cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  Leaders.remove({}).then(function (resp) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
}); // specific router goes here

leaderRouter.route('/:leaderId').options(cors.corsWithOptions, function (req, res) {
  res.sendStatus(200);
}).get(cors.cors, function (req, res, next) {
  Leaders.findById(req.params.leaderId).then(function (leader) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(leader);
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
}).post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  res.statusCode = 403;
  res.end('POST operation not supported on /promotions/' + req.params.leaderId);
}).put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  Leaders.findByIdAndUpdate(req.params.leaderId, {
    $set: req.body
  }, {
    "new": true
  }).then(function (leader) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(leader);
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
})["delete"](cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  Leaders.findByIdAndDelete(req.params.leaderId).then(function (resp) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
});
module.exports = leaderRouter;