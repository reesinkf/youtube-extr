// Library I chose to use for http requests
const request = require('request');
// Available properties to get from videos
const properties = ['title', 'description', 'videoID', 'note', 'captions'];
// Key for the google API
const key = 'AIzaSyDIabrBKXdoBSpluPaTdq-ZyriF1lHFBks'; 

module.exports = {

initRequest: function(url) {
    console.log(url)
    return new Promise(function(resolve, reject) {
      request.get(url, function(err, resp, body) {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(body));
        }
      })
    })
  },

  getPlaylist: function(id) {
    return new Promise(function(resolve) {
      let url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId='+id+'&key='+key;
      //return module.exports.doPageLoop(url)
      
      let getList = module.exports.doPageLoop(url) 
      getList.then(function(videos) {
          resolve(videos);
      }).catch(function(e) {
          console.log(e)
      })

    });
  },


  doPageLoop: function(url) {

    return new Promise(function(resolve) {

     function loop(url, pageToken, videos) {
        let doRequest = module.exports.initRequest(url + pageToken);
        doRequest.then(function(body) {
          // Loop through the list and save every item
          let x = body.items.length
          for(let i=0; i<x; i++){
            videos.push(body.items[i])
          }

          pageToken = module.exports.checkToken(body) // Check if there are more pages to get
          if (pageToken !== false) { // If there is another page, do another run
            loop(url, pageToken, videos)
          } else { // No more pages to retreive
            resolve(videos)
          }
        });
      }

      // Loop through every page
      loop(url, '', []) // empty pagetoken for the first page, and an empty 'videos' array to put results in
    });

  },

  checkToken: function(body) {
    // Check if there is another page after current one
    if (typeof(body.nextPageToken) !== 'undefined') { // Check if the 'next token page' is present
        return '&pageToken='+body.nextPageToken;
    }
    return false // Finished, no more tokens
  }

} // </module.export
