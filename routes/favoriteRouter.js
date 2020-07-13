const express = require('express');
const bodyParser = require('body-parser');
var authenticate = require('../authenticate');
const mongoose = require('mongoose');
const cors = require('./cors');

const Favorites = require('../models/favorite');
const user = require('../models/user');
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ "user": req.user._id })
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ "user": req.user._id })
            .then((favorite) => {
                if (favorite == null) {
                    Favorites.create({ "user": req.user.id })
                        .then((favorite) => {
                            Favorites.updateOne({ "user": req.user._id }, { $addToSet: { dishes: { $each: req.body } } })
                                .then((favorite) => {
                                    Favorites.findOne({ "user": req.user._id })
                                        .then((favorite) => {
                                            console.log('fav doc Created ', favorite);
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.json(favorite);
                                        }, (err) => next(err))
                                }, (err) => next(err))
                        }, (err) => next(err))
                }
                else {
                    Favorites.updateOne({ user: req.user._id }, { $addToSet: { dishes: { $each: req.body } } })
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Favorites.deleteOne({ "user": req.user._id })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

favoriteRouter.route('/:dishId')
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ "user": req.user._id })
            .then((favorite) => {
                if (favorite == null) {
                    Favorites.create({ "user": req.user.id })
                        .then((favorite) => {
                            Favorites.updateOne({ "user": req.user._id }, { $addToSet: { dishes: req.params.dishId } })
                                .then((favorite) => {
                                    Favorites.findOne({ "user": req.user._id })
                                        .then((favorite) => {
                                            console.log('fav doc Created ', favorite);
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.json(favorite);
                                        }, (err) => next(err))
                                }, (err) => next(err))
                                .catch((err) => next(err));
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
                else {
                    Favorites.updateOne({ user: req.user._id }, { $addToSet: { dishes: req.params.dishId } })
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Favorites.updateOne({ "user": req.user._id }, { $pull: { dishes: req.params.dishId } })
            .populate('user')
            .populate('dishes')
            .then((resp) => {
                Favorites.findOne({ "user": req.user._id })
                    .then((resp) => {
                        console.log('resp ', resp);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(resp);
                    }, (err) => next(err))
            }, (err) => next(err))
            .catch((err) => next(err));
    });
module.exports = favoriteRouter;