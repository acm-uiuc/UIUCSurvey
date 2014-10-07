var express    = require('express');     // call express
var app        = express();         // define our app using express
var bodyParser = require('body-parser');
var crypto     = require('crypto');
var User       = require('./user_model.js');
var Survey     = require('./survey_model.js');
var request = require('request');

// This should not be random. It will be constant in any real situation
var SALT = 'dev'; //crypto.randomBytes(256);

var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:27017/node_auth'); // connect to our database

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('views', __dirname + '/views')
app.set('view engine', 'jade');

var router = express.Router();  

router.use(function(req, res, next){
    var baseUrl = req.url.split('?')[0];
    var hash = req.query.hash;
    console.log(req.url);
    // Everything is secret except for / and /register
    if(baseUrl == '/' || 
        baseUrl == '/register' ||
        baseUrl == '/public'){
        next();
        return;
    }

    if(hash == undefined){
        res.redirect('/api/public');
        return;
    }

    var query = User.where({ hash:hash });
    query.findOne(function(err, user){
        if(err || user == null){
            res.redirect('/api/public');
            return;
        }
        console.log("Hash found");
        next();
    });
});

router.get('/', function (req, res) {
    res.render('login');
});

router.get('/public', function (req, res) {
    res.send("Hello World! This is the public area.");
});

router.get('/secret', function(req, res){
    var hash = req.query.hash; // This should eventually be taken out of GET
    var query = User.where({hash:hash});
    query.findOne(function(err, user){
        if(err || user == null){
            res.redirect('/api/public');
            return;
        }
        var email = user.email;
        res.render('secret', {email:email});
    });
});

router.get('/checkForSurveys', function (req, res){
    var hash = req.query.hash;
    pendingSurvery: {$exists: true}
    var query = User.where({hash:hash, pendingSurvey: {$exists: true}});
    query.findOne(function (err, user){
        if(err || user == null){
            res.send("None");
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

router.post('/register', function (req, res) {
    console.log("Register called");
    var url = 'https://www.googleapis.com/oauth2/v1/tokeninfo?id_token=' + req.body.id_token;
    console.log(url);
    request(url, function (error, response, body){
        console.log(body);
        body = JSON.parse(body);
        console.log(body);
        console.log(body.email);

        if(body.email == undefined || !validateEmailStr(body.email)){
            res.redirect("/api/public");
            return;
        }

        validateRegisteredEmail(body.email, function(result){
            if(result != false){
                console.log(result);
                res.json({hash:result});
                return;
            }

            var sha512 = crypto.createHash("sha512");
            var hash = sha512.update(SALT + body.email).digest('hex');
            var d = {email:body.email, hash:hash, google_user_id:body.user_id, name:body.name}; 
            var user = new User();
            user.email = d.email;
            user.hash = d.hash;
            user.google_id = d.google_user_id;
            user.name = d.name;
            user.collected = {
                "registration_date": new Date().toJSON()
            };
            user.save(function(err){
                if(err) res.send(err);
                console.log(d);
                res.json(d);
            });

        }, false);

    });

});

app.use('/api', router);

function validateEmailStr(email){
    // TODO: change to illinois.edu
    console.log("Checking email: " + email);
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email) && email.indexOf("illinois.edu") > -1;
}

function validateRegisteredEmail(email, callback, checkstr) { 
    if(checkstr && !validateEmailStr(email)) callback(false);
    var query = User.where({ email:email });
    query.findOne(function (err, user){
        if(err || user == null)
            callback(false);
        else callback(user.hash);
    });
} 

var port = process.env.PORT || 3000; 

app.listen(port);

console.log('Cool stuff on port ' + port);

