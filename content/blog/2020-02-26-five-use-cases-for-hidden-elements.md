---
title: "Five Uses for Hidden Form Inputs"
date: 2020-02-26T16:56:18-05:00
description: Example, business cases, and code examples for using hidden form inputs.
author: Joe Marshall
image: '/images/input-code.png'
---

**Hidden elements** (`<input type="hidden" />` ) are nifty little tags that basically allow you to attach metadata to your `<form>` submissions and communicate data between your client and server layers without visually troubling your users.

In fact they're useful enough that here are a few ways you should - or probably already are - using them.

## Analytics

Services like Google Analytics provide you with `gaClientId` tokens pulled in from Google by the scripts you place on your site. By using JS to write this into a `<input type="hidden" />` tag you can an element that looks like this...

```
<input type="hidden" name="gaClientId" value="08df89mdsfs9d8fmsjhgf0g99dfk" />
```

... and which you can pass back to your server or [whatever other backend form infrastructure you might happen to use](https://formcake.com), correlating front-end actions via the Google identity with server-side information.

In addition to linking the user to an analytics server, you can also use hidden tags to capture simple bits of info themselves, like a user's IP address.

## Security

**CSRF*** (Cross-site request forgery) is consistently in the OWASP top 10 most popular web application vulnerabilities, and basically consists of when a malicious attacker uses code on a webpage to trick you into making an unauthorized-by-you action using your authorized-by-the-site account, exploiting access to your session credentials or other data. An example might be an attacker tricking you into executing code, via phishing or another attack, that used your session cookies from your logged-in bank account to trigger an authorized wire transfer.

One common way of preventing CSRF is using tokens, passed via your form.

```
<input type="hidden" name="csrfToken" value="Cs09ds09d09msdF39I8yWnWX9wX4WFoz" /> 
```

By making the token an unguessable secret that can only be validated by the server, you prevent an attacker from being able to construct (forge) a valid cross-site request. To make it even more secure, you can limit specific tokens to specific site actions or by number of uses.

## Testing

Hidden form fields can also be used to make testing campaigns more accurate. Serving up an A/B(/C/D) tested site, you can hide keyword information, message value, theme information - all sorts of data that fed back to your servers can help you drill down on the channels that actually produce.

Combined with remarketing this can prove a [powerful way to hone your outreach](https://lineardesign.com/blog/linkedin-ads/).

## Integration

Companies that integrate with form software often used hidden fields as a sort of rich API for defining settings or behavior. Hubspot, the mammoth email CRM, [allows you to use hidden fields to set contact information](https://knowledge.hubspot.com/forms/pass-contact-property-values-with-hidden-form-fields) among other things. Because these fields can be so easily dynamically generated via JS without affecting the user's visual experience, they can be a powerful bridge between the client and server.

## State Preservation

When using a multi-step or multi-part form, hidden elements can be a simple way of passing state back to the server communicating what step of the process the user is on. It's low-tech compared to the sophisticated ways a SPA version of the process would husband state, but it can nevertheless be effective.

However you use the awesome power of `type="hidden"` remember that sage security wisdom that anything left open to user input will be subjected to an *unholy level of abuse*. Expect that your hidden inputs will be detected and generally messed with and build your systems accordingly.
