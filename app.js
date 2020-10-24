if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}

const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const app = express();
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const passportInit = require('./config/passport');

passportInit(passport);

const DATABASE_URI = process.env.DATABASE_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout')
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }))
app.use(expressLayouts);
app.use(methodOverride('_method'));

app.use(session({
  secret: SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}))

app.use(flash());
app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next()
})

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect(DATABASE_URI, {
  useNewUrlParser: true, useUnifiedTopology: true
})
const db = mongoose.connection;

db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to mongoDB'))

app.use(express.json())
app.use('/', require('./routes/index'));
app.use('/about', require('./routes/about'));
app.use('/blogs', require('./routes/blogs'));
app.use('/account', require('./routes/account'));
app.use('/login', require('./routes/login'));
app.use('/signup', require('./routes/signup'));
app.use('/account', require('./routes/account'));
app.use('/verify', require('./routes/verify'));
app.use('/reset-password', require('./routes/resetPassword'));

app.post('/fetch', (req, res) => {
  res.json({ email: req.body.email })
})

app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found - Bloggers', centered: true, user: req.user })
})

app.listen(3000)