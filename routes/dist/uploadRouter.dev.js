"use strict";

var express = require('express');

var bodyparser = require('body-parser');

var multer = require('multer');

var authenticate = require('../authenticate');

var storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function filename(req, file, cb) {
    cb(null, file.originalname);
  }
});

var imageFilter = function imageFilter(req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('You can upload only image files!'), false);
  }

  cb(null, true);
};

var upload = multer({
  storage: storage,
  fileFilter: imageFilter
});
var uploadRouter = express.Router();
uploadRouter.use(bodyparser.json()); // collection router goes here

uploadRouter.route('/').get(authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  res.statusCode = 403;
  res.end('GET operation not supported on /imageUpload');
}).post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), function (req, res, next) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(req.file);
}).put(authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  res.statusCode = 403;
  res.end('PUT operation not supported on /imageUpload');
})["delete"](authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  res.statusCode = 403;
  res.end('DELETE operation not supported on /imageUpload');
});
module.exports = uploadRouter;