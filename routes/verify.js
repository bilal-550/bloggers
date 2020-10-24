const express = require('express');
const isAutheticated = require('../config/auth').isAuthenticated;
const sendMail = require('../config/mail');
const User = require('../models/user');


const router = express.Router();

router.use(isAutheticated)

router.get('/', (req, res) => {
  const token = req.query.token;
  if (token !== req.user.emailToken || req.user.verified) {
    res.render('account/verify', { title: 'Verify Your Account', user: req.user, invalidToken: true });
    return;
  }

  res.render('account/verify', { title: 'Verify Your Account', user: req.user });
})

router.post('/', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.verified = true;
    await user.save();
    res.redirect('/account');
  } catch (err) {
    console.error(err);
    res.redirect('/account');
  }

})

router.post('/send', (req, res) => {
  const { name, email, emailToken } = req.user;
  const msg = {
    from: 'Bloggers <no-reply@bilalhamed.com>',
    to: email,
    subject: 'Verify Your Account - Bloggers',
    text: `Hi ${name}, Please open the following link to verify your account. \n ${req.protocol}://${req.hostname}:3000/verify?token=${emailToken}`,
    html: `<h1>Hi, ${name}</h1><h2>Please click the following link to verify your account</h2><h3><a href="${req.protocol}://${req.hostname}:3000/verify?token=${emailToken}">Verify Now</a></h3>`
  }

  sendMail(msg);
})

module.exports = router