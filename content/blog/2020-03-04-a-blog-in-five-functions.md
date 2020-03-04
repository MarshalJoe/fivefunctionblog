---
title: "A Blog in Five Functions"
date: 2020-03-03T16:56:18-05:00
description: The code behind our uber-minimalist blog. 
author: Joe Marshall
image: '/images/blog-homepage.png'
---

We had a few simple requirements when creating this blog.

We wanted it to:

- use flat files
- support basic metadata
- accept markdown-formatted posts
- [integrate into our main app](https://formcake.com/blog/why-we-chose-a-marketing-and-app-monorepo)

And finally, we wanted it as simple as we could make it.

If you'd like you can [skip ahead to the full code](https://formcake.com/a-blog-in-four-functions#complete). *SPOILER: We wrote five functions in our Node API to serve up a directory of YML-and-markdown blog post files*.

## Starting from Flat Files

We wanted to eliminate as much complexity as possible, so opted early for markdown files instead of a full database. There are definitely some tradeoffs but considering we only need limited metadata; make limited content updates; and don't need to integrate with any sort of commenting, liking, or other rating system - we could avoid the overhead of a complete DB, managed or not. We basically just wanted to serve up some good 'ol rich text and that allowed us to cut the knot and sidestep the whole thing.

There's a basic format to pretty much every markdown-powered static site generator content file - the kind used by Jekyll, Hugo, and Hexo. This is what it looks like (it's also the source for this actual blog post, `2020-03-04-a-blog-in-five-functions.md`). 

<pre><code class="language-js">---
title: "A Blog in Five Functions"
date: 2020-03-03T16:56:18-05:00
description: The code behind our uber-minimalist blog. 
author: Joe Marshall
image: '/images/blog-homepage.png'
---

We had a few simple requirements when creating our company blog - this one right here.
</code></pre>



Here's what the file looks looks like in the context of the larger repo:

<pre><code class="language-bash">/back # Our backend Node API + Lambda functions
    /api
        /blog
            /content
                /blog
                    2020-02-22-introducing-formcake.md
                    2020-02-22-our-first-purchase-was-our-app.md
                    2020-03-03-a-blog-in-five-functions.md
/front # Our frontend Nuxt app
</code></pre>

So we use our text editors (or Github if we'd like) to create the markdown file, then when we're ready commit and merge it into our file system using the exact same Git workflow as our normal development process.

To serve those files we have a `blogUtils.js` module which has our *four functions* that cover everything we need.

But first a few node modules. 

## Dependencies

At the top of our `blogUtils.js` file, we import everything:

<pre><code class="language-js">const path = require('path');
const fm = require('front-matter');
const marked = require('marked');
const promisifyFs = require('./promisifyFs.js');
const postsDir = path.normalize(__dirname + "/content/blog");
</code></pre>

- `path` to read the contents of our `content/blog` directory
- `fm` to read the frontmatter metadata in our post files
- `marked` to process the markdown
- `promisifyFs.js` - our own little addition, a wrapper to make reading files with `async / await` easier. More included in our function writeups below
- `postsDir` is where our posts live

## Function 1: Sorting Posts

The first function is a simple sorting utility:

<pre><code class="language-js">/*
    Sort posts based on the key supplied. Supports both descending and acsending order.
*/

const postSort = function (posts, key, order) {
    let sortFunction = order == "desc"
    ? (a, b) => { return b[key] - a[key] }
    : (a, b) => { return a[key] - b[key] };

    posts.sort(sortFunction);
    return posts;
};

module.exports.postSort = postSort;
</code></pre>

## Function 2: Listing Posts

Then we're going to need a function for listing post info - notice that when we return the mapped `post` objects, we're leaving out the actual parsed markdown content, since we're not displaying that on our blog index page. 

<pre><code class="language-js">/*
    Get the posts from the file system located at postsDir
*/

const getPosts = async function () {
    let postsFileNames = await promisifyFs.readdirAsync(postsDir);
    let posts = await Promise.all(postsFileNames.map(async fileName => {
        /*
            Grab the front matter data from each post for later use.
        */
        let postRawData = await promisifyFs.readFileAsync(postsDir + "/" + fileName, 'utf8');
        let postFMData = fm(postRawData);
        /*
            A blog post date is the first 3 parts of the dash separted post file name.
            Extract these into a string with a forward slash separator between the date parts.
            This is later converted into a javascript date using the Date class.
            Slashes are used because the Date class is funky.
            e.g. "2018-02-23 to 2018/02/23"
        */
        let date = new Date(fileName.split("-")
            .slice(0, 3)
            .toString()
            .replace(/-/g, '\/'));

        /*
            A blog post name is every part of the dash separted post file name except the first 3 parts which is the date.
            Strip out the date and .md from the file name but keep the dash separators between the file parts.
            This is used for locating the blog post within the system using findPostByPostName().
            e.g. "first-post"
        */
        let postName = fileName.split("-")
            .slice(3)
            .toString()
            .replace(/,/gi, "-")
            .split(".")[0];

        /*
            A blog post title is the post name but with the dashes stripped out and replaced with spaces with each part capitalized.
            e.g. "First Post"
        */
        let title = postFMData.attributes.title;

        return {
            title: title,
            description: postFMData.attributes.description,
            postName: postName,
            author: postFMData.attributes.author,
            image: postFMData.attributes.image,
            publishDate: date,
            fileName: fileName,
        };
    }));
    return posts;
};

module.exports.getPosts = getPosts;
</code></pre>

## Function 3: Getting Posts

Of course we'll need a way to return the individual post data. Relying on the `postFileName` as our primary identifier (which is the date + the article's slug / URI).

