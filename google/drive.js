

const drive = google.drive({
	version: 'v3',
	auth: auth
});
	/*
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
	*/


	  var sheets = google.sheets('v4');
  sheets.spreadsheets.create({
    auth: auth,
    resource: {
        properties:{
            title: "HUEAH"
        }
        resource: {
      values: [ ["Void", "Canvas", "Website"], ["Paul", "Shan", "Human"] ]
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