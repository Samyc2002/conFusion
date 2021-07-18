"use strict";

var express = require('express');

var bodyParser = require('body-parser');

var mongoose = require('mongoose');

var authenticate = require('../authenticate');

var cors = require('./cors');

var Favourites = require('../models/favourite');

var favouriteRouter = express.Router();
favouriteRouter.use(bodyParser.json());
favouriteRouter.route('/').options(cors.corsWithOptions, function (req, res) {
  res.sendStatus(200);
}).get(cors.cors, authenticate.verifyUser, function (req, res, next) {
  Favourites.find(req.query).populate('user').populate('dishes').then(function (favourites) {
    // extract favourites that match the req.user.id
    if (favourites) {
      user_favourites = favourites.filter(function (fav) {
        return fav.user._id.toString() === req.user.id.toString();
      })[0];

      if (!user_favourites) {
        var err = new Error('You have no favourites!');
        err.status = 404;
        return next(err);
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(user_favourites);
    } else {
      var err = new Error('There are no favourites');
      err.status = 404;
      return next(err);
    }
  }, function (err) {
    return next(err);
  })["catch"](function (err) {
    return next(err);
  });
}).post(cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
  Favourites.find({}).populate('user').populate('dishes').then(function (favourites) {
    var user;
    if (favourites) user = favourites.filter(function (fav) {
      return fav.user._id.toString() === req.user.id.toString();
    })[0];
    if (!user) user = new Favourites({
      user: req.user.id
    });
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      var _loop = function _loop() {
        var i = _step.value;
        if (user.dishes.find(function (d_id) {
          if (d_id._id) {
            return d_id._id.toString() === i._id.toString();
          }
        })) return "continue";
        user.dishes.push(i._id);
      };

      for (var _iterator = req.body[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _ret = _loop();

        if (_ret === "continue") continue;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    user.save().then(function (userFavs) {
      res.statusCode = 201;
      res.setHeader("Content-Type", "application/json");
      res.json(userFavs);
      console.log("Favourites Created");
    }, function (err) {
      return next(err);
    })["catch"](function (err) {
      return next(err);
    });
  })["catch"](function (err) {
    return next(err);
  });
}).put(cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
  res.statusCode = 403;
  res.end('PUT operation is not supported on /favourites');
})["delete"](cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
  Favourites.find({}).populate('user').populate('dishes').then(function (favourites) {
    var favToRemove;

    if (favourites) {
      favToRemove = favourites.filter(function (fav) {
        return fav.user._id.toString() === req.user.id.toString();
      })[0];
    }

    if (favToRemove) {
      favToRemove.remove().then(function (result) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(result);
      }, function (err) {
        return next(err);
      });
    } else {
      var err = new Error('You do not have any favourites');
      err.status = 404;
      return next(err);
    }
  }, function (err) {
    return next(err);
  })["catch"](function (err) {
    return next(err);
  });
});
favouriteRouter.route('/:dishId').options(cors.corsWithOptions, function (req, res) {
  res.sendStatus(200);
}).get(cors.cors, authenticate.verifyUser, function (req, res, next) {
  Favourites.findOne({
    user: req.user._id
  }).populate('user').populate('dishes').then(function (favourites) {
    if (favourites) {
      var favs = favourites.filter(function (fav) {
        return fav.user._id.toString() === req.user.id.toString();
      })[0];
      var dish = favs.dishes.filter(function (dish) {
        return dish.id === req.params.dishId;
      })[0];

      if (dish) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(dish);
      } else {
        var err = new Error('You do not have dish ' + req.params.dishId);
        err.status = 404;
        return next(err);
      }
    } else {
      var err = new Error('You do not have any favourites');
      err.status = 404;
      return next(err);
    }
  }, function (err) {
    return next(err);
  })["catch"](function (err) {
    return next(err);
  });
}).post(cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
  Favourites.find({}).populate('user').populate('dishes').then(function (favourites) {
    var user;
    if (favourites) user = favourites.filter(function (fav) {
      return fav.user._id.toString() === req.user.id.toString();
    })[0];
    if (!user) user = new Favourites({
      user: req.user.id
    });
    if (!user.dishes.find(function (d_id) {
      if (d_id._id) return d_id._id.toString() === req.params.dishId.toString();
    })) user.dishes.push(req.params.dishId);
    user.save().then(function (userFavs) {
      Favourites.findById(userFavs._id).populate('user').populate('dishes').then(function (favourite) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(userFavs);
      })["catch"](function (err) {
        return next(err);
      });
    }, function (err) {
      return next(err);
    })["catch"](function (err) {
      return next(err);
    });
  })["catch"](function (err) {
    return next(err);
  });
}).put(cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
  res.statusCode = 403;
  res.end('PUT operation is not supported on /favourites/:dishId');
})["delete"](cors.corsWithOptions, authenticate.verifyUser, function (req, res, next) {
  Favourites.find({}).populate('user').populate('dishes').then(function (favourites) {
    var user;
    if (favourites) user = favourites.filter(function (fav) {
      return fav.user._id.toString() === req.user.id.toString();
    })[0];

    if (user) {
      user.dishes = user.dishes.filter(function (dishid) {
        return dishid._id.toString() !== req.params.dishId;
      });
      user.save().then(function (result) {
        Favourites.findById(result._id).populate('user').populate('dishes').then(function (favourite) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(userFavs);
        })["catch"](function (err) {
          return next(err);
        });
      }, function (err) {
        return next(err);
      });
    } else {
      var err = new Error('You do not have any favourites');
      err.status = 404;
      return next(err);
    }
  }, function (err) {
    return next(err);
  })["catch"](function (err) {
    return next(err);
  });
});
module.exports = favouriteRouter;