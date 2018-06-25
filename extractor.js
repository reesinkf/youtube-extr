// Library I chose to use for http requests
const request = require('request');
// Available properties to get from videos
const properties = ['title', 'description', 'videoID', 'note', 'captions'];
// Key for the google API
const key = 'AIzaSyDIabrBKXdoBSpluPaTdq-ZyriF1lHFBks'; 

module.exports = {

initRequest: function(url) {
    return new Promise(function(resolve, reject) {
      request.get(url, function(err, resp, body) {
        if (err) {
          reject(err);
        }
        resolve(JSON.parse(body));
      })
    })
  },

  getPlaylist: async function(id) {
    const url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId='+id+'&key='+key;
    return await module.exports.doPageLoop(url)
  },

  doPageLoop: function(url) {

    return new Promise(function(resolve) {

     function loop(url, pageToken, videos) {
        const doRequest = module.exports.initRequest(url + pageToken);
        doRequest.then(function(body) {
          const pageToken = module.exports.checkToken(body) // Check if there are more pages to get
          if (pageToken !== false) { // If there is another page, do another run
            loop(url, pageToken, [...videos, ...body.items])
          } else { // No more pages to retreive
            resolve(videos)
          }
        });
      }

      // Loop through every page
      loop(url, '', []) // empty pagetoken for the first page, and an empty 'videos' array to save results into
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
