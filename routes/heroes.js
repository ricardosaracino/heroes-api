var express = require('express');
var router = express.Router();


var nano = require('nano')('http://localhost:5984'),
	db = nano.use('heroes');





function requireRole (role) {

	return function (req, res, next) {
		if (req.session && req.session.user && req.session.user.role === role) {
			next();
		} else {
			res.send(403);
		}
	}
}



/*
http://...com/posts/create- POST request  -> Goes to posts.create() method in the server
http://...com/posts/1/show- GET request  -> Goes to posts.show(1) method in the server
http://...com/posts/1/delete - POST request  -> Goes to posts.delete(1) method in the server
http://...com/posts/1/edit- POST request  -> Goes to posts.edit(1) method in the server


http://...com/posts - POST request  -> Goes to posts.create() method in the server
http://...com/posts/1 - GET request  -> Goes to posts.show(1) method in the server
http://...com/posts/1 - DELETE request  -> Goes to posts.delete(1) method in the server
http://...com/posts/1 - PUT request  -> Goes to posts.edit(1) method in the server


http://...com/posts - GET request  -> Goes to posts.all() method in the server
http://...com/posts/1 - GET request  -> Goes to posts.show(1) method in the server


http://...com/posts - POST request  -> Goes to posts.create() method in the server
http://...com/posts - POST request  -> Goes to posts.edit() method in the server
http://...com/posts/1 - POST request  -> Goes to posts.delete(1) method in the server
*/


// https://expressjs.com/en/4x/api.html





router.get('/', function (request, res, next) {

	var q = {
		selector: {
			type: {
				"$eq": "hero"
			}
		}
	};

	db.find(q, function (error, body) {
		if (error) {
			res.write(JSON.stringify(error));
		}
		else {
			res.write(JSON.stringify(body));
		}
		res.end();
	});
});



router.get('/:id', function (request, res) {
	db.get(request.params.id, function (error, body) {
		if (error) {
			res.write(JSON.stringify(error));
		}
		else {
			res.write(JSON.stringify(body));
		}
		res.end();
	});
});



router.post('/', requireRole('user'), function (request, res) {

	request.body.type = 'hero';

	db.insert(request.body, function (error, body) {
		if (error) {
			res.write(JSON.stringify(error));
		}
		else {
			res.write(JSON.stringify(body));
		}
		res.end();
	});
});


router.post('/:id', function (request, res) {

	request.body.type = "hero";

	db.insert(request.body, function (error, body) {
		if (error) {
			res.write(JSON.stringify(error));
		}
		else {
			res.write(JSON.stringify(body));
		}
		res.end();
	});
});


module.exports = router;