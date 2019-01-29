const jwt = require('jsonwebtoken');
const config = require('../../../config/_config');

function verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    ip = req.ip;
    // console.log(12398989989898);
    if (!token)
        return res.status(403).send({ auth: false, response: 'NO_TOKEN_PROVIDED' });
    jwt.verify(token, config.tokenSecret, function(err, decoded) {
        if (err) {
            console.log(err);
            return res.status(500).send({auth: false, response: 'AUTH_TOKEN_FAILED_ERROR'});
        }
        // if everything good, save to request for use in other routes
        // req.userId = decoded.id;
        // console.log(decoded);

        if (decoded.ip !== ip){
            return res.sendStatus(500).send({ auth: false, response: "AUTH_TOKEN_FAILED_"});
        }

        if(decoded.checked == false){
            return res.sendStatus(403).send({auth: false, response: "NOT_CONFIRMED_ACCOUNT"})
        }
        userId = decoded.id;
        // console.log(userId);
        next();
    });
    return userId;
}
module.exports = verifyToken;