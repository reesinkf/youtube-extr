const readline = require('readline'); 
const {google} = require('googleapis'); 
const OAuth2Client = google.auth.OAuth2; 

module.exports = {

	 authorize: function(keys) { 
		return new Promise(function(resolve, reject) {

			// Use a jwtClient to authenticate with google
			const jwtClient = new google.auth.JWT(
					keys.client_email,
					null,
			        keys.private_key,
			        ['https://www.googleapis.com/auth/drive.file']);

			jwtClient.authorize(function (err, tokens) {
				if (err) {
				   reject(err)
				 } 
			});
			console.log('Logged into google!')
			resolve(jwtClient)
		})
	}

}