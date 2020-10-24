const express = require('express');
const validator = require('validator').default;
const bcrypt = require('bcrypt');
const User = require('../models/user');
const crypto = require('crypto');
const passport = require('passport')
const isNotAutheticated = require('../config/auth').isNotAutheticated

const router = express.Router()
router.use(isNotAutheticated)


router.get('/', (req, res) => {
  res.render('account/signup', { title: 'Signup - Bloggers', user: req.user })
})

router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  const values = {
    name,
    email,
    password
  }
  if (!validate(name, email, password)) {
    res.redirect('/signup')
    return;
  }

  try {
    const sameEmailUsers = await User.find({ email })

    if (sameEmailUsers.length > 0) {
      res.render('account/signup', { title: 'Signup - Bloggers', values, user: req.user, error: 'A user with this email is already registered.' });
      return;
    }

    const sameNameUsers = await User.find({ name: { $regex: new RegExp(name, 'i'), $eq: name } });
    console.log(sameNameUsers);
    if (sameNameUsers.length > 0) {
      res.render('account/signup', { title: 'Signup - Bloggers', values, user: req.user, error: 'A user with the same name is already registered.' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      emailToken: crypto.randomBytes(24).toString('hex'),
      passwordToken: crypto.randomBytes(24).toString('hex')
    })

    await newUser.save();

    req.login(newUser, (err) => {
      if (!err) return res.redirect('/account');
      req.flash('error', 'Error logging in. Please log in automatically');
      res.redirect('/login');
    })
  } catch (err) {
    console.error(err);
    req.flash('error', 'Couldn\'t create account. Please try again later.')
    res.redirect('/signup')
  }


})

function validate(name, email, password) {
  if (isEmpty(name) || isEmpty(email) || isEmpty(password)) return false;
  else if (!validator.isLength(name, { min: 8, max: 40 })) return false;
  else if (!validator.isEmail(email)) return false;
  else if (!validator.isLength(password, { min: 6, max: 40 })) return false;
  else return true
}

function isEmpty(string = '') {
  return validator.isEmpty(string, { ignore_whitespace: true })
}


module.exports = router;