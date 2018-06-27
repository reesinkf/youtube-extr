// Library I chose to use for http requests
const request = require('request');
// Key for the google API
const key = process.env.API_KEY

module.exports = {

initRequest: function(url) {
    return new Promise(function(resolve, reject) {
      console.log(url)
      request.get(url, function(err, resp, body) {
        if (err) {
          reject(err);
        }
        resolve(JSON.parse(body));
      })
    })
  },

  formatJson: function(videos_json) {
    // Create a simple object from the returned youtube data so its easier to use later
    let videos = []
    for (const key of Object.keys(videos_json)) { // for each video, create a new object and add it to the array
      videos[videos.length] = { 
        'title': videos_json[key]['snippet']['title'],
        'description': videos_json[key]['snippet']['description'],
        'note': videos_json[key]['contentDetails']['note'],
        'videoId': videos_json[key]['contentDetails']['videoId'] 
      }
    }
    return videos
  },

  getPlaylist: async function(id) {
    // This url gets the following fields:
    // - title
    // - description
    // - video ID
    // - note (if any)
    // See https://developers.google.com/apis-explorer/#p/youtube/v3/youtube.playlistItems.list?part=snippet%252CcontentDetails&maxResults=50&playlistId=PLBCF2DAC6FFB574DE&fields=pageInfo%252CnextPageToken%252Citems(snippet(title%252Cdescription))%252Citems(contentDetails(videoId%252Cnote))&_h=6&
    const url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&playlistId='+id+'&fields=pageInfo%2CnextPageToken%2Citems(snippet(title%2Cdescription))%2Citems(contentDetails(videoId%2Cnote))&key='+key
    const videos_json = await module.exports.doPageLoop(url)
    return module.exports.formatJson(videos_json)
  },

  doPageLoop: async function(url) {

     async function loop(url, pageToken, videos) {
        const body = await module.exports.initRequest(url + pageToken);
        pageToken = module.exports.checkToken(body) // Check if there are more pages to get
          if (pageToken !== false) { // If there is another page, do another run
            return await loop(url, pageToken, [...videos, ...body.items])
          } else { // No more pages to retreive
            return [...videos, ...body.items]
          }
      }

      // Loop through every page
      return await loop(url, '', []) // empty pagetoken for the first page, and an empty 'videos' array to save results into
  },

  checkToken: function(body) {
    // Check if there is another page after current one
    if (typeof(body.nextPageToken) !== 'undefined') { // Check if the 'next token page' is present
        return '&pageToken='+body.nextPageToken;
    }
    return false // Finished, no more tokens
  }

} // </module.export
