const fs = require('fs'); 
const readline = require('readline'); 
const {google} = require('googleapis'); 
const OAuth2Client = google.auth.OAuth2; 

const SCOPES = 'https://www.googleapis.com/auth/drive.file'

const content = fs.readFileSync('./credentials.json');  
const auth = authorize(JSON.parse(content))

function authorize(keys) { 

// Use a jwtClient to authenticate with google
	const jwtClient = new google.auth.JWT(
			keys.client_email,
			null,
	        keys.private_key,
	        ['https://www.googleapis.com/auth/drive.file']);

	jwtClient.authorize(function (err, tokens) {
		if (err) {
		   console.log(err)
		 } 
	});

	return jwtClient;

}