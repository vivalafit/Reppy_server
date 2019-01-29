const express = require('express');
const router = express.Router();
var VerifyToken = require('../verifyToken/verifyToken');
const models   = require('../../../models/index'); // get our postgres model
const errorHandler = require('../../../errorHandler');

/**
 * @api {get} location/ view all locations
 * @apiVersion 0.1.0
 * @apiName View
 * @apiGroup Location
 *
 * @apiSuccess {json}   Response.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     "response": [
 *            {
 *                "id": 1,
 *                "city": "Киев",
 *                "country": "Украина",
 *                "createdAt": "2018-08-29T07:03:56.303Z",
 *                "updatedAt": "2018-08-29T07:03:56.303Z"
 *            },
 *            {
 *                "id": 2,
 *                "city": "Харьков",
 *                "country": "Украина",
 *                "createdAt": "2018-08-29T07:03:56.352Z",
 *                "updatedAt": "2018-08-29T07:03:56.352Z"
 *            },
 *            {
 *                "id": 3,
 *                "city": "Львов",
 *                "country": "Украина",
 *                "createdAt": "2018-08-29T07:03:56.356Z",
 *                "updatedAt": "2018-08-29T07:03:56.356Z"
 *            },
 *            {
 *                "id": 4,
 *                "city": "Одесса",
 *                "country": "Украина",
 *                "createdAt": "2018-08-29T07:03:56.358Z",
 *                "updatedAt": "2018-08-29T07:03:56.358Z"
 *            }
 *       ]
 *
 *
 * @apiError error Error.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "response": "ERROR"
 *     }
 */
router.get('/', function(req, res) {
    models.Location.findAll().then(location => {
        res.status(200).send({response: location})
    }).catch(error => {
        errorHandler(error, "ERROR");
        res.status(404).send({response: error});
    })
});

module.exports = router;