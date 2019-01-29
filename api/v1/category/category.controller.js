const express = require('express');
const router = express.Router();
var VerifyToken = require('../verifyToken/verifyToken');
const models   = require('../../../models/index'); // get our postgres model
const errorHandler = require('../../../errorHandler');
/**
 * @api {get} categories/ Categories view
 * @apiVersion 0.1.0
 * @apiName ViewAll
 * @apiGroup Categories
 *
 * @apiSuccess {Object} array  Array of the categories.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "id": 2
 *        "title": "some title",
 *        "description": "some description"
 *     },
 *     {
 *        "id": 5
 *        "title": "some title",
 *        "description": "some description"
 *     }
 *
 * @apiError categoryNotFound category not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "response": "ERROR_VIEWING_CATEGORIES"
 *     }
 */
router.get('/', function(req, res){
    models.Category.findAll({include: [{model: models.Group, as: 'groups'}]}).then(category => {
        res.send(category);
    }).catch(error => {
        console.log(error);
        errorHandler(error, "ERROR_VIEWING_CATEGORIES");
        // return res.status(404).send({response: "ERROR_VIEWING_CATEGORIES"});
        res.status(404).send({response: error});
    })
});

/**
 * @api {get} categories/:id Category view
 * @apiVersion 0.1.0
 * @apiName View
 * @apiGroup Categories
 *
 * @apiParam {Number} id Category unique ID.
 *
 * @apiSuccess {String} name  Name of the category.
 * @apiSuccess {String} title  Title of the category.
 * @apiSuccess {String} description  Description of the category.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "title": "some title",
 *       "description": "some description"
 *     }
 *
 * @apiError categoryNotFound category not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "response": "CATEGORY_NOT_FOUND"
 *     }
 */
router.get('/:id', function(req, res) {
    models.Category.findById(req.params.id).then(category => {
        res.status(200).send(category);
    }).catch(error => {
        console.log(error);
        errorHandler(error, "CATEGORY_NOT_FOUND");
        return res.status(404).send({response: "CATEGORY_NOT_FOUND"});
    });
});
/////////////////////////////////////////////////
/**
 * @api {post} categories/add Category add
 * @apiVersion 0.1.0
 * @apiName Add
 * @apiGroup Categories
 *
 * @apiParam {title}  Category title.
 * @apiParam {description}  Category description.
 *
 * @apiSuccess {json}   Response.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "response": "CATEGORY_ADDED"
 *     }
 *
 * @apiError errorAdding Error while adding.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "response": "ERROR_ADDING"
 *     }
 */
router.post('/add', function(req, res){
   models.Category.create({
       title: req.body.title,
       description: req.body.description
   }).then(category => {
       res.status(200).send({response: "CATEGORY_ADDED"})
   }).catch(error => {
       errorHandler(error, "ERROR_ADDING");
       res.status(400).send({response: "ERROR_ADDING"});
   });
});
router.post('/addGroup', function(req, res){
   models.Group.create({
       title: req.body.title,
       type: req.body.type,
       categoryId: req.body.categoryId
   }).then(category => {
       res.status(200).send({response: "GROUP_ADDED"})
   }).catch(error => {
       errorHandler(error, "ERROR_ADDING");
       res.status(400).send({response: "ERROR_ADDING"});
   });
});
router.post('/addProperty', function(req, res){
   models.Property.create({
       title: req.body.title,
       groupId: req.body.groupId,
       adId: req.body.adId
   }).then(category => {
       res.status(200).send({response: "PROPERTY_ADDED"})
   }).catch(error => {
       errorHandler(error, "ERROR_ADDING");
       res.status(400).send({response: error});
   });
});

/**
 * @api {get} categories/singleCat/:id view all posts from category
 * @apiVersion 0.1.0
 * @apiName Add
 * @apiGroup Categories
 *
 * @apiParam {id}  Category id.
 *
 * @apiSuccess {json}   Response.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 4,
 *       "title": "newad",
 *       "price": 100,
 *       "attachments": null,
 *       "createdAt": "2018-07-03T10:18:19.249Z",
 *       "updatedAt": "2018-07-03T10:18:19.249Z"
 *     },
 *     {
 *       "id": 5,
 *       "title": "newad",
 *       "price": 100,
 *       "attachments": null,
 *       "createdAt": "2018-07-03T10:18:19.249Z",
 *       "updatedAt": "2018-07-03T10:18:19.249Z"
 *     },
 *
 *
 * @apiError error Error while searching.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "response": "POSTS_NOT_FOUND"
 *     }
 */

router.get('/singleCat/:id', function(req, res) {
    models.Post.findAll({where: { customerId: {$ne: req.query.userId}}, include:[{
        model: models.Category,
        as: 'category',
        where: {id: req.params.id},
        // attributes: ['title', 'description'],
        through: {
            attributes: []
        }
    }]
    }).then(posts => {
        res.status(200).send(posts);
    }).catch(error => {
        console.log(error);
        errorHandler(error, "POSTS_NOT_FOUND");
        return res.status(404).send({response: "POSTS_NOT_FOUND"});
    });
});

module.exports = router;