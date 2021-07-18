"use strict";

var express = require('express');

var bodyparser = require('body-parser');

var mongoose = require('mongoose');

var cors = require('./cors');

var Promotions = require('../models/promotions');

var authenticate = require('../authenticate');

var promoRouter = express.Router();
promoRouter.use(bodyparser.json()); // collection router goes here

promoRouter.route('/').options(cors.corsWithOptions, function (req, res) {
  res.sendStatus(200);
}).get(cors.cors, function (req, res, next) {
  Promotions.find(req.query).then(function (promotions) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(promotions);
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
}).post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  Promotions.create(req.body).then(function (promotion) {
    console.log('Promotion Created ', promotion);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(promotion);
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
}).put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  res.statusCode = 403;
  res.end('PUT operation not supported');
})["delete"](cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  Promotions.remove({}).then(function (resp) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
}); // specific router goes here

promoRouter.route('/:promoId').options(cors.corsWithOptions, function (req, res) {
  res.sendStatus(200);
}).get(cors.cors, function (req, res, next) {
  Promotions.findById(req.params.promoId).then(function (promotion) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(promotion);
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
}).post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  res.statusCode = 403;
  res.end('POST operation not supported on /promotions/' + req.params.promoId);
}).put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  Promotions.findByIdAndUpdate(req.params.promoId, {
    $set: req.body
  }, {
    "new": true
  }).then(function (promotion) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(promotion);
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
})["delete"](cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  Promotions.findByIdAndDelete(req.params.promoId).then(function (resp) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
});
module.exports = promoRouter;