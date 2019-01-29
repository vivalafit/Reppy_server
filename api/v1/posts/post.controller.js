const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const VerifyToken = require('../verifyToken/verifyToken');
const VerifyPostToken = require('../verifyToken/verifyPostToken');
const models   = require('../../../models/index'); // get our postgres model
const errorHandler = require('../../../errorHandler');
const multer  = require('multer');
const Op = Sequelize.Op;
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './attachments/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname )
    }
});
const upload = multer({ storage: storage });
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
// var VerifyToken = require('./VerifyToken');
// const config = require('../../../config/_config');
// const minLength = 6;
// const maxLength = 12;
/**
 * @api {get} posts/ View all posts
 * @apiVersion 0.1.0
 * @apiName View All
 * @apiGroup Post
 *
 * @apiParam {URL} GET parametres from URL(categoryId, dateFrom, dateTo, limit, offset).
 *
 * @apiSuccess {json} json posts.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *   "data": [
 *       {
 *           "id": 1,
 *           "title": "edited ad",
 *           "price": 100,
 *           "attachments": [
 *               {
 *                   "path": "attachments\\attachments-diagram from Proskura.png-1529393853999.jpg",
 *                   "size": 39447,
 *                   "encoding": "7bit",
 *                   "filename": "attachments-diagram from Proskura.png-1529393853999.jpg",
 *                   "mimetype": "image/png",
 *                   "fieldname": "attachments",
 *                   "destination": "./attachments/",
 *                   "originalname": "diagram from Proskura.png"
 *               }
 *           ],
 *           "createdAt": "2018-06-18T16:07:05.696Z",
 *           "updatedAt": "2018-06-19T07:37:34.031Z",
 *           "status": "open",
 *           "properties": [
 *               {
 *                   "id": 1,
 *                   "title": "zhopa",
 *                   "createdAt": "2018-06-15T13:04:08.016Z",
 *                   "updatedAt": "2018-06-15T13:04:08.016Z",
 *                   "group": {
 *                       "id": 1,
 *                       "title": "wewewe",
 *                       "type": "checkbox",
 *                       "createdAt": "2018-06-15T13:04:00.145Z",
 *                       "updatedAt": "2018-06-15T13:04:00.145Z"
 *                   }
 *               }
 *           ],
 *           "category": [
 *               {
 *                   "id": 1,
 *                   "title": "title",
 *                   "description": "description new",
 *                   "createdAt": "2018-06-12T08:51:40.356Z",
 *                   "updatedAt": "2018-06-12T08:51:40.356Z"
 *               },
 *               {
 *                   "id": 2,
 *                   "title": "title2",
 *                   "description": "description 222new",
 *                   "createdAt": "2018-06-12T08:51:40.356Z",
 *                   "updatedAt": "2018-06-12T08:51:40.356Z"
 *               }
 *           ],
 *           "customer": {
 *               "id": 1,
 *               "name": "denys",
 *               "lastName": "denysdenys",
 *               "email": "123eee@ukr.net",
 *               "tel": "380978887766",
 *               "avatar": {
 *                   "path": "avatars\\avatar-1529399356678.jpg",
 *                   "size": 349298,
 *                   "encoding": "7bit",
 *                   "filename": "avatar-1529399356678.jpg",
 *                   "mimetype": "image/png",
 *                   "fieldname": "avatar",
 *                   "destination": "./avatars/",
 *                   "originalname": "diagram 2 from Proskura.png"
 *               }
 *           },
 *           "executor": null,
 *           "location": {
 *               "id": 4,
 *               "city": "Одесса",
 *               "country": "Украина",
 *               "createdAt": "2018-08-29T07:03:56.358Z",
 *               "updatedAt": "2018-08-29T07:03:56.358Z"
 *          }
 *       }
 *   ],
 *   "length": 38
 *}
 *
 * @apiError serverError Server error.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "response": "POSTS_NOT_FOUND"
 *     }
 */
