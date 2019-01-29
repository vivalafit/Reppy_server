const express = require('express');
const router = express.Router();
const models   = require('../../../models/index'); // get our postgres model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const multer  = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.jpg')
    }
});
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './avatars/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.jpg')
    }
});
const upload = multer({ storage: storage });
const avatarUpload = multer({ storage: avatarStorage });
// const upload = multer({ dest: './uploads/'});
const VerifyToken = require('../verifyToken/verifyToken');
const config = require('../../../config/_config');
const errorHandler = require('../../../errorHandler');
const minLength = 10;
const maxLength = 12;
const minNameLength = 2;
const maxNameLength = 12;
const day = 86400;

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
    ip = req.ip;
    models.User.findOne({where: {email: req.body.email}})
        .then(user => {
        user.sessionId++;
        user.save();
        if(bcrypt.compareSync(req.body.password, user.password)) {
            const token = jwt.sign({id: user.id, role: user.role, sessionId: user.sessionId, ip: ip, checked: user.checked}, config.tokenSecret, {
                expiresIn: day*61 // expires in 2 month
            });
            res.status(200).send({ auth: true, token: token});
        } else {
            throw error;
        }
    }).catch(error => {
            // console.log(error);
            errorHandler(error, "INCORRECT_PASSWORD_OR_EMAIL");
            // return res.status(401).send({ auth: false, token: null, response: "INCORRECT_PASSWORD_OR_EMAIL"});
            return res.status(401).send({ auth: false, token: null, response: error});
        }
    );
});
/**
 * @api {post} auth/register User register
 * @apiVersion 0.2.0
 * @apiName Register
 * @apiGroup Auth
 *
 * @apiParam {name} name Users first Name.
 * @apiParam {lastName} lastname Users last Name.
 * @apiParam {email} email Users unique email.
 * @apiParam {tel} telephone Users telephone number.
 * @apiParam {avatar} avatar Users avatar.
 * @apiParam {password} password Users password.
 * @apiParam {locationId} locationId Users locationId.
 *
 * @apiSuccess {json} json auth and token.
 * @apiExample {json} Example usage:
 * {
 *      "name": "Denys",
 *      "lastName": "Игорков",
 *      "email": "myemail@ukr.net",
 *      "tel": "380982223344",
 *      "avatar": "img1.jpg",
 *      "password": "passWord1"
 *      "locationId": "2"
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
 * @apiError validationError Email or password or firstname or lastname or tel is incorrect.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "auth": false,
 *       "token": null,
 *       "response": "INCORRECT_FIST_LAST_NAME_LENGTH"
 *     }
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "auth": false,
 *       "token": null,
 *       "response": "INCORRECT_FIST_LAST_NAME_SYMBOLS"
 *     }
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "auth": false,
 *       "token": null,
 *       "response": "INCORRECT_TEL_SYMBOLS"
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
const avaUpload = avatarUpload.fields([{ name: 'avatar', maxCount: 1 }]);
router.post('/register', avaUpload, function(req, res){
    name = req.body.name;
    lastName = req.body.lastName;
    email = req.body.email;
    tel = req.body.tel;
    password = req.body.password;
    categoryId = req.body.categoryId;
    locationId = req.body.locationId;
    ids = categoryId.split(',');
    avatar = req.files['avatar'];
    // username = req.body.username;
    ip = req.ip;
    if(name.length <= minNameLength || name.length >= maxNameLength || lastName.length <= minNameLength || lastName.length >= maxNameLength){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_FIST_LAST_NAME_LENGTH"});
    }
    else if(!/^[a-zA-ZА-Яа-я\і\ї\є]+$/.test(name) || !/^[a-zA-ZА-Яа-я\і\ї\є]+$/.test(lastName)){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_FIST_LAST_NAME_SYMBOLS"});
    }
    else if(!/^380[0-9]{9}$/.test(tel)){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_TEL_SYMBOLS"});
    }
    else if(password.length <= minLength){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_PASSWORD_LENGTH"});
    }
    else if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(password)){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_PASSWORD_SYMBOLS"});
    }
    else {
        models.User.create({
            name: name,
            lastName: lastName,
            email: email,
            tel: tel,
            password: password,
            locationId: locationId,
            checked: true,
            avatar: avatar
        }).then(user => {
            ids.forEach(function(catId) {
                models.UserCategory.create({
                    categoryId: catId,
                    userId: user.id
                }).catch(error => {
                    errorHandler(error, "ERROR_ADDING");
                    res.status(400).send({
                        ad: false,
                        // response: "ERROR_ADDING"
                        response: error
                    });
                });
            });
            console.log(ip);
            console.log(config.tokenSecret);
            // create a token
            const token = jwt.sign({id: user.id, role: user.role, sessionId: user.sessionId, ip: ip, checked: user.checked}, config.tokenSecret, {
                expiresIn: day*61 // expires in 2 month
            });
            //d
            // create reusable transporter object using the default SMTP transport
            /*let transporter = nodemailer.createTransport({
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
                to: email,
                subject: "Registration",
                text: "That's your link to activate your account",
                html: "<p>That's your link to activate your account</p><a href='http://localhost:4300/v1/auth/activate?token="+token+"&sender="+email+"'>Activate account</a>"
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    errorHandler(error, "ERROR_MAIL_SENDING");
                    return res.status(400).send({response: "ERROR_MAIL_SENDING"});
                }

                res.status(200).send({response: "MESSAGE_SENT"});
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            });*/
            res.status(200).send({auth: true, token: token})
        }).catch(error => {
            errorHandler(error, "EXISTING_EMAIL");
            res.status(400).send({
                auth: false,
                token: null,
                response: "EXISTING_EMAIL"
            });
        });
    }
    });router.post('/companyRegister', function(req, res){
    name = req.body.name;
    workingYears = req.body.workingYears;
    email = req.body.email;
    tel = req.body.tel;
    workersCount = req.body.workersCount;
    password = req.body.password;
    categoryId = req.body.categoryId;
    locationId = req.body.locationId;
    specialization = req.body.specialization;
    taxStatus = req.body.taxStatus;
    taxSystem = req.body.taxSystem;
    vat = req.body.vat;
    ids = categoryId.split(',');
    // avatar = req.files['avatar'];
    // username = req.body.username;
    ip = req.ip;
    if(name.length <= minNameLength || name.length >= maxNameLength){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_FIST_LAST_NAME_LENGTH"});
    }
    // else if(!/^[a-zA-ZА-Яа-я\і\ї\є]+$/.test(name) || !/^[a-zA-ZА-Яа-я\і\ї\є]+$/.test(lastName)){
    //     res.status(401).send({auth:false, token: null, response:"INCORRECT_FIST_LAST_NAME_SYMBOLS"});
    // }
    // else if(!/^380[0-9]{9}$/.test(tel)){
    //     res.status(401).send({auth:false, token: null, response:"INCORRECT_TEL_SYMBOLS"});
    // }
    else if(password.length <= minLength){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_PASSWORD_LENGTH"});
    }
    else if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(password)){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_PASSWORD_SYMBOLS"});
    }
    else {
        models.User.create({
            name: name,
            workingYears: workingYears,
            email: email,
            tel: tel,
            workersCount: workersCount,
            password: password,
            categoryId: categoryId,
            locationId: locationId,
            specialization: specialization,
            taxStatus: taxStatus,
            taxSystem: taxSystem,
            vat: vat,
            role: 'company',
            checked: false
        }).then(user => {
            ids.forEach(function(catId) {
                models.UserCategory.create({
                    categoryId: catId,
                    userId: user.id
                }).catch(error => {
                    errorHandler(error, "ERROR_ADDING");
                    res.status(400).send({
                        ad: false,
                        // response: "ERROR_ADDING"
                        response: error
                    });
                });
            });
            console.log(ip);
            // console.log(config.tokenSecret);
            // create a token
            const token = jwt.sign({id: user.id, role: user.role, sessionId: user.sessionId, ip: ip, checked: user.checked}, config.tokenSecret, {
                expiresIn: day*61 // expires in 2 month
            });
            //d
            // create reusable transporter object using the default SMTP transport
            /*let transporter = nodemailer.createTransport({
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
                to: email,
                subject: "Registration",
                text: "That's your link to activate your account",
                html: "<p>That's your link to activate your account</p><a href='http://localhost:4300/v1/auth/activate?token="+token+"&sender="+email+"'>Activate account</a>"
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    errorHandler(error, "ERROR_MAIL_SENDING");
                    return res.status(400).send({response: "ERROR_MAIL_SENDING"});
                }

                res.status(200).send({response: "MESSAGE_SENT"});
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            });*/
            res.status(200).send({auth: true, token: token})
        }).catch(error => {
            errorHandler(error, "EXISTING_EMAIL");
            res.status(400).send({
                auth: false,
                token: null,
                response: "EXISTING_EMAIL"
            });
        });
    }
});
/**
 * @api {post} auth/activate Activate account
 * @apiVersion 0.1.0
 * @apiName Activate
 * @apiGroup Auth
 *
 * @apiParam {email} email Users email from URL.
 * @apiParam {token} token Users token from URL.
 *
 * @apiSuccess {json} response message.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "repsonse": "ACTIVATION_SUCCESS"
 *     }
 *
 * @apiError noToken Token problems.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "auth": false
 *       "response": "AUTH_TOKEN_FAILED"
 *     }
 * @apiError activateError Activate errors.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "response": "ERROR_ACTIVATING"
 *     }
 */
