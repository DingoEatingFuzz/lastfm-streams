var LastFmNode = require('lastfm').LastFmNode
  , config = require('../config')
  , moment = require('moment');

var lastfm = new LastFmNode({
  api_key:   config.lastfm.api_key,
  secret:    config.lastfm.secret,
  useragent: 'lastfm-streams/v0.1 Lastfm Streams'
});

var test = lastfm.stream('dubsaru');
var tracks = [];

test.on('nowPlaying', function(track) {
  //console.log(track);
  tracks.push(track);
});

test.on('error', function(error) {
  console.log('something went wrong within lastfm module');
  console.log(error);
});

test.start();

exports.index = function(io) {

  var users = [];

  lastfm.request('user.getFriends', {
    user: 'DingoEatingFuzz',
    handlers: {
      success: function(data) {
        users = data.friends.user;
      },
      failure: function(error) {
        console.log('getFriends error: ', error.message);
      }
    }
  });

  return function(req, res) {
    buildLists(users, function(list) {
      res.render('index', viewObj(list));
    });
  };
};

function buildLists(users, cb) {

  if (!users.length) return [];

  var completed = 0,
      lists = [];
  users.forEach(function(user) {
    lastfm.request('user.getRecentTracks', {
      user: user.name,
      limit: 10,
      from: moment().subtract('h', 1).unix(),
      handlers: {
        success: function(data) {
          console.log('fetched tracks for: ', user.name);
          completed++;
          lists.push({
            name: user.realname || user.name,
            tracks: data.recenttracks.track || []
          });
          if (completed === users.length) {
            cb(lists);
          }
        }
      }
    })
  });
}

function viewObj(list) {
  return {
    title: 'lastfm streams',
    friends: list
  };
}