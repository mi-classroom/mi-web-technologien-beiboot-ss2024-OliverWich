# UI library - shadcn-vue

## Status

Accepted

## Context
There are many ways to build a UI in Vue.
An easy way is to use a UI library that comes with a lot of pre-built components.

A few examples are:
* [Element](https://element.eleme.io/)
* [Vuetify](https://vuetifyjs.com/en/)
* [BootstrapVue](https://bootstrap-vue.org/)
* [shadcn-vue](https://www.shadcn-vue.com/)


## Decision
I've decided to use shadcn-vue as it comes with a lot of pre-built components that are easy to use and look good.
It is also easy to customize and extend and does not come with a lot of extra dependencies.

There is no full commitment with a bunch of dependencies and components that are not needed.
You can pick and choose what you need, get those as raw vue component files in your source code and leave out the rest.


## Consequences

Pros:
* A tool that works without any extra dependencies
* Functional and good looking components
* Easy to customize and extend

Cons:
* Not as many components as other libraries
* Port of a React library, so some components might not be as polished as others
* Not as well known as other libraries
