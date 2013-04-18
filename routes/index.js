var LastFmNode = require('lastfm').LastFmNode
  , config = require('../config')
  , moment = require('moment');

var lastfm = new LastFmNode({
  api_key:   config.lastfm.api_key,
  secret:    config.lastfm.secret,
  useragent: 'lastfm-streams/v0.1 Lastfm Streams'
});

exports.index = function(io) {

  var users = [];
  var def;

  io.sockets.on('connection', function (socket) {
    console.log('Socket Connection');

    watchTracksFor(users, function(user, track) {
      console.log('GOT SOME');
      socket.emit('newTrack', {
        user: user,
        track: track
      });
    });

    socket.on('newTrack', function(d) {
      console.log(d);
    });

  });

  lastfm.request('user.getFriends', {
    user: 'DingoEatingFuzz',
    handlers: {
      success: function(data) {
        users = users.concat(data.friends.user);
      },
      failure: function(error) {
        console.log('getFriends error: ', error.message);
      }
    }
  });

  lastfm.request('user.getInfo', {
    user: 'DingoEatingFuzz',
    handlers: {
      success: function(data) {
        users = users.concat(data.user);
        def = data.user;
      },
      failure: function(error) {
        console.log('getInfo error: ', error.message);
      }
    }
  });

  return function(req, res) {
    buildLists(users, function(list) {
      res.render('index', viewObj(list));
    });
  };

};

function watchTracksFor(users, cb) {
  console.log(users);
  users.forEach(function(user) {
    var watch = lastfm.stream(user.name);
    watch.on('nowPlaying', function(track) {
      console.log('nowPlaying');
      cb(user, track);
    });
    watch.on('scrobbled', function(track) {
      console.log('scrobbled');
      cb(user, track);
    });
    watch.on('lastPlayed', function(track) {
      console.log('lastPlayed');
      cb(user, track);
    });
    watch.on('error', function(error) {
        console.log('lastfm stream error: ', error.message);
    });
    watch.start();
  });
}

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
            meta: user,
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