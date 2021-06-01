Puppeteer is a Node library which provides a high-level API to control headless Chrome or Chromium over the DevTools Protocol. It can also be configured to use full (non-headless) Chrome or Chromium.

// To run this project you need to install Node and npm.
// Run following commands in your CLI in this folder (this is where the gulpfile is located)
1. npm install // This should install all the dependencies for the project and for gulp
2. Navigate to puppeteer folder
2. mocha beforeDeploy.js --timeout 0 // This will take screenshots of pages (pages url ==> nb-sitemap.json/.xml) - do this before deployment
2. mocha afterDeployTest.js --timeout 0 // This will take screenshots of pages and compare it to previous ones (if differeneces, it will be in diffs folder => dc-puppeteer-gui-test\puppeteer\screenshots\diffs) - do this after deployment