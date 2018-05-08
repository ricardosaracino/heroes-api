var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var session = require('express-session');
var FileStore = require('session-file-store')(session);


var authRouter = require('./routes/auth');
var heroesRouter = require('./routes/heroes');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var sess = {
    store: new FileStore(),
    secret: 'super-secret',
    resave: true,
    saveUninitialized: true,
    cookie: {}
};

if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // trust first proxy
    sess.cookie.secure = true; // serve secure cookies
}

app.use(session(sess));

//https://stackoverflow.com/questions/7067966/how-to-allow-cors#21622564
//http://50linesofco.de/post/2017-03-06-cors-a-guided-tour
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, *');

    next();
});

app.use('/authenticate', authRouter);
app.use('/heroes', heroesRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

app.set('port', process.env.PORT || 8030);

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);

    console.log(err);

    res.write(JSON.stringify({'error': err.message}));

    res.end();
});

var server = app.listen(app.get('port'), function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('API app listening at http://%s:%s', host, port);
});

module.exports = app;