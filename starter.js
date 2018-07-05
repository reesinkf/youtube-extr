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
const router = express.Router();
const app = express();
const request = require('request');
const youtube = require('./extractor');
const publicroot = __dirname+'/public';

let gDrive;

async function googleLogin(credentials) {
	const gAuth = require('./google/auth.js')
	const auth = await gAuth.authorize(JSON.parse(credentials))
	// Include our google drive functions after logging in
	gDrive = require('./google/drive.js')(auth)

	// UNCOMMENT TO DELETE ALL FILES ON GOOGLE DRIVE
	// To clean up after testing...
	// ------
	/*
	let test = await gDrive.ls('')
	for(let i=0;i<test.data.files.length;i++) {
			console.log(test.data.files[i].name)
			//gDrive.rm(test.data.files[i].id)
	}
	*/
	
}

// Read login details for google oath
const credentials = fs.readFileSync('./config/credentials.json');  
// Login to google
googleLogin(credentials)

// Use this for every route, so we don't have to use try/catch every time,
// takes a function and wraps it inside a promise
const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
};

// Use this so the browser can reach static files
router.use(express.static(__dirname+'/public'));

// Testing playlist:
// http://127.0.1.1:3333/api/getlist/PLB03EA9545DD188C3
router.get('/api/getlist/:input', asyncMiddleware(async (req, res, next) => {
  const videos = await youtube.getPlaylist(req.params['input'], false) // Second parameter set to 'true' to download captions
  if (videos !== false) {
  	  // Create file
	  const file = await gDrive.createSpreadsheet('HUEAHE')
	  // Write to new file
	  await gDrive.appendSpreadsheet(file.data.spreadsheetId, videos)
	  // Move file to shared folder
	  gDrive.moveToSharedFolder(file.data.spreadsheetId)
	  // Return URL to spreadsheet
	  res.send({ videos: file.data.spreadsheetUrl })
  } else {
  	res.send({ videos: false })
  }
}));

// Catch all for the index
router.get('*', function (req, res) {
	res.sendFile('index.html', {root: publicroot}); // Load our main index/angular file
});


// Start webserver, bind to all ip addresses so I can reach it on my virtual machine
app.use(router)
app.listen(1200, '0.0.0.0');
console.log('server listening...')






