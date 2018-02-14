const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const omit = require('../../helpers')

const Product = require('../models/products');

router.get('/', (req, res, next) => {
    Product
        .find()
        .select('-__v')
        .exec()
        .then(docs => {
            const response = {
                total: docs.length,
                docs: docs.map(doc => {
                    return {
                        ...doc._doc,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                }),
                message: 'Successfully fetched items.'
            }
            res
                .status(200)
                .json(response);
        })
        .catch(err => {
            res
                .status(500)
                .json({
                    error: err
                })
        })
});

router.post('/', (req, res, next) => {
    const product = new Product({
        _id: new mongoose
            .Types
            .ObjectId(),
        name: req.body.name,
        price: req.body.price
    })
    product
        .save()
        .then(result => {
            res
                .status(201)
                .json({
                    doc: {
                        ...omit(result._doc, '__v'),
                        request: {
                            type: "GET",
                            url: "http://"+process.env.APP_URL + "/products" + result._id
                        }
                    },
                    message: 'Successfully created product.',
                });
        })
        .catch(err => {
            res
                .status(500)
                .json({
                    error: err
                });
        });
});

router.get('/:product_id', (req, res, next) => {
    const id = req.params.product_id;
    Product
        .findById(id)
        .exec()
        .then(result => {
            if (result) {
                res
                    .status(200)
                    .json({
                        doc: {
                            ...omit(result._doc, '__v'),
                            request: {
                                type: "GET",
                                url: "http://"+process.env.APP_URL + "/products"
                            }
                        },
                        message: 'Successfully fetched item.',
                    });
            } else {
                res
                    .status(404)
                    .json({
                        _id: id,
                        message: 'No valid entry found for provided ID.'
                    });
            }

        })
        .catch(err => {
            res
                .status(500)
                .json({
                    error: err
                });
        });
});

router.patch('/:product_id', (req, res, next) => {
    const id = req.params.product_id;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }

    Product
        .update({_id: id}, {$set: updateOps})
        .exec()
        .then(result => {
            res
                .status(200)
                .json({
                    _id: id,
                    request: {
                    type: "GET",
                    url: "http://"+process.env.APP_URL + "/products/" + id
                    },
                    message: 'Successfully updated item.',
                });
        })
        .catch(err => {
            res
                .status(500)
                .json({
                    error: err
                })
        })
});

router.delete('/:product_id', (req, res, next) => {
    const id = req.params.product_id;
    Product
        .remove({
            _id: id
        })
        .exec()
        .then(result => {
            res
                .status(200)
                .json({
                    request: {
                        type: "POST",
                        url: "http://"+process.env.APP_URL + "/products",
                        body: { name: "String", price: "Number"}
                    },
                    message: "Successfully deleted item."
                });
        })
        .catch(err => {
            res
                .status(404)
                .json({
                    error: err
                })
        });
});

module.exports = router;