var redis = require('redis'),
    bcrypt = require('bcrypt'),
    db = redis.createClient();

module.exports = User;

function User(obj) {
  for (var key in obj)
    this[key] = obj[key]
}

User.prototype.save = function(fn) {
  if (this.id) {
    this.update(fn)
  }
  else {
    var self = this;
    db.incr('user:ids', function(err, id) {
      if (err) return fn(err)
      self.id = id
      self.hashPassword(function(err) {
        if (err) return fn(err)
        self.update(fn)
      })
    })
  }
}

User.prototype.update = function(fn) {
  db.set('user:id:' + this.name, this.id)
  console.log('save user: ' + JSON.stringify(this))
  db.hmset('user:' + this.id, this, fn)
}

User.prototype.hashPassword = function(fn) {
  var self = this
  bcrypt.genSalt(12, function(err, salt) {
    if (err) return fn(err)
    self.salt = salt
    bcrypt.hash(self.pass, salt, function(err, hash) {
      if (err) return fn(err)
      self.pass = hash;
      fn();
    })
  })
}


User.getByName = function(name, fn){
  User.getId(name, function(err, id){
    if (err) return fn(err);
    User.get(id, fn);
  });
};

User.getId = function(name, fn){
  db.get('user:id:' + name, fn);
};

User.get = function(id, fn){
  db.hgetall('user:' + id, function(err, user){
    if (err) return fn(err);
    fn(null, new User(user));
  });
};

User.authenticate = function(name, pass, fn){
  User.getByName(name, function(err, user){
    if (err) return fn(err);
    if (!user.id) return fn();

    bcrypt.hash(pass, user.salt, function(err, hash){
      if (err) return fn(err);
      if (hash == user.pass) return fn(null, user);
      fn();
    });
  });
};
