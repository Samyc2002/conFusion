"use strict";

var express = require('express');

var bodyparser = require('body-parser');

var mongoose = require('mongoose');

var cors = require('./cors');

var Dishes = require('../models/dishes');

var authenticate = require('../authenticate');

var dishRouter = express.Router();
dishRouter.use(bodyparser.json()); // collection router goes here

dishRouter.route('/').options(cors.corsWithOptions, function (req, res) {
  res.sendStatus(200);
}).get(cors.cors, function (req, res, next) {
  Dishes.find(req.query).populate('comments.author').then(function (dishes) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      dishes: dishes,
      ok: true
    });
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
}).post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  Dishes.create(req.body).then(function (dish) {
    console.log('Dish Created ', dish);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dish);
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
}).put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  res.statusCode = 403;
  res.end('PUT operation not supported');
})["delete"](cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  Dishes.remove({}).then(function (resp) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
}); // specific router goes here

dishRouter.route('/:dishId').options(cors.corsWithOptions, function (req, res) {
  res.sendStatus(200);
}).get(cors.cors, function (req, res, next) {
  Dishes.findById(req.params.dishId).populate('comments.author').then(function (dish) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dish);
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
}).post(cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
  res.statusCode = 403;
  res.end('POST operation not supported on /dishes/' + req.params.dishId);
}).put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  Dishes.findByIdAndUpdate(req.params.dishId, {
    $set: req.body
  }, {
    "new": true
  }).then(function (dish) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dish);
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
})["delete"](cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  Dishes.findByIdAndDelete(req.params.dishId).then(function (resp) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
});
module.exports = dishRouter;