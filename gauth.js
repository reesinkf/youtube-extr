const fs = require('fs'); 
const readline = require('readline'); 
const {google} = require('googleapis'); 
const OAuth2Client = google.auth.OAuth2; 

const SCOPES = 'https://www.googleapis.com/auth/drive.file'
const TOKEN_PATH = './credentials.json';

const content = fs.readFileSync(TOKEN_PATH);  
const auth = authorize(JSON.parse(content))

const drive = google.drive({
	version: 'v3',
	auth: auth
});
		
	drive.files.create({
		requestBody: {
			name: 'Test',
		    mimeType: 'text/plain'
		},
		media: {
			mimeType: 'text/plain',
		    body: 'Hello World'
		}
	}).then(function(file) {
			console.log(file.data.id)
	});



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