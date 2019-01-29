const models   = require('./models/index');
module.exports = function(title, description){
    models.Log.create({
        title: title,
        description: description
    });
    //     .then(log => {
    //     res.status(200).send({auth: true, token: token})
    // }).catch(error => {
    //     res.status(400).send({
    //         auth: false,
    //         token: null,
    //         response: "EXISTING_EMAIL"
    //     });
    // });
};