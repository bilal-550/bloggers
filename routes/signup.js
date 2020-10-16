const express = require('express');
const validator = require('validator').default;
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router()

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

    console.log(`Length: ${sameEmailUsers.length}`)
    if (sameEmailUsers.length > 0) {
      req.flash('error', 'A user with this email is already registered.')
      res.render('account/signup', { title: 'Signup - Bloggers', values });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    })

    await newUser.save();
    req.flash('success', 'Successfully created account! Please login to continue');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
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