/*router.post('/activate', function(req, res){
    const token = req.query.token;
    const email = req.query.sender;
    ip = req.ip;
    jwt.verify(token, config.tokenSecret, function(err, decoded) {
        if (err) {
            errorHandler(err, "AUTH_TOKEN_FAILED");
            return res.status(500).send({auth: false, response: "AUTH_TOKEN_FAILED"});
        } else if (decoded.ip !== ip){
            res.sendStatus(500).send({ auth: false, response: "AUTH_TOKEN_FAILED_"});
        } else {
            models.User.find({where: {id: decoded.id}}).then(user => {
                user.active = true;
                user.save();
                return res.status(200).send({response: "ACTIVATION_SUCCESS"});
            }).catch(error => {
                errorHandler(error, "ERROR_ACTIVATING");
                return res.status(400).send({response: "ERROR_ACTIVATING"});
            });
        }
    });
});*/
/**
 * @api {get} auth/single/:id User's profile
 * @apiVersion 0.1.0
 * @apiName SingleUser
 * @apiGroup Auth
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "id": 1,
 *          "name": "denys",
 *          "lastName": "denysdenys",
 *          "avatar": {
 *             "path": "avatars\\avatar-1529399356678.jpg",
 *             "size": 349298,
 *             "encoding": "7bit",
 *             "filename": "avatar-1529399356678.jpg",
 *             "mimetype": "image/png",
 *             "fieldname": "avatar",
 *             "destination": "./avatars/",
 *             "originalname": "diagram 2 from Proskura.png"
 *           },
 *          "role": "user",
 *          "checked": false,
 *          "active": true,
 *          "sessionId": 1,
 *          "createdAt": "2018-06-19T09:09:16.798Z",
 *          "updatedAt": "2018-06-19T09:09:16.798Z",
 *          "locationId": 4,
 *          "location": {
 *              "id": 4,
 *              "city": "Одесса",
 *              "country": "Украина",
 *              "createdAt": "2018-08-29T07:03:56.358Z",
 *              "updatedAt": "2018-08-29T07:03:56.358Z"
 *          }
 *      }
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
// router.get('/single/:id', /*VerifyToken,*/  function(req, res) {
//     // console.log(req.query.userId);
//     // const id = req.params.id;
//     models.User.findById(req.params.id, {
//         attributes: {exclude: ['password', 'tel', 'email']},
//         include: [{
//             model: models.Location,
//             as: 'location'
//         },
//             {
//                 model: models.Category,
//                 as: 'categories'
//             }]
//     }).then(user => {
//         res.status(200).send(user);
//     }).catch(error => {
//         errorHandler(error, "USER_NOT_FOUND");
//         // res.status(404).send({response: "USER_NOT_FOUND"});
//         res.status(404).send({response: error});
//     });
// });
/**
 * @api {get} auth/profile User's profile
 * @apiVersion 0.2.0
 * @apiName Profile
 * @apiGroup Auth
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "id": 4,
 *          "name": "denys",
 *          "lastName": "denysdenys",
 *          "email": "123e3ee@ukr.net",
 *          "tel": "380978887766",
 *          "avatar": {
 *              "path": "avatars\\avatar-1530877396083.jpg",
 *              "size": 5175,
 *              "encoding": "7bit",
 *              "filename": "avatar-1530877396083.jpg",
 *              "mimetype": "image/png",
 *              "fieldname": "avatar",
 *              "destination": "./avatars/",
 *              "originalname": "git-status.png"
 *           },
 *           "role": "user",
 *           "checked": false,
 *           "active": true,
 *           "sessionId": 1,
 *           "createdAt": "2018-07-06T11:43:16.234Z",
 *           "updatedAt": "2018-07-06T11:43:16.234Z",
 *           "locationId": 4,
 *           "location": {
 *               "id": 4,
 *               "city": "Одесса",
 *               "country": "Украина",
 *               "createdAt": "2018-08-29T07:03:56.358Z",
 *               "updatedAt": "2018-08-29T07:03:56.358Z"
 *           }
 *       }
 *
 * @apiError userNotFound user not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "response": "USER_NOT_FOUND"
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
    let userId;
    const token = req.headers['x-access-token'];
    jwt.verify(token, config.tokenSecret, function(err, decoded) {
        if (err) {
            console.log(err);
            return res.status(500).send({auth: false, response: 'AUTH_TOKEN_FAILED_ERROR'});
        }
        // console.log(decoded);
        // if everything good, save to request for use in other routes
        userId = decoded.id;
        console.log(userId);
        models.User.findById(userId, {
            attributes: {exclude: ['password']},
            include: [{
                model: models.Location,
                as: 'location'
            },
            {
                model: models.Review,
                as: 'review'
            },
                {
                    model: models.Category,
                    as: 'categories'
                }]
        }).then(user => {
            console.log(user.review.length);
            // amountReview = user.count(user.review);
            user.review = user.review.length;
            user.save();
            res.status(200).send(user);
        }).catch(error => {
            errorHandler(error, "USER_NOT_FOUND");
            // res.status(404).send({response: "USER_NOT_FOUND"});
            res.status(404).send({response: error});
        });
        // next();
        // return;
    });

});

router.post('/register', avaUpload, function(req, res){
    name = req.body.name;
    lastName = req.body.lastName;
    email = req.body.email;
    tel = req.body.tel;
    password = req.body.password;
    categoryId = req.body.categoryId;
    locationId = req.body.locationId;
    ids = categoryId.split(',');
    avatar = req.files['avatar'];
    // username = req.body.username;
    ip = req.ip;
    if(name.length <= minNameLength || name.length >= maxNameLength || lastName.length <= minNameLength || lastName.length >= maxNameLength){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_FIST_LAST_NAME_LENGTH"});
    }
    else if(!/^[a-zA-ZА-Яа-я\і\ї\є]+$/.test(name) || !/^[a-zA-ZА-Яа-я\і\ї\є]+$/.test(lastName)){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_FIST_LAST_NAME_SYMBOLS"});
    }
    else if(!/^380[0-9]{9}$/.test(tel)){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_TEL_SYMBOLS"});
    }
    else if(password.length <= minLength){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_PASSWORD_LENGTH"});
    }
    else if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(password)){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_PASSWORD_SYMBOLS"});
    }
    else {
        models.User.create({
            name: name,
            lastName: lastName,
            email: email,
            tel: tel,
            password: password,
            locationId: locationId,
            checked: true,
            avatar: avatar
        }).then(user => {
            ids.forEach(function(catId) {
                models.UserCategory.create({
                    categoryId: catId,
                    userId: user.id
                }).catch(error => {
                    errorHandler(error, "ERROR_ADDING");
                    res.status(400).send({
                        ad: false,
                        // response: "ERROR_ADDING"
                        response: error
                    });
                });
            });
            console.log(ip);
            console.log(config.tokenSecret);
            // create a token
            const token = jwt.sign({id: user.id, role: user.role, sessionId: user.sessionId, ip: ip}, config.tokenSecret, {
                expiresIn: day*61 // expires in 2 month
            });
            res.status(200).send({auth: true, token: token})
        }).catch(error => {
            errorHandler(error, "EXISTING_EMAIL");
            res.status(400).send({
                auth: false,
                token: null,
                response: "EXISTING_EMAIL"
            });
        });
    }
});

const editAvaUpload = avatarUpload.fields([{ name: 'avatar', maxCount: 1 }]);
router.put('/edit-profile', editAvaUpload, VerifyToken, function(req, res){
    console.log(userId);
    user = userId;
    name = req.body.name;
    lastName = req.body.lastName;
    categoryId = req.body.categoryId;
    locationId = req.body.locationId;
    avatar = req.files['avatar'];
    // const customerId = req.body.customerId;
    // const status = req.body.status;
    ids = categoryId.split(',');

    if(name.length <= minNameLength || name.length >= maxNameLength || lastName.length <= minNameLength || lastName.length >= maxNameLength){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_FIST_LAST_NAME_LENGTH"});
    }
    else if(!/^[a-zA-ZА-Яа-я\і\ї\є]+$/.test(name) || !/^[a-zA-ZА-Яа-я\і\ї\є]+$/.test(lastName)){
        res.status(401).send({auth:false, token: null, response:"INCORRECT_FIST_LAST_NAME_SYMBOLS"});
    }

    // console.log(req.body);
    const doc = {
        name: name,
        lastName: lastName,
        locationId: locationId,
        avatar: avatar
    };
    models.User.update(doc, {where: {id: userId}}).then(user => {
        // console.log(post.id);
        models.UserCategory.destroy({where: {userId: userId}}).then(() => {
            ids.forEach(function(catId) {
                models.UserCategory.create({
                    categoryId: catId,
                    userId: userId
                }).catch(error => {
                    errorHandler(error, "ERROR_ADDING");
                    res.status(400).send({
                        ad: false,
                        // response: "ERROR_ADDING"
                        response: error
                    });
                });
            });
            res.status(200).send({post: true, response: "USER_UPDATED"})
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
 * @api {get} auth/allUsers Get all users
 * @apiVersion 0.1.0
 * @apiName AllUsers
 * @apiGroup Auth
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *         {
 *             "id": 1,
 *             "name": "denys",
 *             "lastName": "denysdenys",
 *             "email": "123eee@ukr.net",
 *             "tel": "380978887766",
 *             "avatar": {
 *                 "path": "avatars\\avatar-1529399356678.jpg",
 *                 "size": 349298,
 *                 "encoding": "7bit",
 *                 "filename": "avatar-1529399356678.jpg",
 *                 "mimetype": "image/png",
 *                 "fieldname": "avatar",
 *                 "destination": "./avatars/",
 *                 "originalname": "diagram 2 from Proskura.png"
 *             },
 *             "role": "user",
 *             "checked": false,
 *             "active": true,
 *             "sessionId": 1,
 *             "createdAt": "2018-06-19T09:09:16.798Z",
 *             "updatedAt": "2018-06-19T09:09:16.798Z",
 *             "locationId": 2,
 *             "location": {
 *                 "id": 2,
 *                 "city": "Харьков",
 *                 "country": "Украина",
 *                 "createdAt": "2018-08-29T07:03:56.352Z",
 *                 "updatedAt": "2018-08-29T07:03:56.352Z"
 *             }
 *         },
 *         {
 *             "id": 3,
 *             "name": "denys",
 *             "lastName": "denysdenys",
 *             "email": "123e@ukr.net",
 *             "tel": "380978887766",
 *             "avatar": {
 *                 "path": "avatars\\avatar-1530612996312.jpg",
 *                 "size": 349298,
 *                 "encoding": "7bit",
 *                 "filename": "avatar-1530612996312.jpg",
 *                 "mimetype": "image/png",
 *                 "fieldname": "avatar",
 *                 "destination": "./avatars/",
 *                 "originalname": "diagram 2 from Proskura.png"
 *             },
 *             "role": "user",
 *             "checked": false,
 *             "active": true,
 *             "sessionId": 1,
 *             "createdAt": "2018-07-03T10:16:36.459Z",
 *             "updatedAt": "2018-07-03T10:16:36.459Z",
 *             "locationId": 2,
 *             "location": {
 *                 "id": 2,
 *                 "city": "Харьков",
 *                 "country": "Украина",
 *                 "createdAt": "2018-08-29T07:03:56.352Z",
 *                 "updatedAt": "2018-08-29T07:03:56.352Z"
 *             }
 *         }
 *     ]
 *
 * @apiError usersNotFound user not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "response": "USERS_NOT_FOUND"
 *     }
 */

router.get('/allUsers', /*VerifyToken,*/  function(req, res) {
    models.User.findAll({
        attributes: {exclude: ['password']},
        include: [{
            model: models.Location,
            as: 'location'
        }]
    }).then(user => {
        res.status(200).send(user);
    }).catch(error => {
        errorHandler(error, "USERS_NOT_FOUND");
        // res.status(404).send({response: "USER_NOT_FOUND"});
        res.status(404).send({response: error});
    });
});
/**
 * @api {get} auth/freelancers Get all freelancers
 * @apiVersion 0.1.0
 * @apiName Freelancers
 * @apiGroup Auth
 *
 * @apiParam {URL} GET parametres from URL(categoryId).
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *           "count": 2,
 *           "rows": [
 *               {
 *                   "id": 1,
 *                   "name": "Иван",
 *                   "lastName": "Петров",
 *                   "email": "user1@test.com",
 *                   "tel": "380991234567",
 *                   "avatar": "Gachi.jpg",
 *                   "role": "user",
 *                   "checked": true,
 *                   "active": true,
 *                   "rating": 85,
 *                   "positive": null,
 *                   "negative": null,
 *                   "sessionId": 1,
 *                   "createdAt": "2018-08-27T07:54:48.039Z",
 *                   "updatedAt": "2018-08-27T07:54:48.039Z",
 *                   "locationId": 2
 *                   "categories": [
 *                       {
 *                           "id": 1,
 *                           "title": "Бетонные работы",
 *                           "description": "Заливка бетоном пола, выливание конструкций",
 *                           "createdAt": "2018-08-27T07:54:48.199Z",
 *                           "updatedAt": "2018-08-27T07:54:48.199Z"
 *                       },
 *                       {
 *                           "id": 2,
 *                           "title": "Земляные работы",
 *                           "description": "Перекопка, выкопка ям",
 *                           "createdAt": "2018-08-27T07:54:48.203Z",
 *                           "updatedAt": "2018-08-27T07:54:48.203Z"
 *                       }
 *                   ],
 *                   "location": {
 *                      "id": 2,
 *                      "city": "Харьков",
 *                      "country": "Украина",
 *                      "createdAt": "2018-08-29T07:03:56.352Z",
 *                      "updatedAt": "2018-08-29T07:03:56.352Z"
 *                   }
 *               },
 *               {
 *                   "id": 2,
 *                   "name": "Николай",
 *                   "lastName": "Васильев",
 *                   "email": "user2@test.com",
 *                   "tel": "380668901234",
 *                   "avatar": "Gachi2.jpg",
 *                   "role": "user",
 *                   "checked": true,
 *                   "active": true,
 *                   "rating": 73,
 *                   "positive": null,
 *                   "negative": null,
 *                   "sessionId": 1,
 *                   "createdAt": "2018-08-27T07:54:48.191Z",
 *                   "updatedAt": "2018-08-27T07:54:48.191Z",
 *                   "locationId": 2
 *                   "categories": [],
 *                   "location": {
 *                      "id": 2,
 *                      "city": "Харьков",
 *                      "country": "Украина",
 *                      "createdAt": "2018-08-29T07:03:56.352Z",
 *                      "updatedAt": "2018-08-29T07:03:56.352Z"
 *                   }
 *               }
 *           ]
 *      }
 *
 * @apiError usersNotFound user not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "response": "USERS_NOT_FOUND"
 *     }
 */
router.get('/freelancers', /*VerifyToken,*/  function(req, res) {
    // let where = {};
    let limit = 25;
    let offset = 0;
    let params = {where: {checked: true}, attributes: {exclude: ['password']}, include: [{
            model: models.Category,
            as: 'categories',
            // where: where,
            through: {
                attributes: []
            }
        },
        {
            model: models.Location,
            as: 'location'
        },
        {
            model: models.Review,
            as: 'review'
        }],
        distinct: true,
        offset: offset,
        limit: limit};
    if(req.query.categoryId){
        params = {where: {checked: true}, attributes: {exclude: ['password']}, include: [{
                model: models.Category,
                as: 'categories',
                where: {id: req.query.categoryId},
                through: {
                    attributes: []
                }
            },
                {
                    model: models.Location,
                    as: 'location'
                },
                {
                    model: models.Review,
                    as: 'review'
                }],
            distinct: true,
            offset: offset,
            limit: limit}
    }
    if(req.query.limit){
        limit = req.query.limit;
    }
    if(req.query.offset){
        offset = (req.query.offset-1) * limit;
    }
    if(req.query.userId) {
        params.where.id = {};
        params.where.id.$ne = req.query.userId;
    }
    models.User.findAndCountAll(params).then(user => {
        let resp = {};
        resp = {data: user.rows, length: user.count};
        res.status(200).send(user);
    }).catch(error => {
        errorHandler(error, "USERS_NOT_FOUND");
        // res.status(404).send({response: "USER_NOT_FOUND"});
        res.status(404).send({response: error});
    });
});
/**
 * @api {post} auth/addUserCategory Add user category relation
 * @apiVersion 0.1.0
 * @apiName UserCategory
 * @apiGroup Auth
 *
 * @apiParam {userId} userId User id.
 * @apiParam {categoryId} categoryId Category id.
 *
 * @apiExample {json} Example usage:
 * {
 *      "userId": "1",
 *      "categoryId": "1",
 * }
 * @apiSuccess {json} json Post.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "response": "USER_CAT_ADDED"
 *     }
 *
 * @apiError serverError Server error.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "response": "ERROR"
 *     }
 */
router.post('/addUserCategory', /* VerifyToken,*/ function(req, res){
    userId = req.body.userId;
    categoryId = req.body.categoryId;
    models.UserCategory.create({
        userId: userId,
        categoryId: categoryId
    }).then(option => {
        res.status(200).send({response: "USER_CAT_ADDED"})
    }).catch(error => {
        errorHandler(error, "ERROR_ADDING");
        res.status(400).send({
            response: error
        });
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

    const sender = req.body.email;
    let token;
    var usId = -1;
    models.User.find({where: {email: sender}}).then(user => {
        usId = user.id;
    }).then(() => {
        token = jwt.sign({id: usId}, config.tokenSecret, {
            expiresIn: day*61, // expires in 24 hours
            issuer: 'pwdResetPwd'
        });
    }).then(() => {
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
            html: "<p>That's your link to change password</p><a href='http://localhost:4200/v1/auth/resetpassword?token="+token+"&sender="+sender+"'>Change password</a>"
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                errorHandler(error, "ERROR_MAIL_SENDING");
                return res.status(400).send({response: "ERROR_MAIL_SENDING"});
            }

            res.status(200).send({response: "MESSAGE_SENT"});
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });
    }).catch(error => {
        errorHandler(error, "ERROR_MAIL_SENDING");
        return res.status(400).send({response: "ERROR_MAIL_SENDING"});
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
        if (err) {
            errorHandler(err, "AUTH_TOKEN_FAILED");
            return res.status(500).send({auth: false, response: "AUTH_TOKEN_FAILED"});
        }
        if(password.length < minLength){
            return res.status(401).send({auth:false, response:"INCORRECT_PASSWORD_LENGTH"});
        }
        else if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(password)){
            return res.status(401).send({auth:false, response:"INCORRECT_PASSWORD_SYMBOLS"});
        }
        models.User.find({where: {id: decoded.id}}).then(user => {
            user.password = password;
            user.sessionId++;
            user.save();
            return res.status(200).send({response: "CHANGE_SUCCESS"});
        }).catch(error => {
            errorHandler(error, "UPDATING_ERROR");
            return res.status(400).send({response: "UPDATING_ERROR"});
        });
    });
});
/**
 * @api {post} auth/identify Upload passport
 * @apiVersion 0.1.0
 * @apiName Identify
 * @apiGroup Auth
 *
 * @apiParam {passIndex} passIndex Users passport seria and number.
 * @apiParam {passImg} passImg Users passport photo.
 * @apiParam {userImg} userImg Users photo with passport.
 * @apiParam {userId} userId Users id.
 *
 * @apiExample {json} Example usage:
 * {
 *      "passIndex": "TT111111",
 *      "passImg": "photo.img",
 *      "userImg": "file.img",
 *      "userId": "2",
 *
 * }
 *
 * @apiSuccess {json} response message.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "repsonse": "UPLOAD_SUCCESSFUL"
 *     }
 *
 * @apiError uploadError Upload errors.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "response": "ERROR_UPLOADING"
 *     }
 */
