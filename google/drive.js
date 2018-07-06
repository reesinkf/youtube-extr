const {google} = require('googleapis'); 

module.exports = function(auth) {

	// All required google drive functions

	let module = {}

	const drive = google.drive({version: 'v3', auth: auth});
	const folderId = '1Z3DWllKHXhxsoJRvvtOZCtoWQXVejmvF'; // Id of shared folder, all created spreadsheets will be moved here

	module.createSpreadsheet = function(title) {
		title += Math.round(+new Date()/1000);
		// Creates a new empty spreadsheet in the root directory
		return new Promise(function(resolve, reject) {
			const sheets = google.sheets('v4');
			sheets.spreadsheets.create({
	  			resource: {
	  				properties: {
	  					title: title,
	  				},
	  			},
			    auth: auth
	  		}, (err, response) => {
			    if (err) {
			      reject(err)
			    }
			   	resolve(response)
			})
  		});
	},

	module.appendSpreadsheet = function(fileId, data) {
		// Adds data to an existing spreadsheet
		// Data needs to be an array with arrays, eg:
		// [ ['a', 'b', 'c'], ['x', 'y', 'z'] ]
		return new Promise(function(resolve, reject) {
			// Add headers to data array
			data.unshift(['Title', 'Description', 'Video', 'Note', 'Captions'])
			console.log(data)
			const sheets = google.sheets('v4');
			sheets.spreadsheets.values.append({
			    auth: auth,
			    spreadsheetId: fileId,
			    range: 'Sheet1!A1:B'+data.length, 
			    valueInputOption: "RAW",
			    resource: {
			      values: data
			    }
			  }, (err, response) => {
			    if (err) {
			    	console.log('The API returned an error: ' + err);
			    	reject(err)
			    } else {
			    	resolve(response)
			    }
		  	});
		})
	},

	module.moveToSharedFolder = function(fileId) {
		// Moves the spreadsheet to a shared folder

		// Get file info (current folder)
		drive.files.get({
			fileId: fileId,
			fields: 'parents'
			}, function (err, file) {
			// Move the file to the new folder
				const previousParents = file.data.parents.join(',');
			    drive.files.update({
			      fileId: fileId,
			      addParents: folderId,
			      removeParents: previousParents,
			      fields: 'id, parents'
			    });
			})	
	},

	module.rm = function(fileId) {
		drive.files.delete({ fileId: fileId })
	},

	module.ls = function(dir) {
		return new Promise(function(resolve, reject) {
			drive.files.list({
			  auth: auth,
			  pageSize: 1000,
			}, function (err, response) {
				if (err) {
					reject(err)
				}
				resolve(response)
			});
		})
	}

	return module;
}