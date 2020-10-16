const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');

module.exports = function (passport) {
  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user)
    })
  });
}

async function authenticateUser(email, password, done) {
  const user = await User.findOne({ email: email });
  if (user == null) {
    return done(null, false, { message: 'No user with this email' });
  }

  bcrypt.compare(password, user.password, (err, same) => {
    if (err) {
      return done(err);
    }

    if (same) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Incorrect Password' });
    }
  })
} 