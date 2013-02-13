var express = require('express')
  , res = express.response;

res.message = function(msg, type){
  type = type || 'info';
  this.req.session.messages = this.req.session.messages || [];
  this.req.session.messages.push({ type: type, string: msg });
  return this;
};

res.error = function(msg){
  return this.message(msg, 'error');
};

module.exports = function(req, res, next){
  res.locals.messages = req.session.messages || [];
  res.locals.removeMessages = function(){
    req.session.messages = [];
  };
  next();
};