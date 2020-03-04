# Creating a Blog Post

To create a post, follow these steps.

## 1. Create your post file

Create it in `/content/blog`. You'll name it using the following convention:

```
YYYY-MM-DD-title-of-post.md
```

Where the date is the date you're posting and the `title-of-post` is, well, the post's title / URI slug. (e.g. `/blog/title-of-post`).

This means that you *should not change the post title* after publishing it, since doing so will break all the links to that article.

## 2. Add the metadata

Then you'll add your post's metadata. We use YAML frontmatter at the beginning of every post `md` file for this purpose.

Your frontmatter should look like this:

```
---
title: "Introducing Formcake"
date: 2019-03-24T00:56:18-05:00
description: A backend form API for devs - no server-side coding required. 
author: Joe Marshall
image: '/images/formcake-homepage.png'
---
```

The `image` path is the path to the public image *in the frontend's `static` folder*.

If you can't find a suitable image, you're free to use the one above, which is our default splash picture of a cake, but don't overdo it - we don't want every header image to be our default.

## 3. Add your content

After that frontmatter, leave an empty line, then write you markdown. We use the Github flavor of markdown. Keep in mind that all image links will look like this: `[my alt text](/images/imagefilename.png)`.

## 4. Publish!

After you've written and edited your post, deploy it to your environment of choice!