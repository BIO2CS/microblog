var mongodb = require('./db');

function User(user) {
  this.name = user.name;
  this.password = user.password;
}


User.prototype.save = function(callback) {
  var user = {
    name: this.name,
    password: this.password
  };

  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    //not safe mode, err !== null;
    //http://mongodb.github.io/node-mongodb-native/api-generated/db.html#collection
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.ensureIndex('name', {unique: true});
      collection.insert(user, {safe: true}, function(err, uer) {
        mongodb.close();
        callback(err, user);
      });
    });
  });
}

User.get = function(username, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.findOne({name: username}, function(err, doc) {
        mongodb.close();
        if (doc) {
          var user = new User(doc);
          callback(err, user);
        }
        else {
          callback(err);
        }
      })
    })
  });
}

module.exports = User;
