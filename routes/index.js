var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res) {
  res.render("home", {
    title: "Home"
  });
});

/*
app.get('/u/:user', routes.user);
app.post('/post', routes.post);
app.get('/reg', routes.reg);
app.post('/reg' routes.doReg);
app.get('/login', routes.login);
app.post('/login', routes.doLogin);
app.get('/logout', routes.logout);
*/

router.get('/u/:user', function(req, res) {
  res.send("User " + req.params.user);
});

router.post('/post', function(req, res) {
  res.send(req.path + ' post request received');
});

router.get("/reg", checkNotLogin);
router.get('/reg', function(req, res) {
  res.render("reg", {
    title: "User Registration"
  });
});

router.post("/reg", checkNotLogin);
router.post('/reg', function(req, res) {
  console.log("post reg is called");
  if (req.body['pwd-repeat'] !== req.body['pwd']) {
    req.flash('error', 'Passwords are not the same');
    return res.redirect('/reg');
  }
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.pwd).digest('base64');

  var newUser = new User({
    name: req.body.username,
    password: password
  });

  User.get(newUser.name, function(err, user) {
    if (user) {
      err = "Username already exists";
      req.flash("error", err);
      console.log('Username already exist');
      //return res.redirect('/login');
    }
    if (err) {
      if (user) {
        return res.redirect("/login");
      }
      req.flash('error', err);
      return res.redirect('/reg');
    }

    newUser.save(function(err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/reg');
      }
      console.log("user is saved");
      req.session.user = newUser;
      req.flash('success', 'Registration Successful');
      res.redirect('/');
    });
  })
});

router.get("/login", checkNotLogin);
router.get('/login', function(req, res) {
  res.render("login", {
    title: "User Login"
  })
});

router.post("/login", checkNotLogin);
router.post('/login', function(req, res) {
  var md5 = crypto.createHash("md5");
  var password = md5.update(req.body.pwd).digest("base64");

  User.get(req.body.username, function(err, user) {
    if (!user) {
      req.flash('error', "Username " + req.body.username + " doesn't exist");
      return res.redirect('/login');
    }
    if (user.password !== password) {
      req.flash("error", "password is not correct, please retry");
      return res.redirect("/login");
    }
    req.session.user = user;
    req.flash("success", "login Successful");
    res.redirect("/");
  });
});

router.get("/logout", checkLogin);
router.get('/logout', function(req, res) {
  req.session.user = null;
  req.flash("success", "log out Successful");
  res.redirect("/");
})

function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash("error", "user not logged in");
    return res.redirect("/login");
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash("error", "user has already logged in");
    return res.redirect("./");
  }
  next();
}

module.exports = router;
