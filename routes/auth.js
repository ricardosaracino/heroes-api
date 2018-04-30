var express = require('express');
var router = express.Router();


// https://github.com/apache/nano#dbdestroydocname-rev-callback
var nano = require('nano')('http://localhost:5984'),
    db = nano.use('auth-user');


router.post('/login', function (request, res, next) {

    var q = {
        selector: {
            username: {
                "$eq": request.body.username
            }
        }
    };

    db.find(q, function (error, body) {
        if (error) {
            res.status(404);
            res.write(JSON.stringify(error));
        }
        else {

            if (body.docs && body.docs.length == 1 && body.docs[0]) {
                var user = body.docs[0];

                if (request.body.password && user.password == request.body.password) {

                    user.session_id = request.sessionID;



                    var hour = 3600000;

                    request.session.cookie.expires = new Date(Date.now() + hour);

                    request.session.cookie.maxAge = hour;

                    request.session.user = user;



                    res.write(JSON.stringify(user));
                }
                else {
                    res.status(404);
                    res.write(JSON.stringify({message:'invliad auth'}));
                }
            }
            else {
                res.status(404);
                res.write(JSON.stringify({message:'invliad auth'}));
            }
        }

        res.end();
    });
});

module.exports = router;