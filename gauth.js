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
			name: 'Test 2',
		    mimeType: 'text/plain'
		},
		media: {
			mimeType: 'text/plain',
		    body: 'Hello World'
		}
	})


	  var sheets = google.sheets('v4');
  sheets.spreadsheets.create({
    auth: auth,
    resource: {
        properties:{
            title: "HUEAH"
        }
    }
  		}, (err, response) => {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    } else {
        console.log("Added");
    }
  	});

		
	drive.files.list({
	  auth: auth,
	  pageSize: 1000
	}, function (err, resp) {
	  if (err) {
	    console.log("ERROR", err);
	  }
	  else {
	    console.log(resp.data);
	  }
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