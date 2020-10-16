const express = require('express');


const router = express.Router()

router.use(isAuthenticated);

router.get('/', (req, res) => {
  res.render('account/account', { title: 'My Account - Bloggers', user: req.user })
})

router.get('/edit', (req, res) => {
  const { name, email, password } = req.user;
  const values = { name, email, password };
  res.render('account/edit', { title: 'Edit Account - Bloggers', user: req.user, values })
})

router.post('/edit', (req, res) => {
  const { name, email } = req.body;
})

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login')
}

router.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
})

module.exports = router;