router.get('/', /*VerifyToken,*/ function(req, res) {
    // let where = {include: [{model: models.Property, as: 'properties'}]};
    let where = {};
    let categoryWhere = {};
    let order = [['id', 'ASC']];
    let limit = 25;
    let offset = 0;
    where.status = 'open';
    // let propertyWhere = {id: 1};
    // let propertyWhere2 = {id: 2};
    // let propertyHaving = [{}];
    if(req.query.categoryId){
        categoryWhere.id = req.query.categoryId
    }
    if(req.query.dateFrom){
        where.dateFrom = {$gte: req.query.dateFrom};
    }
    if(req.query.dateTo){
        where.dateTo = {$lte: req.query.dateTo};
    }
    if(req.query.userId) {
        where.customerId = {};
        where.customerId.$ne = req.query.userId;
    }
    if(req.query.limit){
        limit = req.query.limit;
    }
    if(req.query.offset){
        offset = (req.query.offset-1) * limit;
    }
    // if(req.query.propertyId){
    //     propertyWhere.id = req.query.propertyId;
    //     propertyHaving.id = req.query.propertyId;
    //
    //     // propertyWhere.propertyId = req.query.propertyId;
    //
    //     // where = {'$properties.id$': req.query.propertyId};
    //     // where.properties['id'] = req.query.propertyId;
    //
    //     // propertyWhere.id = '1 && 3';
    //     // if(req.query.propertyId){
    //     //     propertyWhere.id = {$and: req.query.propertyId};
    //     // }
    // }
    // console.log(propertyWhere);
    models.Post.findAndCountAll({where: where, include: [{
            model: models.Property,
            as: 'properties',
            // where: propertyWhere,
            include: [{
                model: models.Group.scope('forPosts'),
                as: 'group'
            }],
            // having: ['id == 2'],
            through: {
                attributes: []
                // having: propertyHaving/*,
                // where: propertyWhere*/
            }
        },
            {
                model: models.Category,
                as: 'category',
                where: categoryWhere,
                // attributes: ['title', 'description'],
                through: {
                    attributes: []
                }
            },
            {
                model: models.User,
                as: 'customer',
                attributes: ['id', 'name', 'lastName', 'email', 'tel', 'avatar']
            },
            {
                model: models.User,
                as: 'executor',
                attributes: ['id', 'name', 'lastName', 'email', 'tel', 'avatar']
            },
            {
                model: models.Location,
                as: 'location'
            },
            {
                model: models.Request,
                as: 'request'
            }],
        order: order,
        subQuery: false,
        distinct: true,
        offset: offset,
        limit: limit}).then(post => {
            let resp = {};
        resp = {data: post.rows, length: post.count};
        res.status(200).send(resp);
    }).catch(error => {
        errorHandler(error, "POSTS_NOT_FOUND");
        // return res.status(404).send({response: "POSTS_NOT_FOUND"});
        return res.status(404).send({response: error});
    });
});
/**
 * @api {post} posts/ Add a post
 * @apiVersion 0.1.0
 * @apiName Add
 * @apiGroup Post
 *
 * @apiParam {title} title Post title.
 * @apiParam {price} price Post price.
 * @apiParam {categoryId} categoryId Post categoryId.
 * @apiParam {customerId} customerId Post customerId.
 * @apiParam {attachments} attachments Post photos.
 * @apiParam {locationId} locationId Post locationId.
 *
 * @apiExample {json} Example usage:
 * {
 *      "title": "sometitle",
 *      "description": "description of title"
 *      "price": "300",
 *      "categoryId": "1,2,10",
 *      "customerId": "1",
 *      "attachments": "file.img, file2.img"
 *      "locationId": "1"
 * }
 * @apiSuccess {json} json Post.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "ad": true,
 *       "response": "POST_ADDED"
 *     }
 *
 * @apiError serverError Server error.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "ad": false,
 *       "response": "ERROR"
 *     }
 */
