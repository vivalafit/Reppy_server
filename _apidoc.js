const express = require('express');
const router = express.Router();
const models   = require('../../../models/index'); // get our postgres model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
var VerifyToken = require('./VerifyToken');
const config = require('../../../config/_config');
const minLength = 6;
const maxLength = 12;

/**
 * @api {post} auth/ User login
 * @apiVersion 0.1.0
 * @apiName Login
 * @apiGroup Auth
 *
 * @apiParam {email} email Users unique email.
 * @apiParam {password} password Users password.
 *
 * @apiExample {json} Example usage:
 *     {
 *      "email": "user@gmail.com",
 *      "password": "pass123"
 *     }
 * @apiSuccess {String} string Login successful.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "auth": true,
 *       "token": "sometoken"
 *     }
 *
 * @apiError UserNotFound The email of the User was not found or password is incorrect.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "auth": false,
 *       "token": null,
 *       "response": "INCORRECT_PASSWORD_OR_EMAIL"
 *     }
 */
router.post('/', function(req, res) {
    models.User.findOne({where: {email: req.body.email}})
        .then(user => {
            if(bcrypt.compareSync(req.body.password, user.password)) {
                const token = jwt.sign({ id: user.id }, config.tokenSecret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                res.status(200).send({ auth: true, token: token });
            } else {
                throw "error";
            }
        }).catch(error => {
            // console.log(error);
            return res.status(401).send({ auth: false, token: null, response: "INCORRECT_PASSWORD_OR_EMAIL"});
        }
    );
});
/**
 * @api {post} auth/register User register
 * @apiVersion 0.1.0
 * @apiName Register
 * @apiGroup Auth
 *
 * @apiParam {username} username Users username.
 * @apiParam {password} password Users password.
 * @apiParam {email} email Users unique email.
 *
 * @apiSuccess {json} json auth and token.
 * @apiExample {json} Example usage:
 * {
 *      "username": "user12",
 *      "password": "passWord1",
 *      "email": "myemail@ukr.net"
 * }
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "auth": true,
 *       "token": "sometoken"
 *     }
 *
 * @apiError invalidEmail Email already exists.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "auth": false,
 *       "token": null,
 *       "response": "EXISTING_EMAIL"
 *     }
 *
 * @apiError validationError Email or password is incorrect.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "auth": false,
 *       "token": null,
 *       "response": "INCORRECT_USERNAME_LENGTH"
 *     }
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "auth": false,
 *       "token": null,
 *       "response": "INCORRECT_USERNAME_SYMBOLS"
 *     }
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "auth": false,
 *       "token": null,
 *       "response": "INCORRECT_PASSWORD_LENGTH"
 *     }
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "auth": false,
 *       "token": null,
 *       "response": "INCORRECT_PASSWORD_SYMBOLS"
 *     }
 */
router.post('/register', function(req, res){
    password = req.body.password;
    email = req.body.email;
    username = req.body.username;
    if(username.length <= minLength || username.length >= maxLength){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_USERNAME_LENGTH"});
    }
    else if(!/^[A-Za-z0-9]+$/.test(username)){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_USERNAME_SYMBOLS"});
    }
    else if(password.length <= minLength){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_PASSWORD_LENGTH"});
    }
    else if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(password)){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_PASSWORD_SYMBOLS"});
    }
    else {
        models.User.create({
            username: username,
            password: password,
            email: email
        }).then(user => {
            // create a token
            const token = jwt.sign({id: user.id}, config.tokenSecret, {
                expiresIn: 86400 // expires in 24 hours
            });
            res.status(200).send({auth: true, token: token})
        }).catch(error => {
            res.status(400).send({
                auth: false,
                token: null,
                response: "EXISTING_EMAIL"
            });
        });
    }
});
/**
 * @api {get} auth/profile User's profile
 * @apiVersion 0.1.0
 * @apiName Profile
 * @apiGroup Auth
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 111,
 *       "username": "user",
 *       "email": "qwerty@gmail.com",
 *       "password": "0",
 *       "role": "user",
 *       "active": true,
 *       "createdAt": "2018-04-27T15:37:38.690Z",
 *       "updatedAt": "2018-04-27T15:37:38.690Z"
 *     }
 *
 * @apiError userNotFound user not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "response": "USER_NOT_FOUND"
 *     }
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "response": "FINDING_PROBLEM"
 *     }
 *
 * @apiError noToken Token problems.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "auth": false
 *       "response": "NO_TOKEN_PROVIDED"
 *     }
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "auth": false
 *       "response": "AUTH_TOKEN_FAILED"
 *     }
 */
