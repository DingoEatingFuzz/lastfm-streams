# Lastfm Streams

See what music your friends are listening to.

# Overview

An express site that gives you a one-glance no-clicks dashboard of your friends scrobbling on lastfm. It utilizes socket.io for maximal trendiness. 

# Roadmap

Still a work in progress; here's a checklist.
- Filter out friends that aren't currently scrobbling.
- Show "now playing" separate from the list.
    - Slide the "now playing" track down the list when it finishes
- Add more meta data to each listing
    - Timestamp
    - Artist name
    - Image
- Allow dragging and dropping lists for custom reordering
- Parameterize the user instead of just using my account
- Apply polish and stuff
- Make track height proportional to track length

# Check it out

Not hosted yet :( 

# Behavior Details

## On load
- Show only friends that have scrobbles in the last hour
- Show all the tracks they have listened to in the last hour
- Show their current track

## On nowPlaying
- Push this new track into the play list

## On scrobble
- Push this new track into the play list if it isn't already there

## Every minute
- Add streams for newly active friends
- Remove streams for stale friends (been an hour since a scrobble)