const cpUpload = upload.fields([{name: 'attachments',maxCount: 20}]);
router.post('/', cpUpload, VerifyPostToken, function(req, res){
    attachments = req.files['attachments'];
    title = req.body.title;
    description = req.body.description;
    categoryId = req.body.categoryId;
    price = req.body.price;
    address = req.body.address;
    startingDate = req.body.startingDate;
    locationId = req.body.locationId;
    customerId = userId;
    ids = categoryId.split(',');
    models.Post.create({
        title: title,
        description: description,
        price: price,
        customerId: customerId,
        locationId: locationId,
        address: address,
        startingDate: startingDate,
        attachments: attachments
    }).then(post => {
        ids.forEach(function(catId) {
            models.PostCategory.create({
                categoryId: catId,
                postId: post.id
            }).catch(error => {
                errorHandler(error, "ERROR_ADDING");
                res.status(400).send({
                    ad: false,
                    // response: "ERROR_ADDING"
                    response: error
                });
            });
        });
        res.status(200).send({ad: true, response: "POST_ADDED"})
    }).catch(error => {
        errorHandler(error, "ERROR_ADDING");
        res.status(400).send({
            ad: false,
            // response: "ERROR_ADDING"
            response: error
        });
    });
});
const cpOfferUpload = upload.fields([{name: 'attachments',maxCount: 20}]);
router.post('/offer', cpOfferUpload, VerifyPostToken, function(req, res){
    attachments = req.files['attachments'];
    title = req.body.title;
    description = req.body.description;
    categoryId = req.body.categoryId;
    price = req.body.price;
    address = req.body.address;
    startingDate = req.body.startingDate;
    status = req.body.status;
    locationId = req.body.locationId;
    offeredExecutorId = req.body.offeredExecutorId;
    customerId = userId;
    ids = categoryId.split(',');
    console.log(req.body);
    if(offeredExecutorId === userId) {
        return res.status(400).send({
            ad: false,
            // response: "ERROR_ADDING"
            response: "CANT_SEND_TO_YOURSELF"
        });
    }
    models.Post.create({
        title: title,
        description: description,
        price: price,
        status: status,
        address: address,
        startingDate: startingDate,
        offeredExecutorId: offeredExecutorId,
        customerId: customerId,
        locationId: locationId,
        attachments: attachments
    }).then(post => {
        ids.forEach(function(catId) {
            models.PostCategory.create({
                categoryId: catId,
                postId: post.id
            }).catch(error => {
                errorHandler(error, "ERROR_ADDING");
                return res.status(400).send({
                    ad: false,
                    // response: "ERROR_ADDING"
                    response: error
                });
            });
        });
        return res.status(200).send({ad: true, response: "OFFER_ADDED"})
    }).catch(error => {
        errorHandler(error, "ERROR_ADDING");
        return res.status(400).send({
            ad: false,
            // response: "ERROR_ADDING"
            response: error
        });
    });
});
/**
 * @api {get} posts/:id Post view
 * @apiVersion 0.1.0
 * @apiName View
 * @apiGroup Post
 *
 * @apiParam {Number} id Post unique ID.
 *
 * @apiSuccess {String} title  Title of the post.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *{
 *   "id": 1,
 *   "title": "edited ad",
 *   "price": 100,
 *   "attachments": [
 *       {
 *           "path": "attachments\\attachments-diagram from Proskura.png-1529393853999.jpg",
 *           "size": 39447,
 *           "encoding": "7bit",
 *           "filename": "attachments-diagram from Proskura.png-1529393853999.jpg",
 *           "mimetype": "image/png",
 *           "fieldname": "attachments",
 *           "destination": "./attachments/",
 *           "originalname": "diagram from Proskura.png"
 *       }
 *   ],
 *   "status": "in work",
 *   "createdAt": "2018-06-18T16:07:05.696Z",
 *   "updatedAt": "2018-06-19T07:37:34.031Z",
 *   "properties": [
 *       {
 *           "id": 1,
 *           "title": "zhopa",
 *           "createdAt": "2018-06-15T13:04:08.016Z",
 *           "updatedAt": "2018-06-15T13:04:08.016Z",
 *           "group": {
 *               "id": 1,
 *               "title": "wewewe",
 *               "type": "checkbox",
 *               "createdAt": "2018-06-15T13:04:00.145Z",
 *               "updatedAt": "2018-06-15T13:04:00.145Z"
 *           }
 *       }
 *   ],
 *   "category": [
 *       {
 *           "id": 1,
 *           "title": "title",
 *           "description": "description new",
 *           "createdAt": "2018-06-12T08:51:40.356Z",
 *           "updatedAt": "2018-06-12T08:51:40.356Z"
 *       },
 *       {
 *           "id": 1,
 *           "title": "title",
 *           "description": "description new",
 *           "createdAt": "2018-06-12T08:51:40.356Z",
 *           "updatedAt": "2018-06-12T08:51:40.356Z"
 *       }
 *   ],
 *   "customer": {
 *       "id": 1,
 *       "name": "denys",
 *       "lastName": "denysdenys",
 *       "email": "123eee@ukr.net",
 *       "tel": "380978887766",
 *       "avatar": {
 *           "path": "avatars\\avatar-1529399356678.jpg",
 *           "size": 349298,
 *           "encoding": "7bit",
 *          "filename": "avatar-1529399356678.jpg",
 *          "mimetype": "image/png",
 *          "fieldname": "avatar",
 *          "destination": "./avatars/",
 *           "originalname": "diagram 2 from Proskura.png"
 *       }
 *   },
 *   "executor": null,
 *   "location": {
 *       "id": 4,
 *       "city": "Одесса",
 *       "country": "Украина",
 *       "createdAt": "2018-08-29T07:03:56.358Z",
 *       "updatedAt": "2018-08-29T07:03:56.358Z"
 *   }
 *}
 * */
router.get('/:id', /*VerifyToken,*/ function(req, res) {
    models.Post.findById(req.params.id, {include: [{
        model: models.Property,
        as: 'properties',
        include: [{
            model: models.Group.scope('forPosts'),
            as: 'group'
        }],
        through: {
            attributes: []
        }
    },
        {
            model: models.Category,
            as: 'category',
            // attributes: ['title', 'description'],
            through: {
                attributes: []
            }
        },
        {
            model: models.User,
            as: 'customer',
            attributes: ['id', 'name', 'lastName', 'email', 'tel', 'avatar']
        },
        {
            model: models.User,
            as: 'executor',
            attributes: ['id', 'name', 'lastName', 'email', 'tel', 'avatar']
        },
        {
            model: models.Location,
            as: 'location'
        },
            {
                model: models.Request,
                as: 'request'
            }]}).then(post => {
        res.status(200).send(post);
    }).catch(error => {
        errorHandler(error, "POST_NOT_FOUND");
        return res.status(404).send({response: "POST_NOT_FOUND"});
    });
});
/**
 * @api {put} posts/:id Edit an Post
 * @apiVersion 0.1.0
 * @apiName Edit
 * @apiGroup Post
 *
 * @apiParam {number} id Post ID.
 * @apiParam {string} title New title
 *
 * @apiExample {json} Example usage:
 * {
 *      "title": "newTitle",
 *      "price": "100",
 *      "categoryId": "1,2",
 *      "customerId": "1",
 *      "attachments": "photo.img, photo2.img",
 *      "status": "completed",
 *      "locationId": 1
 * }
 *
 * @apiSuccess {json} response message.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "repsonse": "UPDATE_SUCCESS"
 *     }
 *
 * @apiError updateError Update errors.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "response": "UPDATING_ERROR"
 *     }
 */
