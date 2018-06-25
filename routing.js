var express = require('express');
var router = express.Router();
var youtube = require('./extractor');
var publicroot = __dirname+'/public';


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
router.get('/api/getlist/:id', asyncMiddleware(async (req, res, next) => {
  const videos = await youtube.getPlaylist(req.params['id'])
  res.send({ videos: videos })
}));

// Catch all for the index
router.get('*', function (req, res) {
	res.sendFile('index.html', {root: publicroot}); // Load our main index/angular file
});

module.exports = router