router.get('/profile', VerifyToken,  function(req, res) {
    models.User.findById(req.userId, { password: 0 }).then(user => {
        user.password = 0;
        res.status(200).send(user);
    }).catch(error => {
        if (error) return res.status(500).send({response: "FINDING_PROBLEM"});
        if (!user) return res.status(404).send({response: "USER_NOT_FOUND"});
    });
});
/**
 * @api {post} auth/forgetpassword Forget Password
 * @apiVersion 0.1.0
 * @apiName ForgetPassword
 * @apiGroup Auth
 *
 * @apiParam {email} email Users email.
 *
 * @apiExample {json} Example usage:
 * {
 *      "email": "myemail@ukr.net"
 * }
 *
 * @apiSuccess {json} response message.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "repsonse": "MESSAGE_SENT"
 *     }
 *
 * @apiError serverError Email can't be sent.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "response": "ERROR_MAIL_SENDING"
 *     }
 */
router.post('/forgetpassword', function(req, res){
    const token = jwt.sign({check: config.changePassToken}, config.tokenSecret, {
        expiresIn: 86400 // expires in 24 hours
    });
    const sender = req.body.email;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: config.mailUser, // generated ethereal user
            pass: config.mailPass // generated ethereal password
        }
    });

    const mailOptions = {
        from: config.mailUser,
        to: sender,
        subject: "Password changing",
        text: "That's your link to change password",
        html: "<p>That's your link to change password</p><a href='http://localhost:8080/v1/auth/resetpassword?token="+token+"&sender="+sender+"'>Change password</a>"
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(400).send({response: "ERROR_MAIL_SENDING"});
            return console.log(error);
        }

        res.status(200).send({response: "MESSAGE_SENT"});
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
});
/**
 * @api {post} auth/resetpassword Reset Password
 * @apiVersion 0.1.0
 * @apiName ResetPassword
 * @apiGroup Auth
 *
 * @apiParam {email} email Users email from URL.
 * @apiParam {token} token Users token from URL.
 * @apiParam {password} password Users new password.
 *
 * @apiExample {json} Example usage:
 * {
 *      "password": "newPass1"
 * }
 *
 * @apiSuccess {json} response message.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "repsonse": "CHANGE_SUCCESS"
 *     }
 *
 * @apiError validationError Password is incorrect.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "auth": false,
 *       "response": "INCORRECT_PASSWORD_LENGTH"
 *     }
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "auth": false,
 *       "response": "INCORRECT_PASSWORD_SYMBOLS"
 *     }
 * @apiError noToken Token problems.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "auth": false
 *       "response": "AUTH_TOKEN_FAILED"
 *     }
 * @apiError updateError Update errors.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "response": "UPDATING_ERROR"
 *     }
 */
router.post('/resetpassword', function(req, res){
    const token = req.query.token;
    const email = req.query.sender;
    const password = req.body.password;
    jwt.verify(token, config.tokenSecret, function(err, decoded) {
        if (err)
            return res.status(500).send({ auth: false, message: 'AUTH_TOKEN_FAILED' });
        // if everything good, save to request for use in other routes
        if(config.changePassToken != decoded.check)
            return res.status(500).send({ auth: false, message: 'AUTH_TOKEN_FAILED' });
        const doc = {
            password: password
        };
        if(password.length < minLength){
            return res.status(401).send({auth:false, response:"INCORRECT_PASSWORD_LENGTH"});
        }
        else if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(password)){
            return res.status(401).send({auth:false, response:"INCORRECT_PASSWORD_SYMBOLS"});
        }
        models.User.update(doc, {where: {email: email}}).then(user => {
            return res.status(200).send({response: "CHANGE_SUCCESS"});
        }).catch(error => {
            return res.status(400).send({response: "UPDATING_ERROR"});
        });
    });
})

module.exports = router;