const editCpUpload = upload.fields([{ name: 'attachments', maxCount: 20 }]);
router.put('/:id', editCpUpload, VerifyPostToken, function(req, res){
    id = req.params.id;
    title = req.body.title;
    description = req.body.description;
    categoryId = req.body.categoryId;
    address = req.body.address,
    startingDate = req.body.startingDate,
    price = req.body.price;
    locationId = req.body.locationId;
    attachments = req.files['attachments'];
    // const customerId = req.body.customerId;
    // const status = req.body.status;
    ids = categoryId.split(',');

    // console.log(req.body);
    const doc = {
        title: title,
        price: price,
        description: description,
        address: address,
        startingDate: startingDate,
        // status: status,
        // categoryId: categoryId,
        // customerId: customerId,
        locationId: locationId,
        attachments: attachments
    };
    models.Post.update(doc, {where: {id: id}}).then(post => {
        // console.log(post.id);
        models.PostCategory.destroy({where: {postId: id}}).then(() => {
            ids.forEach(function(catId) {
                models.PostCategory.create({
                    categoryId: catId,
                    postId: id
                }).catch(error => {
                    errorHandler(error, "ERROR_ADDING");
                    res.status(400).send({
                        ad: false,
                        // response: "ERROR_ADDING"
                        response: error
                    });
                });
            });
            res.status(200).send({post: true, response: "POST_UPDATED"})
        }).catch(error => {
            errorHandler(error, "ERROR_DELETING");
            // return res.status(400).send({response: "ERROR_DELETING"});
            return res.status(400).send({response: error});
        });
    }).catch(error => {
        errorHandler(error, "UPDATING_ERROR");
        return res.status(400).send({response: "UPDATING_ERROR"});
    });
});
/**
 * @api {delete} posts/:id Delete a post
 * @apiVersion 0.1.0
 * @apiName Delete
 * @apiGroup Post
 *
 * @apiParam {number} customerId Post ID of customer
 *
 *
 * @apiSuccess {json} response message.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "repsonse": "DELETE_SUCCESS"
 *     }
 *
 * @apiError updateError Delete errors.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "response": "ERROR"
 *     }
 */
router.delete('/cancelOffer/:id', VerifyPostToken, function(req, res) {
    const id = req.params.id;
    models.Post.findById(id).then(post => {
        console.log(post.customerId + ' customer id');
        console.log(userId + ' user id');
        if(post.customerId === userId){
            models.Post.destroy({where: {id: id}}).then(post => {
                return res.status(200).send({response: "DELETE_SUCCESS"});
            }).catch(error => {
                errorHandler(error, "ERROR_DELETING");
                return res.status(400).send({response: "ERROR_DELETING"});
            });
        } else {
            throw "NOT_EQUAL_ID";
        }
    }).catch(error => {
        errorHandler(error, "ERROR_");
        return res.status(400).send({response: "ERROR_"});
    });
});
router.delete('/declineByExecutor/:id', VerifyPostToken, function(req, res) {
    const id = req.params.id;
    models.Post.findById(id).then(post => {
        console.log(post.offeredExecutorId + ' offered id');
        console.log(userId + ' user id');
        if(post.offeredExecutorId === userId){
            models.Post.destroy({where: {id: id}}).then(post => {
                return res.status(200).send({response: "DELETE_SUCCESS"});
            }).catch(error => {
                errorHandler(error, "ERROR_DELETING");
                return res.status(400).send({response: "ERROR_DELETING"});
            });
        } else {
            throw "NOT_EQUAL_ID";
        }
    }).catch(error => {
        errorHandler(error, "ERROR_");
        return res.status(400).send({response: error});
    });

});

