var express = require('express');
var Twitter = require("twitter");
var router = express.Router();
var cors = require('cors');

router.get('/', cors(), function(req, res, next) {
  res.render('index', { title: 'Express' });
});

function twitterClient(params) {
  console.log('`````````params', params);
  console.log('process.env.CONSUMER_KEY', process.env.CONSUMER_KEY);
  console.log('process.env.SECRET', process.env.CONSUMER_SECRET);
  return new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    // access_token_key: "3248180491-VqOfZVImZZTuc56Jh8CTB9G3SMHdgO9VlrRdif5",
    // access_token_secret: "w7UgWEabp0TE5x75AYhVbFF6oQyaXrQTcaIn00QtkIlUb"
    access_token_key: params.ACCESS_KEY,
    access_token_secret: params.ACCESS_SECRET
  });
}

router.post('/tweet', cors(), function(req, res, next) {
  var client = twitterClient(req.body);

  client.post('statuses/update', { status: req.body.tweet }, function(error, tweets, response){
    if (error) {
      console.error(error);
      res.status(500);
    }

    res.json(tweets);
  });
});

router.post('/search', cors(), function(req, res, next) {
  console.log(req.body);
  var client = twitterClient(req.body);
  var words = req.body.words.toLowerCase().split(" ");

  client.get('search/tweets', { q: words.join(" OR "), count: 100 }, function(error, tweets, response){
    if (error) {
      console.error(error);
      res.status(500);
    }

    var stats = {}, oneTweetWords, lowerCaseWord, users = {};

    tweets.statuses.forEach(function(tweet) {
      oneTweetWords = tweet.text.toLowerCase().split(" ");
      oneTweetWords.forEach(function(word) {
        lowerCaseWord = word.toLowerCase();
        if (words.indexOf(lowerCaseWord) >= 0) {
          stats[word] = stats[word] || 0;
          stats[word]++;
          users[tweet.user.screen_name] = tweet.user;
        }
      });
    });

    res.json({ stats: stats, users: users });
  });

});


router.post('/follow', cors(), function(req, res, next) {
  var client = twitterClient(req.body);

  client.post('friendships/create', { screen_name: req.body.screen_name }, function(err, user, response) {
    if (err) {
      console.error(err);
      res.status(500);
    }
    res.json(user);
  });
});


module.exports = router;
