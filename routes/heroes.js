var express = require('express');
var router = express.Router();


// https://github.com/apache/nano#dbdestroydocname-rev-callback
var nano = require('nano')('http://localhost:5984'),
	db = nano.use('heroes');


function requireRole(params) {


	return function (req, res, next) {
        next();
return;

		if (req.session) {

			if (req.session.views) {
				req.session.views++;
			} else {
				req.session.views = 1;
			}

			if (params.role && req.session.user && req.session.user.roles.indexOf(params.role) != -1) {
				next();
			} else {

				if (!req.session.user) {
					res.send(401); // unauthorized
				}
				else {
					res.send(403); // forbidden
				}
			}
		}
		else if (params.role) {
			res.send(401); // unauthorized ?
		}
	}
}


function herofy(heroDoc) {
	return {
		id: heroDoc._id,
		name: heroDoc.name,
		age: heroDoc.age,
		created: heroDoc.created_ts,
		updated: heroDoc.updated_ts,
		author: heroDoc.created_by,

		_id: heroDoc._id,
		_rev: heroDoc._rev
	};
};


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

router.get('/', requireRole({role: 'user'}), function (request, res, next) {

	var q = {
		selector: {
			type: {
				'$eq': 'hero'
			}
		}
	};

	db.find(q, function (error, heroDoc) {
		if (error) {
			res.status(400);
			res.write(JSON.stringify(error));
		}
		else {


			// map recurslively

			res.write(JSON.stringify(heroDoc.docs.map(herofy)));
		}
		res.end();
	});
});

router.get('/:id', requireRole({role: 'user'}), function (request, res) {

	db.get(request.params.id, function (error, heroDoc) {
		if (error) {
			res.status(400);
			// TODO this has way to much information
			res.write(JSON.stringify(error));
		}
		else {
			res.write(JSON.stringify(herofy(heroDoc)));
		}
		res.end();
	});
});

router.post('/', requireRole({role: 'user'}), function (request, res) {

	request.body.type = 'hero';
	request.body.created_ts = new Date().getTime();


	//request.body.created_by = request.session.user._id


	db.insert(request.body, function (error, body) {
		if (error) {
			res.status(400);
			res.write(JSON.stringify(error));
			res.end();
		}
		else {
			// body contains id, rev, ok
			db.get(body.id, function (error, heroDoc) {
				if (error) {
					res.status(400);
					res.write(JSON.stringify(error));
				}
				else {
					res.write(JSON.stringify(herofy(heroDoc)));
				}
				res.end();
			});
		}
	});
});

router.put('/', requireRole({role: 'user'}), function (request, res) {

	request.body.type = 'hero';
	request.body.updated_ts = new Date().getTime();
	// request.body.updated_by = request.session.user._id;

	request.body._id = request.body.id;

	db.insert(request.body, function (error, doc) {
		if (error) {
			res.status(400);
			res.write(JSON.stringify(error)); // todo this is not sent
			res.end();
		}
		else {
			// body contains id, rev, ok
			db.get(doc.id, function (error, heroDoc) {
				if (error) {
					res.status(400);
					res.write(JSON.stringify(error));
				}
				else {
					res.write(JSON.stringify(herofy(heroDoc)));
				}
				res.end();
			})
		}
	});
});

router.delete('/', requireRole({role: 'user'}), function (request, res) {
	db.destroy(request.body._id, request.body._rev, function (error, body) {
		if (error) {
			res.status(400);
			res.write(JSON.stringify(error));
		}
		else {
			res.write(JSON.stringify(body));
		}
		res.end();
	});
});

module.exports = router;