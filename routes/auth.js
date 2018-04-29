var express = require('express');
var router = express.Router();


// https://github.com/apache/nano#dbdestroydocname-rev-callback
var nano = require('nano')('http://localhost:5984'),
	db = nano.use('users');


router.get('/login', function (request, res, next) {

	request.param('username');

	var q = {
		selector: {
			username: {
				"$eq": request.param('username')
			}
			use_index:
		}
	};

	db.find(q, function (error, body) {
		if (error) {
			res.status(404);
			res.write(JSON.stringify(error));
		}
		else {

			if(body.docs && body.docs.length == 1 && body.docs[0].password)
			{
				body.docs[0].password
			}

			res.write(JSON.stringify());
		}
		res.end();
	});
});

module.exports = router;