<pre><code class="language-js">const getPostData = async function(postFileName) {
    let postRawData = await promisifyFs.readFileAsync(postsDir + "/" + postFileName, 'utf8');
    let postFMData = fm(postRawData);
    let postData = { ...postFMData.attributes, content: marked(postFMData.body) };
    return postData;
}

module.exports.getPostData = getPostData;
</code></pre>

A couple of things to note here:

- we're using the spread operator (`...`) on the frontmatter `attributes` object to ensure everything in our YML frontmatter gets passed to the frontend
- we're using the `marked()` function to parse our HTML.

## Functions 4 & 5: Async Utility Wrappers

We'll also throw in a couple of simple utility functions to wrap our filesystem calls.

<pre><code class="language-js">const fs = require('fs');
const util = require('util');

/*
    Wrapping promise supported fs functions into async fs helper functions for easier async await syntax.
*/

const readFilePromise = util.promisify(fs.readFile);
const readdirPromise = util.promisify(fs.readdir);

module.exports.readFileAsync = async function readFileAsync(path, encoding) {
    return await readFilePromise(path, encoding);
}

module.exports.readdirAsync = async function readdir(path) {
    return await readdirPromise(path);
}
</code></pre>

## The Full blogUtils.js

So one more time, all together - this is what our final `blogUtils.js` file looks like:

<pre><code class="language-js">const fs = require('fs');
const path = require('path');
const fm = require('front-matter');
const marked = require('marked');
const promisifyFs = require('./promisifyFs.js');
const postsDir = path.normalize(__dirname + "/content/blog");

/*
    All helpers related to blogging.
*/

module.exports.postsDir = postsDir;

/*
    Sort posts based on the key supplied. Supports both descending and acsending order.
*/

const postSort = function (posts, key, order) {
    let sortFunction = order == "desc"
    ? (a, b) => { return b[key] - a[key] }
    : (a, b) => { return a[key] - b[key] };

    posts.sort(sortFunction);
    return posts;
};

module.exports.postSort = postSort;

/*
    Get the posts from the file system located at postsDir
*/

const getPosts = async function () {
    let postsFileNames = await promisifyFs.readdirAsync(postsDir);
    let posts = await Promise.all(postsFileNames.map(async fileName => {
        /*
            Grab the front matter data from each post for later use.
        */
        let postRawData = await promisifyFs.readFileAsync(postsDir + "/" + fileName, 'utf8');
        let postFMData = fm(postRawData);
        /*
            A blog post date is the first 3 parts of the dash separted post file name.
            Extract these into a string with a forward slash separator between the date parts.
            This is later converted into a javascript date using the Date class.
            Slashes are used because the Date class is funky.
            e.g. "2018-02-23 to 2018/02/23"
        */
        let date = new Date(fileName.split("-")
            .slice(0, 3)
            .toString()
            .replace(/-/g, '\/'));

        /*
            A blog post name is ever part of the dash separted post file name except the first 3 parts which is the date.
            Strip out the date and .md from the file name but keep the dash separators between the file parts.
            This is used for locating the blog post within the system using findPostByPostName().
            e.g. "first-post"
        */
        let postName = fileName.split("-")
            .slice(3)
            .toString()
            .replace(/,/gi, "-")
            .split(".")[0];

        /*
            A blog post title is the post name but with the dashes stripped out and replaced with spaces with each part capitalized.
            e.g. "First Post"
        */
        let title = postFMData.attributes.title;

        return {
            title: title,
            description: postFMData.attributes.description,
            postName: postName,
            author: postFMData.attributes.author,
            image: postFMData.attributes.image,
            publishDate: date,
            fileName: fileName,
        };
    }));
    return posts;
};

module.exports.getPosts = getPosts;

const getPostData = async function(postFileName) {
    let postRawData = await promisifyFs.readFileAsync(postsDir + "/" + postFileName, 'utf8');
    let postFMData = fm(postRawData);
    let postData = { ...postFMData.attributes, content: marked(postFMData.body) };
    return postData;
}

module.exports.getPostData = getPostData;
</code></pre>

## Adding Routes

So now we have our full `blogUtils.js` file, we can add it to the `Blog.js` express routes we're using to serve our content. 

<pre><code class="language-js">const Blog = require('express').Router();
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
</code></pre>

## Ending with the Front(end)

So this is designed to be the blog engine serving the content for our Nuxt app (which is already consuming the application API) - and it is. In `pages` we have a `blog` subdirectory where the blog index and individual view page components exist, building off of a common component library shared between the principal application and blog code. 

<pre><code class="language-bash">/blog
    /_postname
        index.vue
    index.vue</code></pre>

But if we wanted this to be truly standalone, all we would have to do is replace returning JSON data with using an Express-friendly templating engine like Mustache, EJS, or Pug.

Below is a quick example of how we might tweak the blog index page to - instead of responding with JSON - return an `index.pug` template, with the variables populated by the result of our `getPosts()` function.

<pre><code class="language-js">Blog.get('/', async (req, res) => {
    try {
        let postFiles = await blogUtils.getPosts();
        postFiles = await blogUtils.postSort(postFiles, "publishDate", "desc");
        res.render('index', postFiles);
    } catch (e) {
        res.status(400);
    }
});
</code></pre>