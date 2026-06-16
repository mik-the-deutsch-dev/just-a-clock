# Just a clock

 My first app with Google AI Studio and Github Copilot. A free simple browser-based mobile & desktop friendly 7 segment clock, where one can optionally put their favorite clock picture as a background. (That weird app that i missed myself).

# [Link to App](https://mik-the-deutsch-dev.github.io/just-a-clock/)



## Overview
- static React Web App, hosted with Github Pages: [link](https://mik-the-deutsch-dev.github.io/just-a-clock/)
- allows selecting predefined display colors
- allows resizing and positioning of the clock display
- is 7 segment :)
- allows using either built-in or custom background image
- stores settings in Browser Local storage. Up to 3 combinations.
- is OLED-friendly (moves clock slighly every now and then to avoid pixel burn-out). For now only effective with dark background. Will be fixed in future


## Plans for future:

- Add LCD color for non-backlit LCDs

- Add custom color and transparency settings mode?

- Add alarm

- Add timer

- Add sounds (transformer wroom)?

- BUG: position adjustment does not use real clock size

- BUG: move background and screen lock text for OLED

- Add AI feature - user uploads a picture of a clock face, AI determines position and size (possibly color) of display and applies automatically


# Run and deploy

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ccdbeffa-9cca-4a44-b415-3c7024597da8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
