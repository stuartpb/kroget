var express = require('express');

module.exports = function appCtor(cfg) {
  var app = express();

  app.use(express.static(__dirname + '/static'));
  app.get('/', function(req,res,next){
    res.render('index.jade');
  });

  return app;
};
