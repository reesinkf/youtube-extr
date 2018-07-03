"use strict";

// We want babel to transpile the code so we can use ES6 javascript
require('babel-register') ({
    presets: [ 'env' ]
})

// We want these for async stuff
require("babel-core/register"); 
require("babel-polyfill");

// Load local config
require('dotenv').config()

const fs = require('fs'); 
const express = require('express');
const app = express();
const request = require('request');

async function googleLogin(credentials) {
	const gAuth = require('./google/auth.js')
	const auth = await gAuth.authorize(JSON.parse(credentials))
	// Include our google drive functions after logging in
	const gDrive = require('./google/drive.js')(auth)
}


// Read login details for google oath
const credentials = fs.readFileSync('./config/credentials.json');  
// Login to google
googleLogin(credentials)


// Start webserver, bind to all ip addresses so I can reach it on my virtual machine
const router = require('./routing')
app.use(router)
app.listen(1200, '0.0.0.0');
console.log('server listening...')


