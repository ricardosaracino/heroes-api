var express = require('express');
var router = express.Router();


// https://github.com/apache/nano#dbdestroydocname-rev-callback
var nano = require('nano')('http://localhost:5984'),
	db = nano.use('heroes');


function requireRole(role) {

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
			res.status(404);
			res.write(JSON.stringify(error));
		}
		else {
			res.write(JSON.stringify(body.docs));
		}
		res.end();
	});
});

router.get('/:id', function (request, res) {
	db.get(request.params.id, function (error, body) {
		if (error) {
			res.status(404);
			res.write(JSON.stringify(error));
		}
		else {
			res.write(JSON.stringify(body));
		}
		res.end();
	});
});

router.post('/', function (request, res) {

	request.body.type = 'hero';
	request.body.created = new Date().getTime();

	db.insert(request.body, function (error, body) {
		if (error) {
			res.status(404);
			res.write(JSON.stringify(error));
			res.end();
		}
		else {
			// body contains id, rev, ok
			db.get(body.id, function (error, body) {
				if (error) {
					res.status(404);
					res.write(JSON.stringify(error));
				}
				else {
					res.write(JSON.stringify(body));
				}
				res.end();
			});
		}
	});
});

router.put('/', function (request, res) {

	request.body.type = 'hero';
	request.body.updated = new Date().getTime();

	db.insert(request.body, function (error, body) {
		if (error) {
			res.status(404);
			res.write(JSON.stringify(error));
			res.end();
		}
		else {
			// body contains id, rev, ok
			db.get(body.id, function (error, body) {
				if (error) {
					res.status(404);
					res.write(JSON.stringify(error));
				}
				else {
					res.write(JSON.stringify(body));
				}
				res.end();
			})
		}
	});
});

router.delete('/', function (request, res) {
	db.destroy(request.body._id, request.body._rev, function (error, body) {
		if (error) {
			res.status(404);
			res.write(JSON.stringify(error));
		}
		else {
			res.write(JSON.stringify(body));
		}
		res.end();
	});
});

module.exports = router;