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
  Dishes.find({}).populate('comments.author').then(function (dishes) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dishes);
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
}); // collection router comments goes here

dishRouter.route('/:dishId/comments').options(cors.corsWithOptions, function (req, res) {
  res.sendStatus(200);
}).get(cors.cors, function (req, res, next) {
  Dishes.findById(req.params.dishId).populate('comments.author').then(function (dish) {
    if (dish != null) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(dish.comments);
    } else {
      var _err = new Error('Dish ' + req.params.dishId + ' not found');

      _err.statusCode = 404;
      return next(_err);
    }
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
}).post(cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
  Dishes.findById(req.params.dishId).then(function (dish) {
    if (dish != null) {
      req.body.author = req.user._id;
      dish.comments.push(req.body);
      dish.save().then(function (dish) {
        Dishes.findById(dish._id).populate('comments.author').then(function (dish) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dish);
        });
      }, function (err) {
        next(err);
      });
    } else {
      var _err2 = new Error('Dish ' + req.params.dishId + ' not found');

      _err2.statusCode = 404;
      return next(_err2);
    }
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
}).put(cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
  res.statusCode = 403;
  res.end('PUT operation not supported');
})["delete"](cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  Dishes.findById(req.params.dishId).then(function (dish) {
    if (dish != null) {
      for (var i = dish.comments.length - 1; i >= 0; i--) {
        dish.comments.id(dish.comments[i]._id).remove();
      }

      dish.save().then(function (dish) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      }, function (err) {
        next(err);
      });
    } else {
      var _err3 = new Error('Dish ' + req.params.dishId + ' not found');

      _err3.statusCode = 404;
      return next(_err3);
    }
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
}); // specific router comments goes here

dishRouter.route('/:dishId/comments/:commentId').options(cors.corsWithOptions, function (req, res) {
  res.sendStatus(200);
}).get(cors.cors, function (req, res, next) {
  Dishes.findById(req.params.dishId).populate('comments.author').then(function (dish) {
    if (dish != null && dish.comments.id(req.params.commentId) != null) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(dish.comments.id(req.params.commentId));
    } else if (dish == null) {
      var _err4 = new Error('Dish ' + req.params.dishId + ' not found');

      _err4.statusCode = 404;
      return next(_err4);
    } else {
      var _err5 = new Error('Comment ' + req.params.commentId + ' not found');

      _err5.statusCode = 404;
      return next(_err5);
    }
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
}).post(cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
  res.statusCode = 403;
  res.end('POST operation not supported on /dishes/' + req.params.dishId + '/comments/' + req.params.commentId);
}).put(cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
  Dishes.findById(req.params.dishId).then(function (dish) {
    if (dish != null && dish.comments.id(req.params.commentId) != null) {
      if (dish.comments.id(req.params.commentId).author.toString() != req.user._id.toString()) {
        var _err6 = new Error('You are not authorized to edit this comment');

        _err6.status = 403;
        return next(_err6);
      }

      if (req.body.rating) {
        dish.comments.id(req.params.commentId).rating = req.body.rating;
      }

      if (req.body.comment) {
        dish.comments.id(req.params.commentId).comment = req.body.comment;
      }

      dish.save().then(function (dish) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      }, function (err) {
        new err();
      })["catch"](function (err) {
        return next(err);
      });
    } else if (dish == null) {
      var _err7 = new Error('Dish ' + req.params.dishId + ' not found');

      _err7.statusCode = 404;
      return next(_err7);
    } else {
      var _err8 = new Error('Comment ' + req.params.commentId + ' not found');

      _err8.statusCode = 404;
      return next(_err8);
    }
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
})["delete"](cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
  Dishes.findById(req.params.dishId).then(function (dish) {
    if (dish != null && dish.comments.id(req.params.commentId) != null) {
      if (dish.comments.id(req.params.commentId).author.toString() != req.user._id.toString()) {
        err = new Error('You are not authorized to edit this comment');
        err.status = 403;
        return next(err);
      }

      dish.comments.id(req.params.commentId).remove();
      dish.save().then(function (dish) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      }, function (err) {
        new err();
      });
    } else if (dish == null) {
      var _err9 = new Error('Dish ' + req.params.dishId + ' not found');

      _err9.statusCode = 404;
      return next(_err9);
    } else {
      var _err10 = new Error('Comment ' + req.params.commentId + ' not found');

      _err10.statusCode = 404;
      return next(_err10);
    }
  }, function (err) {
    next(err);
  })["catch"](function (err) {
    next(err);
  });
});
module.exports = dishRouter;