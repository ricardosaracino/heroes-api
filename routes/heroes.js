var express = require('express');
var router = express.Router();

//http://github.com/felixge/node-couchdb
var couchdb = require('../node_modules/felix-couchdb/lib/couchdb'),
	client = couchdb.createClient(5984, 'localhost'),
	db = client.db('heroes');


router.get('/heroes', function (request, res, next) {
	db.allDocs({'type': 'heroes'}, function (error, doc) {
		if (error) {
			res.write(JSON.stringify(error));
		}
		else {
			res.write(JSON.stringify(doc));
		}

		res.end();
	});
});


router.get('/hero/:id', function (request, res, next) {

	db.getDoc(request.params.id, function (error, doc) {
		if (error) {
			res.write(JSON.stringify(error));
		}
		else {
			res.write(JSON.stringify(doc));
		}

		res.end();
	});
});


module.exports = router;
