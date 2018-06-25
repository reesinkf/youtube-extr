// We want babel to transpile the code so we can use ES6 javascript
require('babel-register') ({
    presets: [ 'env' ]
})

// We want these for async stuff
require("babel-core/register"); 
require("babel-polyfill");

// Import the rest of our app
module.exports = require('./server.js')
