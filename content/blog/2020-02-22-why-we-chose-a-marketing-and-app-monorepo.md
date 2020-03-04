---
title: "Why We Chose a Marketing and Application Monorepo"
date: 2020-02-22T16:56:18-05:00
description: One repo to rule them all...
author: Joe Marshall
image: '/images/code-background.jpg'
---

We just launched [formcake](https://formcake.com/blog/introducing-formcake) (🎉!) with a marketing and application monorepo. That means all frontend and backend services, for both martech and application services, are represented in a single repo that looks like this.

<pre><code class="lang-bash">/back
/front
</code></pre>

With all individual services falling into one of those two buckets.

We thought we'd write about our reasoning - why use a monorepo (though admittedly a tiny one), and why not split our marketing off into Wordpress (OK) or a JAM-stack powered static site (better)?

## Our Setup

We use [Nuxt](https://nuxtjs.org/) in Server-Side Rendering (SSR) mode for our frontend, then an Express-powered Node API server, for our backend, employing Postgres as our persistence layer. This is all hosted in AWS, where we also take advantage of some serverless patterns: Within `/back` we have a `/functions` directory for our Lambdas that feed off an SQS queue. While most of our interactions stop at the Postgres level, triggering form actions feeds an SQS queue consumed by Lambdas responsible for carrying out an action associated with a form submission (like sending an email, firing off a webhook, or zapping a Zapier zap).

As a general list of tech:
- Nuxt
- Express
- Node
- Postgres
- SQS
- SES
- Lambda

We tried to pick a mix of tech we either had close experience with (Nuxt) or is so battle-tested that it should pretty much be the default for everyone (Postgres). We also liked the isomorphic nature of an all-JS codebase, and felt like Node and something as lightweight as Express made for a good API base.

We also individual had experiencing building on these technologies *together* before. Developing a common stack has helped speed everything along.

For the unified marketing and app part - our blog is four functions in a section of the Express app; our main landing page shares the same frontend surface as our application; and our pricing page is powered by our application API. Everything lives side-by-side.

## Why We Did It
There were several factors playing into our current structure.

### Combining marketing and application tech supercharges marketing
When we were thinking of how we wanted to do our [docs](https://formcake.com/docs), we considered a couple of different services like [readthedocs.io](https://docs.readthedocs.io/en/stable/) and [docsify](https://docsify.js.org/#/), but were most inspired by Stripe's [living docs](https://stripe.com/docs) - where, if you're logged in, code samples are populated by your account's actual test tokens.

Now our docs are thoroughly humble at the moment - bare even. But we've built everything to allow us to implement that sort of sandbox. You could call it a premature optimization, but the design allows us to be flexible.

### One domain to rule them all
There's no reason to avoid subdomains in particular - but the advice on them can be [rather situational](https://www.seroundtable.com/seo-google-fight-subdomains-subdirectories-25126.html): Google says Googlebot treats subdirectories and subdomains the same (so `blog.site.com` and `site.com/blog` rank equally), but subdomains can suffer from their own issues like [keyword dilution](https://blog.cloudflare.com/subdomains-vs-subdirectories-best-practices-workers-part-1/).

But there still seems like an organizational elegance to having everything under `formcake.com` (well, except for `api.formcake.com`, since we're cheating). It gives us a nice sitemap that covers a consistent app surface.

### Softcoding all the martech
Because we're playing in an application where we can already access stuff like account info, pricing, and other data, we can integrate our martech so that marketing pages like `/pricing` are all fed from a few Postgres tables. We can then have a unified marketing and application source of truth - we always price as advertised, because we have one pricing table feeding everything.

### SSR allows for SEO visibility
One advantage to using Nuxtjs, which comes with easy, out-of-the-box server-side rendering, is that we can develop the application dashboard in Vue, then use either SPA or SSR patterns depending on the interactivity we want to achieve - and then use SSR for all marketing pages so they play well with search. Google claims [Googlebot can render Javascript-heavy pages](https://developers.google.com/search/docs/guides/javascript-seo-basics), but there are some slight caveats. Also, there are all those non-Google search engines to think of: Bing, DuckDuckGo - everyone but Google and Ask, actually - [are essentially Javascript-blind](https://www.deepcrawl.com/knowledge/white-papers/javascript-seo-guide/how-javascript-rendering-works/).

### Cross-project changes really are awesome
A classic advantage of monorepos is the capacity to perform [cross-project changes](https://danluu.com/monorepo/) where a single release can include alterations of multiple coordinating services. This blog, dear reader, was one PR: the frontend Nuxt infrastracture and styling, the backend Express routes, and the actual rich text markdown flat files, all bundled together in a single change. With our setup, we can also extend this idea across not just multiple application projects but our entire business unit as well - with one PR we can release a feature and the marketing apparatus for that feature at the same time. 

## Some Big Caveats
We also benefit from some specific circumstances it's useful to note.

### We're four people - all developers
Our blog, as markdown files served by Express, is not very user-friendly. But we're not some larger outfit with outside freelancers and editors - or our own writing staff - we're it. And since we don't need a whole CMS for blog post CRUD or a separate application for its own access control, we can avoid a lot of overhead. If we had a dedicated writer, bizdev person or account manager, we'd have to change our infrastructure to accomodate them.

### Our complexity is limited
We're not landing a spacecraft on a floating drone barge - we're proud of our architecture, but the problem space is straightforward. Monorepos, though popular at large companies like Google and Facebook, also do well at smaller scales, when individual services (the blog, pricing info, form dashboard) are small enough to group together. With smaller applications, we don't risk a  a weird directory organization or testing the limits of `git`. 

### This isn't a VC business
We don't need to staff up - we plan on operating via our own talent, augmented by the occasional outside freelancer, for a long while as we bootstrap the company. That means we can design systems that only fit the four of us.

## And Real Downsides
These are things we've either learned to live with or have accepted as trade-offs for what we've accomplished.

### No security isolation.
Our blog is in our principal application source code. To edit a post you would need access to _all_ our source. This is fine for our four-person partnership - but would be unworkable for a conventional company.

### Shared libraries risk becoming tightly-coupled code
Monorepos are supposed to reduce code duplication and allow for more isomorphic strategies (that work well with our chosen tech like Nuxt), but that can quickly curdle into tight couplings where code snippets that have no business referencing each other become deeply entangled.

### No application-specific CI/CD tooling
If we want to associate a Github webhook or CircleCI job with an individual repo, we only have one - and it's got *everything*. It comes back to the security isolation issue - we've lost a certain granularity with the monorepo. Now, it's not terrible to have multiple apps simply tuning into their subdirectory of choice when they test/merge/deploy whatever code their concerned with, but it could get messy.

## Takeaways
We chose a structure for our project that mirrored the needs and unique advantages of our business - one where every member was trusted (and expected) to contribute technically.

It's definitely not for everyone, but hopefully this breakdown of how it does (and sometimes doesn't) work for us will help inform decisions for your own projects, and maybe lead you to consider these patterns yourself.
