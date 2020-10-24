const express = require('express');
const isAuthenticated = require('../config/auth').isAuthenticated;
const User = require('../models/user');
const crypto = require('crypto');
const sendMail = require('../config/mail');
const bcrypt = require('bcrypt');
const { default: { isLength } } = require('validator')

const router = express.Router();


router.get('/', isAuthenticated, (req, res) => {
  res.render('account/account', { title: 'My Account - Bloggers', user: req.user, stylesheets: ['/styles/account.css'] })
})

router.get('/edit', isAuthenticated, (req, res) => {
  const { name, email } = req.user;
  const values = { name, email };
  res.render('account/edit', { title: 'Edit Account - Bloggers', user: req.user, values, stylesheets: ['/styles/account.css'] })
})

router.put('/', isAuthenticated, async (req, res) => {
  const { name, email } = req.body;
  const values = { name, email };
  try {
    const user = await User.findById(req.user._id);

    if (!email === req.user.email) {
      const sameEmailUsers = await User.find({ email })
      if (sameEmailUsers.length > 0) {
        res.render('account/edit', { title: 'Edit Account - Bloggers', user: req.user, values, error: 'A user with this email is already registered.', stylesheets: ['/styles/account.css'] });
        return;
      }
    }

    user.name = name;
    if (email !== user.email) {
      user.email = email;
      user.verified = false;
      user.emailToken = crypto.randomBytes(24).toString('hex');
    }


    await user.save();

    res.redirect('/account');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Couldn\'t edit account. Please try again later.')
    res.redirect('/account');
  }
})

router.get('/reset-password', isAuthenticated, (req, res) => {
  const token = req.query.token;
  if (token !== req.user.passwordToken) {
    res.render('account/verify', { title: 'Invalid Token - Bloggers', user: req.user, invalidToken: true });
    return;
  }

  res.render('account/reset-passwordForm', { title: 'Reset Password - Bloggers', user: req.user, action: '/account/reset-password?_method=PUT' })
})

router.put('/reset-password', isAuthenticated, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);

    bcrypt.compare(oldPassword, user.password, (err, same) => {
      if (err) {
        throw error;
      } else if (!same) {
        res.render('account/reset-passwordForm', { title: 'Reset Password - Bloggers', user: req.user, error: 'Old password is incorrect' });
        res.end();
      }
    });

    if (!isLength(newPassword, { min: 6, max: 40 })) {
      res.render('account/reset-passwordForm', { title: 'Reset Password - Bloggers', user: req.user, error: 'New Password must be between 6 and 40 characters.' });
      res.end();
    }

    bcrypt.compare(newPassword, user.password, (err, same) => {
      if (err) {
        throw error;
      } else if (same) {
        res.render('account/reset-passwordForm', { title: 'Reset Password - Bloggers', user: req.user, error: 'New password is the same as old password' });
        res.end();
      }
    });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordToken = crypto.randomBytes(24).toString('hex');
    await user.save();
    res.redirect('/account');

  } catch (err) {
    console.error(err);
    res.redirect('/account/edit');
  }

})

// send mail
router.post('/reset-password', isAuthenticated, (req, res) => {
  const { email, passwordToken, name } = req.user
  const msg = {
    to: email, // from automatically set by `../config/mail.js`
    subject: 'Reset Password - Bloggers',
    text: `Hello ${name}, \n \n Open the following link to reset your password:\nhttp://localhost:3000/account/reset-passwordForm?token=${passwordToken}`,
    html: `<h1>Hello ${name},</h1> <br>\n <p style="font-size: 24px">Click the <span style="color:red">following</span> link to reset your password:</p> <br> <a href="http://localhost:3000/account/reset-passwordForm?token=${passwordToken}">This link</a>`
  }
  try {
    res.status(200);
    sendMail(msg);
  } catch {
    res.status(500)
  }
  res.end();
})

router.delete('/', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.redirect('/');
  } catch (err) {
    console.error(err);
  }
})

router.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
})

module.exports = router;