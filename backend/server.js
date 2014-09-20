var express    = require('express');     // call express
var app        = express();         // define our app using express
var bodyParser = require('body-parser');
var crypto     = require('crypto');
var User       = require('./user_model.js');
var Survey     = require('./survey_model.js');

// This should not be random. It will be constant in any real situation
var SALT = 'dev'; //crypto.randomBytes(256);

var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:27017/node_auth'); // connect to our database

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = express.Router();  

router.use(function(req, res, next){
    var baseUrl = req.url.split('?')[0];
    var hash = req.query.hash;
    console.log(req.url);
    // Everything is secret except for / and /register
    if(baseUrl == '/' || baseUrl == '/register'){
        next();
        return;
    }

    if(hash == undefined){
        res.redirect('/api/');
        return;
    }
    // TODO: Check to make sure hash is in database
    var query = User.where({ hash:hash });
    query.findOne(function(err, user){
        if(err || user == null){
            res.redirect('/api/register');
            return;
        }
        console.log("Hash found");
        next();
    });
});

router.get('/', function (req, res) {
      res.send('Welcome to the public area.');
});

router.get('/secret', function(req, res){
    res.send('Welcome to the secret area.');
});

router.get('/checkForSurveys', function (req, res){
    var hash = req.query.hash;
    pendingSurvery: {$exists: true}
    var query = User.where({hash:hash, pendingSurvey: {$exists: true}});
    query.findOne(function (err, user){
        if(err || user == null){
            res.send(500);
            return;
        }
        // User has a survery waiting
        // Pull up survey
        
        var query2 = Survey.where({_id:user.pendingSurvey});
        query2.findOne(function (err, survey){
            console.log(survey);
            res.send(survey);
        });
    });
});

router.post('/surveyResponse', function (req, res){
    // TODO
    console.log(req.body);
    res.send(req.body);
});

router.get('/collectedData', function (req, res){
    var query = User.where({hash:req.query.hash});
    query.findOne(function (err, user){
        if(err || user == null){
            res.send(500);
            return;
        }
        res.send(user.collected);
    });
});

router.get('/register', function (req, res) {
    var email = req.query.email;

    // Client should send email
    if(email == undefined || 
        !validateEmailStr(email)){
        res.send(401);
    }else{
        validateRegisteredEmail(email, function(result){
            if(result){
                res.send(401);
                return;
            }

            var sha512 = crypto.createHash("sha512");
            var hash = sha512.update(SALT + req.query.email).digest('hex');
            var d = {email:req.query.email, hash:hash}; 
            var user = new User();
            user.email = d.email;
            user.hash = d.hash;
            user.collected = {
                "registration_date": new Date().toJSON()
            };
            user.save(function(err){
                if(err) res.send(err);
                res.json(d);
            });

        }, false);
    }
});

app.use('/api', router);

function validateEmailStr(email){
    // TODO: change to illinois.edu
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validateRegisteredEmail(email, callback, checkstr) { 
    if(checkstr && !validateEmailStr(email)) callback(false);
    var query = User.where({ email:email });
    query.findOne(function (err, user){
        callback(!err && user != null);
    });
} 

var port = process.env.PORT || 3000; 

app.listen(port);

console.log('Cool stuff on port ' + port);

