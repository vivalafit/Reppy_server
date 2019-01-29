const jwt = require('jsonwebtoken');
const config = require('../../../config/_config');
const models   = require('../../../models/index'); // get our postgres model


function verifyPostToken(req, res, next) {
    // const token = req.headers['x-access-token'];
    const token = req.headers.authorization;
    ip = req.ip;
    // console.log(token);
    // console.log(config.tokenSecret);
    if (!token)
        return res.status(403).send({ auth: false, response: 'NO_TOKEN_PROVIDED' });
    jwt.verify(token, config.tokenSecret, function(err, decoded) {
        if (err) {
            console.log(err);
            return res.status(500).send({ auth: false, response: "token_error" });
        }

        // return res.status(500).send({ auth: false, response: 'AUTH_TOKEN_FAILED_ERROR' });

        // if everything good, save to request for use in other routes
        // req.userId = decoded.id;
        console.log(decoded.id);
        console.log(req.body.customerId);
        if (decoded.ip != ip){
            return res.status(500).send({ auth: false, response: "AUTH_TOKEN_FAILED_"});
        }

        if(decoded.checked == false){
            return res.sendStatus(403).send({auth: false, response: "NOT_CONFIRMED_ACCOUNT"})
        }
        userId = decoded.id;

        next();
    });
    return userId;
}
module.exports = verifyPostToken;