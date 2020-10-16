const express = require('express');
const Blog = require('../models/blog');
const router = express.Router();

function createStringId(string) {
  const specialCharacters = ['?', '/', '-', '*', '&', '%', '#', '$', '@', '!', '[', ']', '{', '}', ',', '\\']
  let processedString = string;
  specialCharacters.forEach(char => {
    const regex = new RegExp('\\' + char, 'gi');
    processedString = processedString.replace(regex, '')
  });
  processedString = processedString.toLowerCase().replace(/\s+/g, '-')
  return processedString;
}

router.get('/', async (req, res) => {
  try {
    var blogs = await Blog.find().sort({ createdAt: 'desc' }).exec();
  } catch {
    blogs = [];
    var errorMessage = 'An error occured. Please try again later.';
  }
  res.render('blogs/index', { blogs, errorMessage, title: 'Bloggers - Home', user: req.user });

})

router.get('/create', (req, res) => {
  res.render('blogs/create', { title: 'Create a Blog', user: req.user });
})

router.post('/create', async (req, res) => {
  const { title, description, blog_body: body } = req.body
  const stringId = createStringId(title);
  const blog = new Blog({
    title,
    description,
    body,
    stringId
  });

  try {
    const newBlog = await blog.save();
    const link = newBlog.stringId;
    res.redirect(`/blogs/${newBlog._id}/${link}`);
  } catch (err) {
    console.error(err)
    res.render('blogs/create', { errorMessage: 'Error creating blog', title: 'Create a Blog - An error ocurred' })
  }
})

// view details
router.get('/:id/:title', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (blog == null) {
      res.render('404', { title: 'Bloggers - Blog Not Found' });
      return;
    };
    res.render('blogs/view', { blog, title: `View ${blog.title}`, user: req.user })
  } catch (err) {
    console.error(err);
  }
})


// update GET
router.get('/:id/:title/edit', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    let errorMessage;
    if (blog == null) {
      res.render('404')
      return;
    };
    res.render('blogs/edit', { errorMessage, blog, title: `Edit ${blog.title}`, user: req.user })
  } catch (err) {
    console.error(err)
  }
})

// update PUT
router.put('/:id/:title', async (req, res) => {
  try {
    let id = req.params.id;
    let stringId = req.params.title;
    const { title, description, blog_body: body } = req.body;
    if (!title || !description || !body) {
      res.redirect(`/blogs/${id}/${stringId}/edit`)
    } else {
      const blog = await Blog.findById(req.params.id);
      let newStringId = createStringId(title)
      blog.title = title;
      blog.description = description;
      blog.body = body;
      blog.stringId = newStringId;
      id = blog.id;
      stringId = blog.stringId;

      await blog.save();
      res.redirect(`/blogs/${id}/${stringId}`)
    }
  } catch (err) {
    console.error(err)
  }
})

router.delete('/:id/:title', async (req, res) => {
  try {
    var blog = await Blog.findById(req.params.id);
    blog.deleteOne();

    res.redirect('/')
  } catch (err) {
    console.error(err)
    // res.render(`/${blog.stringID}`, { errorMessage: 'Error deleting blog' })
  }
})


module.exports = router;