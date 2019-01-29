const express = require('express');
const router = express.Router();
var VerifyToken = require('../verifyToken/verifyToken');
const models   = require('../../../models/index'); // get our postgres model
const errorHandler = require('../../../errorHandler');

/**
 * @api {get} faq/ view all faq
 * @apiVersion 0.1.0
 * @apiName FAQ
 * @apiGroup FAQ
 *
 * @apiSuccess {json}   Response.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     "response": [
 *            {
 *                "id": 1,
 *                "question": "Где я нахожусь?",
 *                "answer": "Вы попали на Reppy - портал услуг по ремонту и строительству. Здесь найдётся всё, что было так трудно и долго искать ранее!",
 *                "createdAt": "2018-08-29T07:03:56.303Z",
 *                "updatedAt": "2018-08-29T07:03:56.303Z"
 *            },
 *            {
 *                "id": 2,
 *                "question": "Сколько областей охватывает Reppy?",
 *                "answer": "22 области. Неподвластна временно оккупируемая территория Украины (АР Крым, Донецкая и Луганская области).",
 *                "createdAt": "2018-08-29T07:03:56.352Z",
 *                "updatedAt": "2018-08-29T07:03:56.352Z"
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
    models.Faq.findAll().then(faq => {
        res.status(200).send({response: faq})
    }).catch(error => {
        errorHandler(error, "ERROR");
        res.status(404).send({response: error});
    })
});

router.post('/add', function(req, res) {
    question = req.body.question;
    answer = req.body.answer;
    models.Faq.create({
        question: question,
        answer: answer
    }).then(faq => {
        res.status(200).send({faq: true, response: "FAQ_ADDED"})
    }).catch(error => {
        errorHandler(error, "ERROR");
        res.status(404).send({response: error});
    })
});

module.exports = router;