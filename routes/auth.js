var express = require('express');
var router = express.Router();


// https://github.com/apache/nano#dbdestroydocname-rev-callback
var nano = require('nano')('http://localhost:5984'),
	db = nano.use('auth-user');


router.post('/login', function (request, res, next) {

	// todo harden
	const username = request.body.username;
	const password = request.body.password;

	var q = {
		selector: {
			username: {
				"$eq": username
			}
		}
	};

	db.find(q, function (error, body) {
		if (error) {
			res.status(404);
			res.write(JSON.stringify(error));
		}
		else {
			if(body.docs && body.docs.length == 1 && body.docs[0].password == password)
			{
				// add user to session (contains roles)
				request.session.user = body.docs[0];

				res.write(JSON.stringify(request.session.user));
			}
			else{
				res.send(401); // unauthorized
			}
		}

		res.end();
	});
});

module.exports = router;