router.post('/addOption', /* VerifyToken,*/ function(req, res){
    postId = req.body.postId;
    propertyId = req.body.propertyId;
    models.Option.create({
        postId: postId,
        propertyId: propertyId
    }).then(option => {
        res.status(200).send({ad: true, response: "OPTION_ADDED"})
    }).catch(error => {
        errorHandler(error, "ERROR_ADDING");
        res.status(400).send({
            option: false,
            response: error
        });
    });
});
/**
 * @api {post} posts/request Add a request
 * @apiVersion 0.1.0
 * @apiName AddRequest
 * @apiGroup Post
 *
 * @apiParam {postId} postId Post id.
 * @apiParam {userId} userId Post potential executor id.
 * @apiParam {comment} comment Comment for request
 *
 * @apiExample {json} Example usage:
 * {
 *      "postId": "1",
 *      "userId": "1",
 *      "comment": "i fit the best for this job"
 * }
 * @apiSuccess {json} json Post.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "request": true,
 *       "response": "REQUEST_ADDED"
 *     }
 *
 * @apiError serverError Server error.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "request": false,
 *       "response": "ERROR"
 *     }
 */

// not send more than one request on one user
router.post('/request',  VerifyToken, function(req, res){
    postId = req.body.postId;
    comment = req.body.comment;
    // console.log(userId);
    // res.send({req: 1});
    models.Post.findById(postId).then(post => {
        // console.log(post);
        // console.log(userId);
        if(post.customerId === userId){
            return res.status(400).send({request: false, response: "SAME_USER_AS_CUSTOMER"});
        }
        if(post.status == "open"){
            models.Request.findAll({where: {postId: postId}}).then(requests => {
                requests.forEach(function (request) {
                    if(request.userId === userId) {
                        errorHandler("EXISTING_REQUEST", "EXISTING_REQUEST");
                        return res.status(400).send({request: false, response: "EXISTING_REQUEST"});
                    }
                });
            }).then(() => {
                models.Request.create({
                    postId: postId,
                    userId: userId,
                    comment: comment
                }).then(request => {
                    return res.status(200).send({request: true, response: "REQUEST_ADDED"})
                }).catch(error => {
                    errorHandler(error, "ERROR_ADDING");
                    return res.status(400).send({
                        request: false,
                        response: error
                    });

                });
            });
        } else {
            return res.status(400).send({
                request: false,
                response: "POST_NOT_OPEN"
            });
        }
    }).catch(error => {
        errorHandler(error, "POST_NOT_OPEN");
        return res.status(400).send({
            request: false,
            response: error
        });
    });

});
/**
 * @api {delete} posts/request/:id Delete a request
 * @apiVersion 0.1.0
 * @apiName DeleteRequest
 * @apiGroup Post
 *
 * @apiParam {number} id  ID of request
 *
 *
 * @apiSuccess {json} response message.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "repsonse": "DELETE_SUCCESS"
 *     }
 *
 * @apiError updateError Delete errors.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "response": "ERROR_DELETING"
 *     }
 */
router.delete('/request/:id', VerifyToken, function(req, res) {
    // console.log(userId);
    // console.log(req.params.id);
    const id = req.params.id;
    // console.log(id);
    models.Request.findById(id).then(request => {
        console.log(userId);
        console.log(request);
        if(request.userId == userId) {
            models.Request.destroy({where: {id: id}}).then(request => {
                return res.status(200).send({response: "DELETE_SUCCESS"});
            }).catch(error => {
                errorHandler(error, "ERROR_DELETING");
                console.log(error + ' in destroying')
                // return res.status(400).send({response: "ERROR_DELETING"});
                return res.status(400).send({response: error});
            });
        }
    }).catch(error => {
        errorHandler(error, "ERROR_DELETING");
        // return res.status(400).send({response: "ERROR_DELETING"});
        console.log(error + ' in finding')
        return res.status(400).send({response: error});
    });

});

/**
 * @api {post} posts/acceptRequest Accept a request
 * @apiVersion 0.1.0
 * @apiName AcceptRequest
 * @apiGroup Post
 *
 * @apiParam {postId} postId Post id.
 *
 * @apiExample {json} Example usage:
 * {
 *      "postId": "1"
 * }
 * @apiSuccess {json} json Post.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "response": "ACCEPT_SUCCESS"
 *     }
 *
 * @apiError serverError Server error.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "response": "ERROR_ACCEPTING"
 *     }
 */

router.post('/acceptRequest', VerifyToken, function(req, res){
    postId = req.body.postId;
    executorId = req.body.executorId;
    models.Post.findById(postId).then(post => {
        if(post.status == 'completed'){
            throw "ERROR_OCCURED";
        } else {
            post.status = 'in work';
            post.executorId = executorId;
            post.save();
            models.Request.destroy({where: {postId: postId}}).then(request => {
                return res.status(200).send({response: "ACCEPT_SUCCESS"});
            }).catch(error => {
                errorHandler(error, "ERROR_ACCEPTING");
                return res.status(400).send({response: "ERROR_ACCEPTING"});
            });
        }
    }).catch(error => {
        errorHandler(error, "ERROR_ACCEPTING");
        return res.status(400).send({response: "ERROR_ACCEPTING"});
    });
});
router.post('/acceptRequestByExecutor', VerifyToken, function(req, res){
    console.log(req.body.postId + 'wewewewewewe');
    postId = req.body.postId;
    executorId = userId;
    models.Post.findById(postId).then(post => {
        if(post.status == 'completed'){
            throw "ERROR_OCCURED";
        } else {
            post.status = 'in work';
            post.executorId = executorId;
            post.save();
        }
    }).catch(error => {
        errorHandler(error, "ERROR_ACCEPTING");
        return res.status(400).send({response: error});
    });
});

