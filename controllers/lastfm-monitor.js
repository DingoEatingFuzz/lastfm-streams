var LastFmNode = require('lastfm').LastFmNode
  , config     = require('../config')
  , moment     = require('moment')
;

var lastfm = new LastFmNode({
  api_key:   config.lastfm.api_key,
  secret:    config.lastfm.secret,
  useragent: 'lastfm-streams/v0.1 Lastfm Streams'
});

exports.LastFmMonitor = function(opts) {

  var options = {};
  var enter, leave, interval, staleAt;
  var updateInterval;
  var users = [];

  options.username = opts.username;
  options.interval = opts.interval || 1000 * 60;
  options.staleAt  = opts.staleAt  || 30;

  function setter(key) {
    var self = this;
    return function(val) {
      if (val) {
        options[key] = val;
        return self;
      } else {
        return options[key];
      }
    }
  }
  
  this.username = setter.call(this, 'username');
  this.interval = setter.call(this, 'interval');
  this.staleAt  = setter.call(this, 'staleAt');

  this.enter = function(handler) {
    options.enter = handler;
    return this;
  };

  this.leave = function(handler) {
    options.leave = handler;
    return this;
  };

  this.start = function() {
    console.log('Monitor starting...\n');
    updateInterval = setInterval(this.update, options.interval);
    return this;
  };

  this.stop = function() {
    clearInterval(updateInterval);
    return this;
  };

  this.update = function() {
    console.log('Updating...\n');
    var newUsers = [];

    lastfm.request('user.getFriends', {
      user: options.username,
      recenttracks: true,
      handlers: {
        success: function(data) {
          var newUsers = activeUsers(data.friends.user);
          compareAndUpdate(newUsers);
        },
        error: function(error) {
          console.log('Problem getting friends in the monitor: ', error.message);
        }
      }
    });
    // get active users
    // compare new list with existing list
    // in A not in B: call leave on it
    // in B not in A: call enter on it
    // set users to new list
    return this;
  };

  function activeUsers(users) {
    var newUsers = [];

    users.forEach(function(user) {
      var now = moment.utc();
      var lastPlayedDateTime;
      if (user && user.recenttrack) {
        if(user.recenttrack['@attr']) {
          lastPlayedDateTime = user.recenttrack['@attr'].uts;
          if (lastPlayedDateTime) {
            var timeAgo = now.diff(moment.unix(lastPlayedDateTime), 'minutes');
            if (timeAgo < options.staleAt) {
              newUsers.push(user);
            }
          }
        } else {
          newUsers.push(user);
        }
      }
    });

    return newUsers;
  }

  function compareAndUpdate(newUsers) {
    console.log('New Users...');
    newUsers.forEach(function(user) { console.log(user.name); });
    var left = [], entered = [];

    users = newUsers;
  }

};