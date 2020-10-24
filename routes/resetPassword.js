'use strict';
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const sendMail = require('../config/mail');
const Token = require('../models/token');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

router.get('/', resetPassword, (req, res) => {
  res.render('account/resetPassword.ejs', { title: 'Reset Password - Bloggers', user: req.user });
})

router.post('/', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user == null) {
    return res.json({ sent: false, message: 'No user with that email.' })
  } else {
    const { email, name, _id } = user;
    await Token.deleteOne({ for_id: _id });
    const newToken = new Token({
      token: crypto.randomBytes(24).toString('hex'),
      for: email,
      for_id: _id
    })

    await newToken.save();
    user.passwordToken = newToken.token;
    await user.save();
    let passwordToken = user.passwordToken;
    const msg = {
      to: email, // from automatically set by `../config/mail.js`
      subject: 'Reset Password - Bloggers',
      text: `Hello ${name}, \n \n Open the following link to reset your password:\nhttp://localhost:3000/reset-password?token=${passwordToken}`,
      html: `<h1>Hello ${name},</h1> <br> <p style="font-size: 24px">Click the <span style="color:red">following</span> link to reset your password:</p> <br> <a href="http://localhost:3000/reset-password?token=${passwordToken}">This link</a>`
    }
    try {
      // console.log(req.body.email)
      res.json({ sent: true, message: `Email sent to ${email}` })
      res.status(200);
      sendMail(msg);
    } catch {
      res.json({ sent: false, message: 'An error ocurred. Please try again later.' })
      res.status(500)
    }
  }
})

router.put('/', async (req, res) => {
  const token = await Token.findById(req.body.token);
  const errorRedirect = (err) => {
    req.flash('error', err);
    return res.redirect(`/reset-password?token=${token.token}`);
  }
  const { newPassword } = req.body;
  try {
    const user = await User.findById(req.body.tokenFor);
    const samePasswords = await bcrypt.compare(newPassword, user.password);
    console.log(samePasswords)
    if (samePasswords) {
      errorRedirect('New password is the same as old password');
      return;
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    token.token = crypto.randomBytes(24).toString('hex');
    await token.save();
    await user.save();
    req.flash('success', 'Successfully reset password');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error resetting password');
    res.redirect(`/reset-password?token=${req.body.token}`);
  }

})

async function resetPassword(req, res, next) {
  const queryToken = req.query.token;
  if (!queryToken) {
    return next();
  }
  const token = await Token.findOne({ token: queryToken });
  if (token == null) {
    return res.render('account/resetPassword', { title: 'Reset Password - Bloggers', user: req.user, invalidToken: true })
  }

  res.render('account/reset-passwordForm.ejs', { title: 'Reset Password - Bloggers', user: req.user, action: '/reset-password?_method=PUT', token: token._id, tokenFor: token.for_id, displayOldPassword: false });
}

module.exports = router