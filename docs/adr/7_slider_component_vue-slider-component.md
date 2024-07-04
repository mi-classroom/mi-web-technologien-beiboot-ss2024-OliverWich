# Slider component - vue-slider-component

## Status

Accepted

## Context
We need a slider component to select a range of frames / time slices that should be included in the final image.

A few possibilities are:
* [vue-slider-component](https://nightcatsama.github.io/vue-slider-component/)
* [slider component from shadcn-vue](https://www.shadcn-vue.com/docs/components/slider.html)
* [slider component from radix-ui](https://www.radix-ui.com/primitives/docs/components/slider#slider)


## Decision
After trying out the slider component from shadcn-vue and others, I've realized that not many of them let the user select multiple, distinct ranges.
Multi-thumb support is common, but not the ability to select multiple distinct that don't overlap ranges.

Even though the slider component from shadcn-vue looks nice, fits in with the rest shadcn components and easy to use, it does not support this feature.
It's multiple thumb support is limited to a single range with extra values in between.

The vue-slider-component on the other hand does support this feature via its `process` option.
This option allows you to define a function that processes the values of the thumbs and returns a new array of arrays which represent the individual ranges selected.

Vue 3 support is in beta, but works, so I opted to use this component.

## Consequences

Pros:
* The ability to select multiple distinct ranges
* Easy to use and customize

Cons:
* Vue 3 support is in beta
* Not as well known as other libraries