router.post('/endByExecutor', VerifyToken, function(req, res) {
   endedByExecutor = req.body.endedByExecutor;
   postId = req.body.postId;
   console.log("USER ID : ",userId)

   models.Post.findById(postId).then(post => {
     console.log("EXECUTOR ID : ",post.executorId)
       if(post.executorId === userId){
           post.endedByExecutor = endedByExecutor;
           post.save();
            return res.status(200).send({response: "JOB_IS_DONE"});
       } else {
           return res.status(400).send({response: "ID_NOT_EQUAL + USER ID : "+userId+"+EXECUTOR ID :"+post.id});
       }
   }).catch(error => {
       errorHandler(error, "ERROR_ENDING");
       return res.status(400).send({response: "ERROR_ENDING"});
   })
});

/**
 * @api {post} posts/review Review
 * @apiVersion 0.1.0
 * @apiName Review
 * @apiGroup Post
 *
 * @apiParam {comment} comment Comment for ready work.
 * @apiParam {positive} positive Positive or negative work.
 * @apiParam {postId} postId Post id.
 *
 * @apiExample {json} Example usage:
 * {
 *      "postId": "1"
 * }
 * @apiSuccess {json} json Post.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "response": "ACCEPT_SUCCESS"
 *     }
 *
 * @apiError serverError Server error.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "response": "ERROR_ACCEPTING"
 *     }
 */

router.post('/review', VerifyToken, function(req, res){
    comment = req.body.comment;
    positive = req.body.positive;
    postId = req.body.postId;
    executorId = req.body.executorId;
    models.Post.findById(postId).then(post => {
        post.status = 'completed';
        post.save();
    }).then(() => {
        models.Review.create({
            comment: comment,
            positive: positive,
            postId: postId,
            userId: executorId
        }).then(review => {
            models.User.findById(executorId).then(user => {
                amountReview = 0;
                positiveCount = 0;
                models.Review.findAll({where: {userId: executorId}}).then(review => {
                    console.log(review.length);
                    amountReview = review.length;
                    review.forEach(function(rev) {
                        if(rev.positive === true){
                            positiveCount++;
                        }
                    });
                    console.log(positiveCount);
                }).then(() => {
                    percent = (positiveCount/amountReview)*100;
                    user.rating = Math.round(percent);
                    user.save();
                    console.log(user.rating + " amount " + amountReview + " positive count " + positiveCount);
                });

            });
            res.status(200).send({review: true, response: "REVIEW_ADDED"})
        }).catch(error => {
            errorHandler(error, "ERROR_ADDING");
            return res.status(400).send({response: "ERROR_ADDING"});
        })
    })
});

/**
 * @api {get} posts/myPostExecutor Executor posts
 * @apiVersion 0.1.0
 * @apiName Executor Posts
 * @apiGroup Post
 *
 * @apiParam {URL} GET GET-parametres from URL(status: open, in_work, completed)
 *
 * @apiSuccess {response} response  All posts of executor.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *{
 *   "posts": [
 *       {
 *           "id": 3,
 *           "title": "Перекопать огород",
 *           "description": "Помочь бабушке с перекопкой огорода",
 *           "price": 1000,
 *           "attachments": "",
 *           "status": "open",
 *           "createdAt": "2018-08-27T07:54:48.231Z",
 *           "updatedAt": "2018-08-27T07:54:48.231Z",
 *           "review": null,
 *           "category": [
 *               {
 *                   "id": 2,
 *                   "title": "Земляные работы",
 *                   "description": "Перекопка, выкопка ям",
 *                   "createdAt": "2018-08-27T07:54:48.203Z",
 *                   "updatedAt": "2018-08-27T07:54:48.203Z"
 *               }
 *           ],
 *           "request": [
 *               {
 *                   "id": 3,
 *                   "comment": "Часто помогаю своей бабушке, по этому сделаю все в лучшем виде",
 *                   "createdAt": "2018-08-27T07:54:48.296Z",
 *                   "updatedAt": "2018-08-27T07:54:48.296Z",
 *                   "postId": 3,
 *                   "userId": 2
 *               }
 *           ],
 *           "location": {
 *               "id": 4,
 *               "city": "Одесса",
 *               "country": "Украина",
 *               "createdAt": "2018-08-29T07:03:56.358Z",
 *               "updatedAt": "2018-08-29T07:03:56.358Z"
 *           }
 *       },
 *       {
 *           "id": 4,
 *           "title": "Построить гараж",
 *           "description": "Гараж с ямой для ремонта собственного авто",
 *           "price": 30000,
 *           "attachments": "",
 *           "status": "in work",
 *           "createdAt": "2018-08-27T07:54:48.236Z",
 *           "updatedAt": "2018-08-27T07:54:48.236Z",
 *           "review": null,
 *           "category": [
 *               {
 *                   "id": 5,
 *                   "title": "Строительство гаража",
 *                   "description": "Строительство гаража для любых нужд",
 *                   "createdAt": "2018-08-27T07:54:48.212Z",
 *                   "updatedAt": "2018-08-27T07:54:48.212Z"
 *               }
 *           ],
 *           "request": [],
 *           "location": {
 *               "id": 4,
 *               "city": "Одесса",
 *               "country": "Украина",
 *               "createdAt": "2018-08-29T07:03:56.358Z",
 *               "updatedAt": "2018-08-29T07:03:56.358Z"
 *           }
 *       },
 *   ]
 *}
 * */

