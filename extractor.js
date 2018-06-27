// Library I chose to use for http requests
const REQUEST = require('request');
// Key for the google API
const KEY = process.env.API_KEY
// Language for the caption download
const LANG = 'en'

module.exports = {

initRequest: function(url) {
    return new Promise(function(resolve, reject) {
      REQUEST.get(url, function(err, resp, body) {
        if (err) {
          reject(err);
        }
        resolve(JSON.parse(body));
      })
    })
  },

  extractPlaylistId: function(input) {
    // Get the playlist ID from whatever is entered as input
    // We know the ID is always 34 chars, might be after 'list=', and is always at the end of the string
    const check = input.match(/(list=)?(\w{34})$/)
    if (check !== null && check[2].length === 34) {
      return check[2]
    }
    return false
  },

  cleanStr: function(str) {
    // Remove any starting/trailing spaces, and remove any tabs
    return str.trim(str.replace(/\t/g, ''))
  },

  formatJson: async function(videos_json, captions) {
    // Create a simple object from the returned youtube data so its easier to use later
    let videos = []
    for (const key of Object.keys(videos_json)) { // For each video, create a new object and add it to the array
      // Do some cleaning as well for the TSV file later
      videos[videos.length] = { 
        'title': module.exports.cleanStr(videos_json[key].snippet.title || '' ),
        'description': module.exports.cleanStr(videos_json[key].snippet.description || ''),
        'note': module.exports.cleanStr(videos_json[key].contentDetails.note || ''),
        'videoId': 'https://www.youtube.com/watch?v=' + videos_json[key].contentDetails.videoId
      }
      if (captions) {
        videos[videos.length-1].captions = await module.exports.getCaptions(videos_json[key].contentDetails.videoId)
      }
    }
    return videos
  },

  getPlaylist: async function(input, captions) {
    // Parameters:
    // ID: playlist ID
    // Captions: boolean, set to true if you want to download captions 
    // -------
    const id = module.exports.extractPlaylistId(input) // Get the playlist id from whatever was entered as input

    if (id === false) {
      console.log('invalid playlist id!');
      return false
    }
    // The url below gets the following fields:
    // - title
    // - description
    // - video ID
    // - note (if any)
    // See https://developers.google.com/apis-explorer/#p/youtube/v3/youtube.playlistItems.list?part=snippet%252CcontentDetails&maxResults=50&playlistId=PLBCF2DAC6FFB574DE&fields=pageInfo%252CnextPageToken%252Citems(snippet(title%252Cdescription))%252Citems(contentDetails(videoId%252Cnote))&_h=6&
    const url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&playlistId='+id+'&fields=pageInfo%2CnextPageToken%2Citems(snippet(title%2Cdescription))%2Citems(contentDetails(videoId%2Cnote))&key='+KEY
    const videos_json = await module.exports.doPageLoop(url)
    return module.exports.formatJson(videos_json, captions)
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
  },


  getCaptions: async function(video) {
    // We need the caption information first before we can download it
    const url = 'https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId='+video+'&fields=items(id%2Csnippet%2Flanguage)&key='+KEY
    const body = await module.exports.initRequest(url)
    let captionId;
    // Loop through all captions and find the right version
    for (const captions of Object.keys(body)) {
      for (const version of Object.keys(body[captions])) {
          if (body[captions][version].snippet.language == LANG) {
            captionId = body[captions][version].id
            break;
          }
      }
    }

    if (typeof(captionId) === 'undefined') {
      return ''; // No captions to return
    }

    console.log('cap: '+captionId+', '+video)
    // Now that we have the information we can download the caption file
    return '';
  }

} // </module.export
