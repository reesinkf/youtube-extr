const express = require('express');
const router = express.Router();
const youtube = require('./extractor');
const converter = require('./converter')
// Google oath
require('./gauth.js')
const publicroot = __dirname+'/public';

// Use this for every route, so we don't have to use try/catch every time,
// takes a function and wraps it inside a promise
const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
};

// Use this so the browser can reach static files
router.use(express.static(__dirname+'/public'));

// Log for debugging
router.use(function log (req, res, next) {
  //console.log(req)
  next()
})

// Testing playlist:
// http://127.0.1.1:3333/api/getlist/PLB03EA9545DD188C3
router.get('/api/getlist/:input', asyncMiddleware(async (req, res, next) => {
  const videos = await youtube.getPlaylist(req.params['input'], false) // Second parameter set to 'true' to download captions
  res.send({ videos: converter.objToTsv(videos) })
}));

router.get('/oath/*', function(req, res) {
	const code = req.params.input['response']
	console.log(code)
});
// Catch all for the index
router.get('*', function (req, res) {
	res.sendFile('index.html', {root: publicroot}); // Load our main index/angular file
});


module.exports = router