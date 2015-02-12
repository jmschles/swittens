// setup
var express = require('express');
var app = express();

var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var http = require('http');

// secret-fetching
var secrets = require('./secrets.json');
var mongoUser = secrets.modulus.username;
var mongoPass = secrets.modulus.password;
var flickrKey = secrets.flickr.api_key;
var flickrSecret = secrets.flickr.secret;

// configuration
var Flickr = require('flickrapi'),
    flickrOptions = {
      api_key: flickrKey,
      secret: flickrSecret
    };
var mongoUrl = 'mongodb://' + mongoUser + ':' + mongoPass + '@proximus.modulusmongo.net:27017/avoVob3i';
mongoose.connect(mongoUrl);
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// listen
var port = 8080;
app.listen(port);
console.log('App listening on port ' + port + '...');

// models
var Quote = mongoose.model('Quote', {
  text : String
});
var Kitten = mongoose.model('Kitten', {
  url : String
});

for(var i = 0; i < 5; i++) {
  http.get('http://ron-swanson-quotes.herokuapp.com/quotes', function(rsp) {
    var body = '';
    rsp.on('data', function(d) {
      body += d;
    });
    rsp.on('end', function() {
      var quote = JSON.parse(body).quote;
      Quote.create({
        text: quote
      }, function(err, q) {
        if(err) { console.log(err); }
      }); 
    });
  });
}

// api
app.get('/api/quote', function(req, res) {
  var quote = '';
  http.get('http://ron-swanson-quotes.herokuapp.com/quotes', function(rsp) {
    rsp.on("data", function(chunk) {
      console.log("BODY: " + chunk);
    });
  });
  res.json(quote);
});

app.get('/api/kittens', function(req, res) {
  var kitten;
  Flickr.tokenOnly(flickrOptions, function(error, flickr) {
    flickr.photos.search({
      text: 'kitten',
      page: 1,
      per_page: 5
    }, function(err, result) {
      if(err) { throw new Error(err); }
      res.json(result.photos.photo);
    });
  });
});

// application
app.get('*', function(req, res) {
  res.sendfile('./public/index.html');
});
