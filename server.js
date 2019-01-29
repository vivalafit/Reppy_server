const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const config = require('./config'); // get our config file
const models  = require('./models/index'); // get our postgres model
const auth = require('./api/v1/auth/auth.controller');
const cors = require('cors');
const cronJob=require('cron').CronJob;
const path = require('path');

//_______________________sec_min_hour_day_month_day of week
/*let newJob = new cronJob('* 0 *!/1 * * *', function(){
    // models.User.findAll({where: {active: true}}).then(users => {
    //     users.forEach(function(el){
    //         el.active = false;
    //         el.save();
    //     });
    // });
    models.User.findAll({where: {active: false}}).then(users => {
        var datetime = new Date();
        users.forEach(function(el){
            curTime = datetime.getTime();
            userTime = el.createdAt.getTime() + 86400000;// + one day
            console.log(curTime);
            console.log(userTime);
            if(curTime > userTime){
                console.log("user was created more than one day");
                el.destroy();
                console.log("user was deleted");
            } else {
                console.log("user was just created");
            }
           // console.log(datetime.getTime());
           // console.log(el.createdAt);
        });
        // for(var i=0; i<users.length; i++){
        //     console.log(datetime);
        //     console.log(users[i].createdAt)
        // }
    }).catch(error => {
        console.log(error);
    });
}, null, true, 'Europe/Kiev');*/

// const secretWord = "rQjd73Jeu9U4h";

models.sequelize.sync().then(function() {

    console.log('connected to database');
    return require('./seeder')();
}).then(function() {app.listen(port)});
// =======================
// configuration =========
// =======================
const port = process.env.PORT || 4300; // used to create, sign, and verify tokens
// app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
// app.use(bodyParser({limit: '100mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors({origin:true,credentials: true}));

// // use morgan to log requests to the console
// app.use(morgan('dev'));

// =======================
// routes ================
// =======================
// basic route
app.get('/uploads', function(req, res){
    res.status(403).send('FORBIDDEN');
});
app.get('/avatars', function(req, res){
    res.status(403).send('FORBIDDEN');
});
app.get('/attachments', function(req, res){
    res.status(403).send('FORBIDDEN');
});

// app.get('/', function(req, res) {
//     res.send('Hello! The API is at http://localhost:' + port + '/api');
// });
app.use('/avatars/', express.static('avatars'));
// app.use('/', express.static('public'));


app.use('/v1', require('./api/v1/index'));
// app.use('*', (req, res, next) => {
//     res.sendFile(path.normalize(__dirname + '/public/index.html'));
// });

// app.get('/setup', function(req, res) {
//
//     // create a sample user
//     models.User.create({
//         username: 'Nick Cerminara',
//         password: 'password',
//         email: 'denys@gmail.com'
//     });
//     res.send("idiot");
//     // save the sample user
//
// });
// API ROUTES -------------------
// we'll get to these in a second

// =======================
// start the server ======
// =======================




console.log('Magic happens at http://localhost:' + port);