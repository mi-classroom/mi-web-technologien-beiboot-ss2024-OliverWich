# Image manipulation tool - sharp

## Status

Accepted

## Context
There are many ways to edit images programmatically.
Since we want to blend images together, a tool is needed that can do that.

I want this to run as hands off as possible without the need to install any tools separately.
This means, that only tools that come as fully self-contained packages come into question.

A few examples are:
* [Magickwand.js](https://github.com/mmomtchev/magickwand.js)
* [Sharp](https://sharp.pixelplumbing.com/)


## Decision
After trying out Magickwand.js (which is a Node port of Magick++ wich itself is a Cpp library for ImageMagick) and not 
getting it to run successfully, I've settled on **sharp**.
This hat the ability to work with raw pixels, comes with a build in composite feature and feels in general easy to work with.


## Consequences

Pros:
* A tool that works without any extra dependencies
* A nice API
* A robust set of features to build upon.

Cons:
* The need to build some features by hand as only basic image manipulation stuff is build in.
