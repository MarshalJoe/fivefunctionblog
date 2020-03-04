const Blog = require('express').Router();
const blogUtils = require('./blogUtils.js');

Blog.get('/', async (req, res) => {
    try {
        let postFiles = await blogUtils.getPosts();
        postFiles = await blogUtils.postSort(postFiles, "publishDate", "desc");
        res.status(200).json(postFiles);
    } catch (e) {
        res.status(400);
    }
});

Blog.get('/:postName', async (req, res) => {
    let data = undefined;
    let postName = req.params.postName;
    try {
        let postFiles = await blogUtils.getPosts();
        let post = postFiles.find(post => post["postName"] == postName);
        let postData = await blogUtils.getPostData(post.fileName);
        res.status(200).json(postData);
    } catch (e) {
        res.status(400);
    }
});

module.exports = Blog;