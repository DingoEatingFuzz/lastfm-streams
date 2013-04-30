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
  var enter, exit, interval, staleAt;
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
  this.users    = users;

  this.enter = function(handler) {
    options.enter = handler;
    return this;
  };

  this.exit = function(handler) {
    options.exit = handler;
    return this;
  };

  this.start = function() {
    console.log('Monitor starting...');
    var self = this;
    updateInterval = setInterval(function() {
      self.update()
    }, options.interval);
    return this;
  };

  this.stop = function() {
    clearInterval(updateInterval);
    return this;
  };

  this.update = function() {
    var self = this;
    console.log('Updating...');
    var newUsers = [];

    lastfm.request('user.getFriends', {
      user: options.username,
      recenttracks: true,
      handlers: {
        success: function(data) {
          var newUsers = activeUsers(data.friends.user);
          compareAndUpdate(self, newUsers);
        },
        error: function(error) {
          console.log('Problem getting friends in the monitor: ', error.message);
        }
      }
    });

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

  function compareAndUpdate(manager, newUsers) {

    var entered = [], exited = [];
    newUsers.forEach(function(user) {
      var inArray = false;
      for (var i = 0, len = manager.users.length; i < len; ++i) {
        if (user.name === manager.users[i].name) {
          inArray = true;
          break;
        }
      }
      if (!inArray) entered.push(user);
    });
    manager.users.forEach(function(user) {
      var inArray = false;
      for (var i = newUsers.length - 1; i >= 0; i--) {
        if (user.name === newUsers[i].name) {
          inArray = true;
        }
      }
      if (!inArray) exited.push(user);
    });

    entered.forEach(function(user) {
      options.enter(user);
    });

    exited.forEach(function(user) {
      options.exit(user);
    });

    manager.users = newUsers;
  }

};