router.get('/work/myPostExecutor', VerifyToken, function(req, res){
    let where = {};
    // where.executorId = userId;

    let request = (post => {
        // models.Request.findAll({where: {userId: userId}}).then(request => {
            let resp = {};
            resp = {posts: post/*, requests: request*/};
            res.status(200).send(resp);
        // }).catch(error => {
        //     errorHandler(error, "ERROR");
        //     return res.status(400).send({response: error});
        // });
    });

    if(req.query.status){
        if(req.query.status == 'open'){
            // where.executorId =
            request = (post => {
            //     models.Request.findAll({where: {userId: userId}}).then(request => {
                    let resp = {};
                    // resp = {requests: request};
                    resp = {posts: post};
                    res.status(200).send(resp);
                // }).catch(error => {
                //     errorHandler(error, "ERROR");
                //     return res.status(400).send({response: error});
                // });
            });
        } else if(req.query.status == 'in_work'){
            where.executorId = userId;
            where.status = 'in work';
            request = (post => {
                let resp = {};
                resp = {posts: post};
                res.status(200).send(resp);
            });
        } else if(req.query.status == 'completed'){
            where.executorId = userId;
            where.status = 'completed';
            request = (post => {
                let resp = {};
                resp = {posts: post};
                res.status(200).send(resp);
            });
        } else if (req.query.status == 'request') {
            return models.Post.findAll({where: {status: 'open'}, include: [
                    {
                        model: models.Category,
                        as: 'category',
                        through: {
                            attributes: []
                        }
                    },
                    {
                        model: models.Request,
                        as: 'request',
                        where: {userId: userId}
                    },
                    {
                        model: models.Location,
                        as: 'location'
                    }
                ]}).then(request).catch(error => {
                    errorHandler(error, "ERROR");
            return res.status(400).send({response: error});
        })
        } else if (req.query.status == 'offer') {
            where.status = 'offer';
            where.offeredExecutorId = userId;
            request = (post => {
                let resp = {};
                resp = {posts: post};
                res.status(200).send(resp);
            });
        }
    }
    models.Post.findAll({where: where, include: [{
        model: models.Review,
        as: 'review',
        attributes: ['id', 'comment', 'positive', 'createdAt', 'updatedAt']
    },
        {
            model: models.Category,
            as: 'category',
            through: {
                attributes: []
            }
        },
        {
            model: models.User,
            as: 'customer',
            attributes: ['id', 'name', 'lastName', 'email', 'tel', 'avatar', 'tel']
        },
        {
            model: models.Request,
            as: 'request',
            // where: {userId: }
        },
        {
            model: models.Location,
            as: 'location'
        }
    ]}).then(request).catch(error => {
        errorHandler(error, "ERROR");
        return res.status(400).send({response: error});
    })
});

