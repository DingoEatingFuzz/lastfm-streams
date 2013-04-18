$(document).ready(function() {
  
  var socket = io.connect('http://localhost:3000');

  socket.on('newTrack', function(data) {
    var userID = data.user.id,
        userList = $('[data-user="' + userID + '"] ol');
    userList.prepend(trackView(data.track));
    console.log(data);
  });

  function trackView(track) {
    var el = $('<a>').attr('href', track.url).text(track.name);
    return $('<li>').append(el);
  }

});