var LastFmNode = require('lastfm').LastFmNode;
var config = require('../config');

console.log(config);

var lastfm = new LastFmNode(config.lastfm);

var test = lastfm.stream('DingoEatingFuzz');
var tracks = [];

test.on('nowPlaying', function(track) {
  console.log('foo');
  console.log(track);
  tracks.push(track);
});

test.on('error', function(error) {
  console.log('something went wrong within lastfm module');
  console.log(error);
})

test.start();

exports.index = function(req, res) {
  res.render('index', {
    title: 'lastfm streams',
    friends: [
      {
        name: 'Michael Lange',
        tracks: tracks
      }, {
        name: 'Foo Bar',
        tracks: [
          { url: 'google.com', name: 'Animals' },
          { url: '#', name: 'Pigs' },
          { url: '#', name: 'Track Three' },
          { url: '#', name: 'Track Four' },
          { url: '#', name: 'Track Five' },
        ]
      }
    ]
  });
};