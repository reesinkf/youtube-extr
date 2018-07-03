const {google} = require('googleapis'); 


module.exports = function(auth) {

	const drive = google.drive({
		version: 'v3',
		auth: auth
	});

	createSpreadsheet: function(name, content, dir) {
		return new Promise(function(resolve, reject) {
			var sheets = google.sheets('v4');
	  		sheets.spreadsheets.create({
			    auth: auth,
			    resource: {
			        properties:{
			            title: name
			        }
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
	}

	mkdir: function(name) {

	}

	rm: function(fileId) {

	}


	ls: function(dir) {
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
}