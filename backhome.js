'use strict';

let config = require('config'),
    // Http server
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    port = config.get('http.port'),
    // Authentification Require
    crypto = require('crypto'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    // Dash button Setup
    dash_button = require('node-dash-button'),
    dash = dash_button(config.get('dash.mac'), null, null, 'all'),
    // Plug Setup
    plugApi = require('hs100-api'),
    plugClient = new plugApi.Client(),
    plug = plugClient.getPlug(config.get('plug')),
    // Kodi Setup
    kodi = require('kodi-ws'),
    kodiConf = config.get('kodi'),
    musicMorningId = kodiConf.music.morning,
    musicEveningId = kodiConf.music.evening,
    canPlayMusic = kodiConf.enable,
    playMusic = function(musicId)
    {
      let url = 'plugin:\/\/plugin.video.youtube\/?path=\/root\/search&action=play_video&videoid=' + musicId;
      return kodi(kodiConf.host, kodiConf.port).then(function(connection)
      {
        /* Start the video */
        return connection.Player.Open(
          {
            item :
            {
              file : url
            }
          });
      });
    },
    stopMusic = function()
    {
      return kodi(kodiConf.host, kodiConf.port).then(function(connection)
      {
        return connection.Player.GetActivePlayers()
        .then(function(players)
        {
      		/* Stop everything thats playing */
      		return Promise.all(players.map(function(player)
          {
      			return connection.Player.Stop(player.playerid);
      		}));
    	 });
     });
    }
    ;

// Main application
dash.on("detected", () =>
{
  console.log('Dash Button : pressed');
  plug.getPowerState()
      .then((state) =>
      {
        plug.setPowerState(!state);
        if(state)
        {
          console.log('Smart Plug : switch off');
          stopMusic()
          .then(function()
          {
            console.log('Kodi : Stop all players');
          })
          .catch(function(error)
          {
            console.error('Kodi : ' + error);
          });
        }
        else
        {
          console.log('Smart Plug : switch on');
          if (canPlayMusic)
          {
            var d = new Date(),
                n = new Date(),
                musicId = musicMorningId
                ;

            d.setHours(12, 0, 0, 0);
            (n>d) && (musicId = musicEveningId);

            playMusic(musicId)
            .then(function()
            {
              console.log('Kodi : Playing Music ' + (n>d ? 'Evening' : 'Morning'));
            })
            .catch(function(error)
            {
              console.error('Kodi : ' + error);
            });
          }
          else
          {
            console.log('Kodi : Not Playing Music');
          }
        }
      })
      .catch(function(error)
      {
        console.error('Smart Plug : ' + error);
      })
      ;
});
console.log('Back Home Ready');


passport.use(new LocalStrategy(
  function(username, password, done)
  {

    var userApp = config.get('http.user'),
        passApp = config.get('http.password')
        ;

    if (userApp !== crypto.createHash('sha256').update(username).digest('base64') || 
        passApp !== crypto.createHash('sha256').update(password).digest('base64')
    )
    {
      return done(null, false, { message: 'Incorrect username or password' });
    }

    return done(null, {});
  }
));

app
.use(bodyParser.json())
.use(bodyParser.urlencoded({ extended: true}))
.use(passport.initialize())
.get('/login', function(req, res)
{
  res.sendFile(__dirname + '/login.html');
})
.post('/login', passport.authenticate('local',
{
  successRedirect: '/',
  failureRedirect: '/login'
}))
.get('/', function(req, res)
{
  res.sendFile(__dirname + '/index.html');
})
.post('/', function(req, res)
{
  musicMorningId = req.body.musicMorningId;
  musicEveningId = req.body.musicEveningId;
  if(req.body.enable !== 'undefined')
  {
    canPlayMusic = req.body.enable;
  }
  res.redirect('/');
})
.get('/config', function(req, res)
{
  res.json(
  {
    enable : canPlayMusic,
    musicMorningId : musicMorningId,
    musicEveningId : musicEveningId
  });
})
.get('/playnow', function(req, res)
{
  playMusic(req.query.music)
  .then(function()
  {
    console.log('Kodi : Playing Music UI');
  });
})
;

app.listen(port, function()
{
  console.log(`Server listening ${port}`);
});
