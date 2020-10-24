function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login')
}


function isNotAutheticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/account')
  }

  next();
}

module.exports = {
  isAuthenticated,
  isNotAutheticated
}