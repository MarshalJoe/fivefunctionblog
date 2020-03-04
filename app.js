const express = require('express');
const app = express();
const port = 3000;
const Blog = require('./Blog.js');
const BlogRoutes = require('express').Router();

BlogRoutes.use('/blog', [Blog]);

app.use(BlogRoutes);

app.get('/', (req, res) => res.send('Your very own index'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))