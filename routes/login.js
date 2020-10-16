const express = require('express');
const passport = require('passport')

const router = express.Router()

router.get('/', (req, res) => {
  res.render('account/login', { title: 'Login - Bloggers', user: req.user })
})

router.post('/', passport.authenticate('local', {
  successRedirect: '/account',
  failureRedirect: '/login',
  failureFlash: true
}));

module.exports = router;