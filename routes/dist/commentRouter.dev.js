"use strict";

var express = require('express');

var bodyParser = require('body-parser');

var mongoose = require('mongoose');

var authenticate = require('../authenticate');

var cors = require('./cors');

var Comments = require('../models/comments');

var commentRouter = express.Router();
commentRouter.use(bodyParser.json());
commentRouter.route('/').options(cors.corsWithOptions, function (req, res) {
  res.sendStatus(200);
}).get(cors.cors, function (req, res, next) {
  Comments.find(req.query).populate('author').then(function (comments) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(comments);
  }, function (err) {
    return next(err);
  })["catch"](function (err) {
    return next(err);
  });
}).post(cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
  if (req.body != null) {
    req.body.author = req.user._id;
    Comments.create(req.body).then(function (comment) {
      Comments.findById(comment._id).populate('author').then(function (comment) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comment);
      });
    }, function (err) {
      return next(err);
    })["catch"](function (err) {
      return next(err);
    });
  } else {
    err = new Error('Comment not found in request body');
    err.status = 404;
    return next(err);
  }
}).put(cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
  res.statusCode = 403;
  res.end('PUT operation not supported on /comments/');
})["delete"](cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  Comments.remove({}).then(function (resp) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, function (err) {
    return next(err);
  })["catch"](function (err) {
    return next(err);
  });
});
commentRouter.route('/:commentId').options(cors.corsWithOptions, function (req, res) {
  res.sendStatus(200);
}).get(cors.cors, function (req, res, next) {
  Comments.findById(req.params.commentId).populate('author').then(function (comment) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(comment);
  }, function (err) {
    return next(err);
  })["catch"](function (err) {
    return next(err);
  });
}).post(cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
  res.statusCode = 403;
  res.end('POST operation not supported on /comments/' + req.params.commentId);
}).put(cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
  Comments.findById(req.params.commentId).then(function (comment) {
    if (comment != null) {
      if (!comment.author.equals(req.user._id)) {
        var err = new Error('You are not authorized to update this comment!');
        err.status = 403;
        return next(err);
      }

      req.body.author = req.user._id;
      Comments.findByIdAndUpdate(req.params.commentId, {
        $set: req.body
      }, {
        "new": true
      }).then(function (comment) {
        Comments.findById(comment._id).populate('author').then(function (comment) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(comment);
        });
      }, function (err) {
        return next(err);
      });
    } else {
      err = new Error('Comment ' + req.params.commentId + ' not found');
      err.status = 404;
      return next(err);
    }
  }, function (err) {
    return next(err);
  })["catch"](function (err) {
    return next(err);
  });
})["delete"](cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
  Comments.findById(req.params.commentId).then(function (comment) {
    if (comment != null) {
      if (!comment.author.equals(req.user._id)) {
        var err = new Error('You are not authorized to delete this comment!');
        err.status = 403;
        return next(err);
      }

      Comments.findByIdAndRemove(req.params.commentId).then(function (resp) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, function (err) {
        return next(err);
      })["catch"](function (err) {
        return next(err);
      });
    } else {
      err = new Error('Comment ' + req.params.commentId + ' not found');
      err.status = 404;
      return next(err);
    }
  }, function (err) {
    return next(err);
  })["catch"](function (err) {
    return next(err);
  });
});
module.exports = commentRouter;