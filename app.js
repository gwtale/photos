
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , photos = require('./routes/photos')
  , login = require('./routes/login')
  , register = require('./routes/register')
  , Photo = require('./lib/photo')
  , page = require('./lib/middleware/page')
  , validate = require('./lib/middleware/validate');

var app = express();

var user = require('./lib/middleware/user');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('photos', __dirname + '/public/photos');
  app.use(require('./lib/messages'));
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('$2a$12$4BGC2oUfaygSkSbWVSOxz.'));
  app.use(express.cookieSession());
  app.use(user);
  app.use(app.router);

});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//app.get('/', photos.list);
app.get('/login', login.form);
app.post('/login', login.submit);
app.get('/logout', login.logout);
app.get('/register', register.form);
app.post('/register', register.submit);
app.get('/upload', photos.form);
app.post('/upload'
  , validate.required('photo[name]')
  , validate.lengthAbove('photo[name]', 4)
  , photos.submit(app.get('photos')));
app.get('/:page?', page(Photo.count), photos.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
