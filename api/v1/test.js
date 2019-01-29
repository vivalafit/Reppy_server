const express = require('express');
const router = express.Router();
const models   = require('../../models/index');
/**
 * @api {post} test/ test logs
 * @apiVersion 0.1.0
 * @apiName Logs
 * @apiGroup Test
 *
 *
 * @apiSuccess {json} json logs table
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 1,
 *       "title": "INCORRECT_PASSWORD_OR_EMAIL",
 *       "description": "error",
 *       "createdAt": "2018-05-04T13:12:44.237Z",
 *       "updatedAt": "2018-05-04T13:12:44.237Z",
 *       "deletedAt": null
 *     }
 *
 */
router.get('/', function(req, res){
    models.Log.findAll().then(log => {
        res.send(log);
    }).catch(error => {
        res.send(error);
    })
});

module.exports = router;