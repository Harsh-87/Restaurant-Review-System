const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const Favorites = require('../models/favorites');
const Dishes = require('../models/dishes');
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

// Routes for Favorites
favoriteRouter.route('/')
    .get(authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorites) => {
                if (favorites == null) {
                    Favorites.create({ user: req.user._id, dishes: req.body.dishes })
                        .then((favorites) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                } else {
                    favorites.update({ $addToSet: { dishes: { $each: [...req.body.dishes] } } })
                        .then((resp) => {
                            Favorites.findOne({ user: req.user._id })
                                .then((favorites) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorites);
                                }, (err) => next(err))
                                .catch((err) => next(err));
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }

            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /Favorites');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Favorites.remove({ user: req.user._id })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.send("Deletion operation performed!");
            }, (err) => next(err))
            .catch((err) => next(err));
    });

favoriteRouter.route('/:dishId')
    .get(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /Favorites');
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorites) => {
                if (favorites == null) {
                    Favorites.create({ user: req.user._id, dishes: [req.params.dishId] })
                        .then((favorites) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                } else {
                    favorites.update({ $addToSet: { dishes: req.params.dishId } })
                        .then((resp) => {
                            Favorites.findOne({ user: req.user._id })
                                .then((favorites) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorites);
                                }, (err) => next(err))
                                .catch((err) => next(err));
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }

            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /Favorites');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorites) => {
                if (favorites != null) {
                    console.log(req.params.dishId);
                    for (var i = favorites.dishes.length - 1; i >= 0; i--) {
                        console.log(favorites.dishes[i]);
                        if (favorites.dishes[i] == req.params.dishId) {
                            favorites.dishes.splice(i, 1);
                            favorites.save()
                                .then((favorites) => {
                                    res.status = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.send(favorites);
                                })
                                .catch((err) => next(err));
                            return;
                        }
                    }
                }
                res.status = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.send("No such favorite found!");
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = favoriteRouter;