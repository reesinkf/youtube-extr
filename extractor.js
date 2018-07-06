// Library I chose to use for http requests
const REQUEST = require('request');
// Key for the google API
const KEY = process.env.API_KEY
// Need an XML parser for the captions
const parseString = require('xml2js').parseString;
// We need this to be global so we can do parallel caption downloads
let VIDEOS = []

module.exports = {

initRequest: function(url) {
    return new Promise(function(resolve, reject) {
      REQUEST.get(url, function(err, resp, body) {
        if (err) {
          reject(err);
        }
        if (module.exports.isJSON(body)) {
          resolve(JSON.parse(body))
        } else { 
          resolve(body)
        }
      })
    })
  },

  // Just a simple function to check if our response is json data or not
  isJSON: function(str) {
    try {
        return (JSON.parse(str) && !!str);
    } catch (e) {
        return false;
    }
  },

  extractPlaylistId: function(input) {
    // Get the playlist ID from whatever is entered as input
    // We know the ID is either 18 or 34 chars, after 'list=', and is always at the end of the string
    const check = input.match(/list=(\S{18,34})$/)
    if (check !== null) {
      console.log(check)
      console.log(typeof(check[1]))
      if (typeof(check[1]) !== 'undefined') {
        //console.log(check)
        console.log('playlist id: ' + check[1])
        return check[1]
      }
    }
    return false
  },

  cleanStr: function(str) {
    // Remove any starting/trailing spaces, and remove any tabs
    return str.trim(str.replace(/\t/g, ''))
  },

  formatJson: async function(videos_json, captions) {
    // Create an array with objects from the returned youtube data so its easier to use later
    for (const key of Object.keys(videos_json)) { // For each video, create a new array and add it to 'videos'
      // Do some cleaning as well
      let index = VIDEOS.length
      VIDEOS[index] = [
        module.exports.cleanStr(videos_json[key].snippet.title || '' ),
        module.exports.cleanStr(videos_json[key].snippet.description || 'No description found'),
        'https://www.youtube.com/watch?v=' + videos_json[key].contentDetails.videoId,
        module.exports.cleanStr(videos_json[key].contentDetails.note || 'No note found'),
      ]
      if (captions) {
        module.exports.getCaptionsLink(videos_json[key].contentDetails.videoId, index) // Pass along the index so we can add the captions later in parallel
      }
    }
    return VIDEOS
  },

  getPlaylist: async function(input, captions) {
    // Parameters:
    // ID: playlist ID
    // Captions: boolean, set to true if you want to download captions 
    // -------
    const id = module.exports.extractPlaylistId(input) // Get the playlist id from whatever was entered as input
    if (id === false) {
      console.log('Invalid input, no playlist found')
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


  getCaptionsLink: async function(videoId, index) {
    // Example of link to see if there are captions: 
    // - https://www.youtube.com/api/timedtext?type=list&v=tnsB6YCHVXA
    // Example of caption link: 
    // - https://www.youtube.com/api/timedtext?fmt=vtt&v=tnsB6YCHVXA&lang=en&name=English
    // -------
    // First we need to see if there are any captions available for this video
    const checkUrl = 'https://www.youtube.com/api/timedtext?type=list&v='+videoId
    const checkBody = await module.exports.initRequest(checkUrl);
    // Url to use for the captions in the spreadhsheet (we need to append stuff to this later)
    let captionUrl;
    // What to return if no caps found
    const noCaps = 'No captions available';

    // Parse the returned xml from the request
    parseString(checkBody, function (err, xml) {
      if (typeof(xml) === 'undefined') {
        // No captions available
        VIDEOS[index][4] = noCaps
      } else {
        // Loop through returned xml
        for (const key of Object.keys(xml)) {
          // Check if there are any tracks (captions) available
          if (typeof(xml[key].track) !== 'undefined') {
            // Loop through all available tracks and find the english version
            for(let i=0;i<xml[key].track.length;i++) {
              // If we find the track, add lang=en to the url and add it to the videos array
               if (xml[key].track[i].$.lang_code == 'en') {
                  captionUrl = 'https://www.youtube.com/api/timedtext?fmt=vtt&v='+videoId+'&lang=en';
                  // See if we need to append "name=" to the url (sometimes the api needs this for some reason)
                  if (xml[key].track[i].$.name !== '') {
                    captionUrl += '&name=English';
                  }
               }
            }
          }
        }
      }

      if (typeof(captionUrl) === 'undefined') {
        VIDEOS[index][4] = noCaps
      } else {
        VIDEOS[index][4] = captionUrl
      }

    });



  }

} // </module.export