/**
 * @api {get} posts/myPostCustomer Customer posts
 * @apiVersion 0.1.0
 * @apiName Customer Posts
 * @apiGroup Post
 *
 * @apiParam {URL} GET GET-parametres from URL(status: open, in_work, completed)
 *
 * @apiSuccess {response} response  All posts of executor.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *{
 *   "posts": [
 *       {
 *           "id": 3,
 *           "title": "Перекопать огород",
 *           "description": "Помочь бабушке с перекопкой огорода",
 *           "price": 1000,
 *           "attachments": "",
 *           "status": "open",
 *           "createdAt": "2018-08-27T07:54:48.231Z",
 *           "updatedAt": "2018-08-27T07:54:48.231Z",
 *           "review": null,
 *           "category": [
 *               {
 *                   "id": 2,
 *                   "title": "Земляные работы",
 *                   "description": "Перекопка, выкопка ям",
 *                   "createdAt": "2018-08-27T07:54:48.203Z",
 *                   "updatedAt": "2018-08-27T07:54:48.203Z"
 *               }
 *           ],
 *           "executor": null,
 *           "request": [
 *               {
 *                   "id": 3,
 *                   "comment": "Часто помогаю своей бабушке, по этому сделаю все в лучшем виде",
 *                   "createdAt": "2018-08-27T07:54:48.296Z",
 *                   "updatedAt": "2018-08-27T07:54:48.296Z",
 *                   "postId": 3,
 *                   "userId": 2,
 *                   "user": {
 *                       "id": 2,
 *                       "name": "Николай",
 *                       "lastName": "Васильев",
 *                       "email": "user2@test.com",
 *                       "tel": "380668901234",
 *                       "avatar": "Gachi2.jpg",
 *                       "rating": 73
 *                   }
 *               }
 *           ],
 *           "location": {
 *               "id": 3,
 *               "city": "Львов",
 *               "country": "Украина",
 *               "createdAt": "2018-08-29T07:03:56.356Z",
 *               "updatedAt": "2018-08-29T07:03:56.356Z"
 *           }
 *       },
 *       {
 *           "id": 4,
 *           "title": "Построить гараж",
 *           "description": "Гараж с ямой для ремонта собственного авто",
 *           "price": 30000,
 *           "attachments": "",
 *           "status": "in work",
 *           "createdAt": "2018-08-27T07:54:48.236Z",
 *           "updatedAt": "2018-08-27T07:54:48.236Z",
 *           "review": null,
 *           "category": [
 *               {
 *                   "id": 5,
 *                   "title": "Строительство гаража",
 *                   "description": "Строительство гаража для любых нужд",
 *                   "createdAt": "2018-08-27T07:54:48.212Z",
 *                   "updatedAt": "2018-08-27T07:54:48.212Z"
 *               }
 *           ],
 *           "executor": {
 *               "id": 2,
 *               "name": "Николай",
 *               "lastName": "Васильев",
 *               "email": "user2@test.com",
 *               "tel": "380668901234",
 *               "avatar": "Gachi2.jpg",
 *               "rating": 73
 *           },
 *           "request": [],
 *           "location": {
 *               "id": 3,
 *               "city": "Львов",
 *               "country": "Украина",
 *               "createdAt": "2018-08-29T07:03:56.356Z",
 *               "updatedAt": "2018-08-29T07:03:56.356Z"
 *           }
 *       },
 *   ]
 *}
 * */

router.get('/work/myPostCustomer', VerifyToken, function(req, res){
    let where = {};
    where.customerId = userId;

    let request = (post => {
        // models.Request.findAll({include: [{
        //         model: models.Post,
        //         as: 'post',
        //         where: {customerId: userId}
        //     }]}).then(request => {
            let resp = {};
            resp = {posts: post};
            console.log(post);
            res.status(200).send(resp);
        // }).catch(error => {
        //     errorHandler(error, "ERROR");
        //     return res.status(400).send({response: error});
        // });
    });

    if(req.query.status){
        if(req.query.status == 'open'){
            where.status = 'open';
            // where.status = 'offer';
            // where.$and = status: 'offer'
            // request = (post => {
            //     models.Request.findAll({include: [{
            //             model: models.Post,
            //             as: 'post',
            //             where: {customerId: userId}
            //         }]}).then(request => {
            //         let resp = {};
            //         resp = {requests: request};
            //         res.status(200).send(resp);
            //     }).catch(error => {
            //         errorHandler(error, "ERROR");
            //         return res.status(400).send({response: error});
            //     });
            // });
        } else if(req.query.status == 'in_work'){
            where.status = 'in work';
            request = (post => {
                let resp = {};
                resp = {posts: post};
                res.status(200).send(resp);
            });
        } else if(req.query.status == 'completed'){
            where.status = 'completed';
            request = (post => {
                let resp = {};
                resp = {posts: post};
                res.status(200).send(resp);
            });
        } else if (req.query.status == 'offer'){
            where.status = 'offer';
        }

    }
    models.Post.findAll({where: where, include: [{
        model: models.Review,
        as: 'review',
        attributes: ['id', 'comment', 'positive', 'createdAt', 'updatedAt']
    },
        {
            model: models.Category,
            as: 'category',
            through: {
                attributes: []
            }
        },
        {
            model: models.User,
            as: 'executor',
            attributes: ['id', 'name', 'lastName', 'email', 'tel', 'avatar', 'rating']
        },
        {
            model: models.Request,
            as: 'request',
            include: [{
                model: models.User,
                as: 'user',
                attributes: ['id', 'name', 'lastName', 'email', 'tel', 'avatar', 'rating']
            }]
        },
        {
            model: models.Location,
            as: 'location'
        }
    ]}).then(request).catch(error => {
        errorHandler(error, "ERROR");
        return res.status(400).send({response: error});
    })
});
module.exports = router;