const cpUpload = upload.fields([{ name: 'passImg', maxCount: 1 }, { name: 'userImg', maxCount: 1 }]);
router.post('/identify', cpUpload, function(req, res){
    const passImg = req.files['passImg'][0];
    const userImg = req.files['userImg'][0];
    const passIndex = req.body.passIndex;
    const userId = req.body.userId;

    models.Addition.create({
        passIndex: passIndex,
        passImg: passImg,
        userImg: userImg,
        userId: userId
    }).then(addition => {
        res.status(200).send({response: "UPLOAD_SUCCESSFUL"})
    }).catch(error => {
        errorHandler(error, "ERROR_UPLOADING");
        res.status(400).send({ response: "ERROR_UPLOADING" });
    });
});
/**
 * @api {post} auth/setCheckedUser Set that user is checked
 * @apiVersion 0.1.0
 * @apiName setCheckedUser
 * @apiGroup Auth
 *
 * @apiParam {id} id Users id.
 *
 * @apiExample {json} Example usage:
 * {
 *      "id": "2"
 *
 * }
 *
 * @apiSuccess {json} response message.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "repsonse": "CHANGE_SUCCESS"
 *     }
 *
 * @apiError updateError Update errors.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "response": "ERROR_UPDATING"
 *     }
 */
router.post('/setCheckedUser', function(req, res){
    models.User.find({where: {id: req.body.id}}).then(user => {
        user.checked = true;
        user.save();
        return res.status(200).send({response: "CHANGE_SUCCESS"});
    }).catch(error => {
        errorHandler(error, "ERROR_UPDATING");
        return res.status(400).send({response: "ERROR_UPDATING"});
    });
});

module.exports = router;
