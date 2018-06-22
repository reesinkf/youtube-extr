var express = require('express');
var router = express.Router();
var youtube = require('./extractor');

// Log for debugging
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})


router.get('/api/getlist/:id', function(req, res) {
  let list = youtube.getPlaylist(req.params['id']);
  list.then(function(videos) {
  	res.send({
		videos: videos
	 })
  })
});

module.exports = router