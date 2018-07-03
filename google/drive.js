const {google} = require('googleapis'); 

module.exports = function(auth) {

	let module = {}

	const drive = google.drive({version: 'v3', auth: auth});

	module.createSpreadsheet = function(name, content, dir) {
		return new Promise(function(resolve, reject) {
			const sheets = google.sheets('v4');
	  		sheets.spreadsheets.create({
			    auth: auth,
			    resource: {
			        properties:{
			            title: name
			        },
		        	resource: {
		      			values: content
		    		}
	    		}
	  		}, (err, response) => {
			    if (err) {
			      reject(err)
			    }
			   	resolve(response)
			})
  		});
	},

	module.mkdir = function(name) {

	},

	module.rm = function(fileId) {
		drive.files.remove(fileId)
	},


	module.ls = function(dir) {
		return new Promise(function(resolve, reject) {
			drive.files.list({
			  auth: auth,
			  pageSize: 1000,
			  q: dir
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